import { describe, expect, test } from 'bun:test'
import { buildMarkdown, type FileSection, parse } from '../../tool/ci-summary.js'

/**
 * Unit tests for the CI summary script.
 *
 * The script is exercised end-to-end by the GitHub Actions workflow, but
 * these tests cover the parts that are easy to break: the parser, which
 * has to accept both `::group::` (real bytes bun writes to disk in CI)
 * and `##[group]` (how the runner renders them in the log viewer), and
 * the markdown builder, which has to aggregate counts and escape
 * characters correctly.
 */

describe('parse()', () => {
	test('parses bun output without group prefix (local default)', () => {
		const input = [
			'bun test v1.4.0',
			'',
			'src/__tests__/album.test.ts:',
			'(pass) album service > getInfo > routes to album.getInfo [1.5ms]',
			'(pass) album service > getInfo > passes optional mbid [0.3ms]',
			'',
			'src/__tests__/artist.test.ts:',
			'(fail) artist service > getInfo > routes to artist.getInfo [0.5ms]',
			'(skip) artist service > getSimilar > passes limit [0.1ms]',
			'',
			' 4 pass',
			' 1 fail',
			' 1 skip',
			' 6 expect() calls',
			'Ran 6 tests across 2 files. [50.00ms]',
		].join('\n')

		const sections = parse(input.split('\n'))
		expect(sections).toHaveLength(2)
		expect(sections[0].name).toBe('src/__tests__/album.test.ts')
		expect(sections[0].tests).toHaveLength(2)
		expect(sections[0].tests[0]).toEqual({
			status: 'pass',
			name: 'album service > getInfo > routes to album.getInfo',
			ms: 1.5,
		})
		expect(sections[0].tests[1].status).toBe('pass')
		expect(sections[1].name).toBe('src/__tests__/artist.test.ts')
		expect(sections[1].tests).toHaveLength(2)
		expect(sections[1].tests[0].status).toBe('fail')
		expect(sections[1].tests[1].status).toBe('skip')
	})

	test('accepts ::group:: prefix (real bytes bun writes in CI)', () => {
		const input = [
			'bun test v1.4.0',
			'',
			'::group::src/__tests__/album.test.ts:',
			'(pass) album > getInfo [1ms]',
			'::endgroup::',
			'::group::src/__tests__/artist.test.ts:',
			'(pass) artist > getInfo [1ms]',
			'::endgroup::',
		].join('\n')

		const sections = parse(input.split('\n'))
		expect(sections).toHaveLength(2)
		expect(sections[0].name).toBe('src/__tests__/album.test.ts')
		expect(sections[0].tests).toHaveLength(1)
		expect(sections[1].tests).toHaveLength(1)
	})

	test('accepts ##[group] prefix (how the runner renders the same bytes)', () => {
		const input = ['##[group]src/__tests__/track.test.ts:', '(pass) track > getInfo [0.5ms]', '##[endgroup]'].join('\n')

		const sections = parse(input.split('\n'))
		expect(sections).toHaveLength(1)
		expect(sections[0].tests[0].name).toBe('track > getInfo')
	})

	test('returns empty array when no test files are present', () => {
		const sections = parse('bun test v1.4.0\n\n 0 pass\n 0 fail'.split('\n'))
		expect(sections).toHaveLength(0)
	})

	test('does not match nested paths that are not under src/__tests__/', () => {
		const sections = parse(['other/dir/foo.test.ts:', '(pass) x [1ms]'].join('\n').split('\n'))
		expect(sections).toHaveLength(0)
	})
})

describe('buildMarkdown()', () => {
	const sections: FileSection[] = [
		{
			name: 'src/__tests__/album.test.ts',
			tests: [
				{ status: 'pass', name: 'album > getInfo', ms: 1.5 },
				{ status: 'pass', name: 'album > search', ms: 0.3 },
				{ status: 'fail', name: 'album > broken', ms: 0.2 },
			],
		},
		{
			name: 'src/__tests__/artist.test.ts',
			tests: [
				{ status: 'pass', name: 'artist > getInfo', ms: 0.4 },
				{ status: 'skip', name: 'artist > todo', ms: 0 },
			],
		},
	]

	test('aggregates counts correctly and picks a ❌ head when any test failed', () => {
		const md = buildMarkdown(sections, '12345', 'https://example/runs/12345')
		expect(md).toContain('## ❌ Test Summary')
		expect(md).toContain('**3 passed** · **1 failed** · **1 skipped**')
	})

	test('picks ✅ when everything passed and ⚠️ when only skipped remain', () => {
		const allPass = sections[0].tests.map((t) => ({ ...t, status: 'pass' as const }))
		const onlySkip = sections[0].tests.map((t) => ({ ...t, status: 'skip' as const }))
		expect(buildMarkdown([{ name: sections[0].name, tests: allPass }], '1', 'x')).toContain('## ✅')
		expect(buildMarkdown([{ name: sections[0].name, tests: onlySkip }], '1', 'x')).toContain('## ⚠️')
	})

	test('per-file table strips the src/__tests__/ prefix and .test.ts suffix', () => {
		const md = buildMarkdown(sections, '1', 'x')
		expect(md).toContain('| `album` | 2 | 1 | 0 |')
		expect(md).toContain('| `artist` | 1 | 0 | 1 |')
	})

	test('includes the run URL in the header sub-line', () => {
		const md = buildMarkdown(sections, '12345', 'https://example/runs/12345')
		expect(md).toContain('[12345](https://example/runs/12345)')
	})

	test('contains the dedup marker so a re-run can PATCH instead of POSTing again', () => {
		const md = buildMarkdown(sections, '1', 'x')
		expect(md.startsWith('<!-- Mavis-test-summary -->')).toBe(true)
	})

	test('collapsible section lists every test with its emoji and elapsed ms', () => {
		const md = buildMarkdown(sections, '1', 'x')
		expect(md).toContain('<details><summary>All test names</summary>')
		expect(md).toContain('| ✅ | `album` › album > getInfo | 2ms |')
		expect(md).toContain('| ❌ | `album` › album > broken | 0ms |')
		expect(md).toContain('| ⏭️ | `artist` › artist > todo | 0ms |')
		expect(md.trimEnd().endsWith('</details>')).toBe(true)
	})
})
