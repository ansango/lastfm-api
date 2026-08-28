#!/usr/bin/env bun
/**
 * Posts (or updates) a visual test summary on the current PR.
 *
 * Reads `test-output.log` from the working directory (written by the
 * preceding `bun test` step in the CI workflow), parses the bun:test
 * output, builds a markdown table with per-file counts and a
 * collapsible section listing every test by name, and POSTs (or
 * PATCHes) a comment on the PR.
 *
 * Env vars (set by the workflow):
 *   GITHUB_TOKEN     token with pull-requests:write + issues:write
 *   PR_NUMBER        the PR to comment on
 *   RUN_ID, RUN_URL  shown in the summary header as a link to the run
 *
 * Invariants
 * ----------
 * - Pure parse/build functions are exported for unit testing.
 * - `main()` only runs when this file is the entry point
 *   (`import.meta.main`), so importing the file in tests does not
 *   trigger a network call.
 * - Exits 0 on no-test-output so the workflow step still passes when
 *   the `bun test` step itself ran green; the failure (if any) was
 *   already caught by the preceding "Assert tests passed" step.
 */

const MARKER = '<!-- Mavis-test-summary -->'
const REPO = 'ansango/lastfm-api'
const INPUT_FILE = 'test-output.log'

const EMOJI = { pass: '✅', fail: '❌', skip: '⏭️' } as const
type Status = keyof typeof EMOJI

export interface TestEntry {
	status: Status
	name: string
	ms: number
}

export interface FileSection {
	name: string
	tests: TestEntry[]
}

// bun:test writes `::group::<title>::` workflow commands to its stdout
// when GITHUB_ACTIONS is set; the runner renders those as `##[group]`
// in the log viewer, but the bytes on disk are `::group::`. Accept both.
const FILE_HEADER_RE = /^(?:##\[group\]|::group::)?(src\/__tests__\/.+\.test\.ts):\s*$/
const RESULT_LINE_RE = /^\((pass|fail|skip)\)\s+(.+?)\s+\[([\d.]+)ms\]\s*$/

export function parse(lines: string[]): FileSection[] {
	const sections: FileSection[] = []
	let current: FileSection | null = null
	for (const line of lines) {
		const fileMatch = line.match(FILE_HEADER_RE)
		if (fileMatch) {
			current = { name: fileMatch[1], tests: [] }
			sections.push(current)
			continue
		}
		const resultMatch = line.match(RESULT_LINE_RE)
		if (resultMatch && current) {
			current.tests.push({
				status: resultMatch[1] as Status,
				name: resultMatch[2],
				ms: Number.parseFloat(resultMatch[3]),
			})
		}
	}
	return sections
}

function relFile(name: string): string {
	return name.replace('src/__tests__/', '').replace('.test.ts', '')
}

function headEmojiFor(totals: Record<Status, number>): string {
	if (totals.fail > 0) return '❌'
	if (totals.skip > 0) return '⚠️'
	return '✅'
}

export function buildMarkdown(sections: FileSection[], runId: string, runUrl: string): string {
	const totals: Record<Status, number> = { pass: 0, fail: 0, skip: 0 }
	for (const s of sections) for (const t of s.tests) totals[t.status]++

	let md = `${MARKER}\n## ${headEmojiFor(totals)} Test Summary\n\n`
	md += `**${totals.pass} passed** · **${totals.fail} failed** · **${totals.skip} skipped**\n\n`
	md += `<sub>Run: [${runId}](${runUrl})</sub>\n\n`

	md += `| File | ✅ | ❌ | ⏭️ |\n|---|---:|---:|---:|\n`
	for (const s of sections) {
		const rel = relFile(s.name)
		const p = s.tests.filter((t) => t.status === 'pass').length
		const f = s.tests.filter((t) => t.status === 'fail').length
		const k = s.tests.filter((t) => t.status === 'skip').length
		md += `| \`${rel}\` | ${p} | ${f} | ${k} |\n`
	}
	md += `| **Total** | **${totals.pass}** | **${totals.fail}** | **${totals.skip}** |\n\n`

	md += `<details><summary>All test names</summary>\n\n`
	md += `| Status | Test | Time |\n|---|---:|---|\n`
	for (const s of sections) {
		const rel = relFile(s.name)
		for (const t of s.tests) {
			md += `| ${EMOJI[t.status]} | \`${rel}\` › ${t.name} | ${t.ms.toFixed(0)}ms |\n`
		}
	}
	md += `\n</details>\n`

	return md
}

interface GhResponse<T> {
	status: number
	data: T
}

async function gh<T = unknown>(
	method: 'GET' | 'POST' | 'PATCH',
	path: string,
	token: string,
	body?: unknown,
): Promise<GhResponse<T>> {
	const res = await fetch(`https://api.github.com${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'Content-Type': 'application/json',
			'User-Agent': 'Mavis-CI',
			'X-GitHub-Api-Version': '2022-11-28',
		},
		body: body ? JSON.stringify(body) : undefined,
	})
	const data = (res.status === 204 ? null : await res.json()) as T
	return { status: res.status, data }
}

export async function run(opts: {
	token: string
	prNumber: string
	runId: string
	runUrl: string
	inputFile?: string
}): Promise<{ action: 'created' | 'updated' | 'skipped'; commentId?: number; reason?: string }> {
	const { token, prNumber, runId, runUrl, inputFile = INPUT_FILE } = opts

	let text: string
	try {
		text = await Bun.file(inputFile).text()
	} catch {
		console.log(`${inputFile} not found; skipping summary`)
		return { action: 'skipped', reason: 'input file missing' }
	}

	const sections = parse(text.split('\n'))
	if (sections.length === 0) {
		console.log('no test output parsed; skipping summary')
		return { action: 'skipped', reason: 'no test output parsed' }
	}

	const md = buildMarkdown(sections, runId, runUrl)

	const list = await gh<Array<{ id: number; body: string }>>(
		'GET',
		`/repos/${REPO}/issues/${prNumber}/comments?per_page=100`,
		token,
	)
	const existing = list.data.find((c) => c.body.startsWith(MARKER))

	if (existing) {
		const res = await gh<unknown>('PATCH', `/repos/${REPO}/issues/comments/${existing.id}`, token, { body: md })
		console.log(`updated comment ${existing.id} (status ${res.status})`)
		return { action: 'updated', commentId: existing.id }
	}

	const res = await gh<{ id: number }>('POST', `/repos/${REPO}/issues/${prNumber}/comments`, token, { body: md })
	console.log(`posted comment ${res.data.id} (status ${res.status})`)
	return { action: 'created', commentId: res.data.id }
}

async function main(): Promise<void> {
	const token = process.env.GITHUB_TOKEN
	const prNumber = process.env.PR_NUMBER
	const runId = process.env.RUN_ID
	const runUrl = process.env.RUN_URL
	if (!token || !prNumber || !runId || !runUrl) {
		console.error('Missing required env vars: GITHUB_TOKEN, PR_NUMBER, RUN_ID, RUN_URL')
		process.exit(1)
	}
	await run({ token, prNumber, runId, runUrl })
}

if (import.meta.main) {
	main().catch((err) => {
		console.error(err)
		process.exit(1)
	})
}
