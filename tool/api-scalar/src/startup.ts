/**
 * Startup env validation for the local docs server (#103, PR-1 of epic).
 *
 * `tool/api-scalar/` is a development convenience — it runs the full
 * OpenAPI surface against the real Last.fm API. It needs three env vars
 * to do anything useful:
 *
 *   LASTFM_API_KEY         (required)  every Last.fm call needs this
 *   LASTFM_SHARED_SECRET   (optional but recommended)
 *                                    signed methods (POST writes +
 *                                    all 3 auth methods) need it
 *   LASTFM_SESSION_KEY     (optional)
 *                                    write methods need it; can be
 *                                    passed per-request via the
 *                                    `x-lastfm-sk` header instead
 *
 * If `LASTFM_API_KEY` is missing, the tool is useless. Rather than fail
 * later with a stack trace, this module prints a friendly, copy-pasteable
 * error and `process.exit(1)`s. The URL points at the Last.fm create
 * form; the snippet is a one-liner that drops the user's key into `.env`.
 *
 * If `LASTFM_SHARED_SECRET` is missing, the tool still starts (read
 * methods work) but signed calls will 401. We print a warning so the
 * user knows.
 *
 * `validateOrExit()` is exported for the entry; `formatStartupError()`
 * and `formatSharedSecretWarning()` are exported for tests.
 */

const CREATE_ACCOUNT_URL = 'https://www.last.fm/api/account/create';
const ENV_FILE_RELATIVE = '.env';
const RED = '\u001b[31m';
const YELLOW = '\u001b[33m';
const BOLD = '\u001b[1m';
const DIM = '\u001b[2m';
const RESET = '\u001b[0m';

/**
 * Build the multi-line error message shown when `LASTFM_API_KEY` is missing.
 * Colour codes are included; callers may strip them for log files.
 */
export function formatStartupError(opts: { color?: boolean } = {}): string {
	const c = opts.color ?? true;
	const r = (s: string) => (c ? s : '');
	return [
		'',
		`${r(RED)}${r(BOLD)}tool: missing LASTFM_API_KEY${r(RESET)}`,
		'',
		`Every Last.fm call needs an API key. Register one for free at:`,
		`  ${r(BOLD)}${CREATE_ACCOUNT_URL}${r(RESET)}`,
		'',
		`Then drop it into your repo-root .env:`,
		`  ${r(DIM)}# repo root (one level above tool/api-scalar/)${r(RESET)}`,
		`  ${r(BOLD)}echo 'LASTFM_API_KEY=your-key-here' >> ${ENV_FILE_RELATIVE}${r(RESET)}`,
		`  ${r(BOLD)}echo 'LASTFM_SHARED_SECRET=your-secret-here' >> ${ENV_FILE_RELATIVE}${r(RESET)}`,
		'',
		`Restart \`bun run tool:dev\` after saving.`,
		''
	].join('\n');
}

/**
 * Build the multi-line warning shown when `LASTFM_SHARED_SECRET` is missing.
 * Tool still starts; signed calls will fail at request time.
 */
export function formatSharedSecretWarning(opts: { color?: boolean } = {}): string {
	const c = opts.color ?? true;
	const r = (s: string) => (c ? s : '');
	return [
		`${r(YELLOW)}tool: LASTFM_SHARED_SECRET is not set${r(RESET)}`,
		`  Read methods will work. Signed calls (POST writes, all 3 auth methods) will 401.`,
		`  Add it to ${ENV_FILE_RELATIVE} to enable the full surface.`
	].join('\n');
}

/**
 * Snapshot the relevant env vars and call sites.
 * Reads from `process.env` by default; accepts an `env` override for tests.
 */
function readEnv(env: Record<string, string | undefined>): {
	apiKey: string | undefined;
	sharedSecret: string | undefined;
	sessionKey: string | undefined;
} {
	return {
		apiKey: env['LASTFM_API_KEY']?.trim() || undefined,
		sharedSecret: env['LASTFM_SHARED_SECRET']?.trim() || undefined,
		sessionKey: env['LASTFM_SESSION_KEY']?.trim() || undefined
	};
}

/**
 * Print the error, exit(1). Returns void for the type system; never
 * returns to the caller.
 */
export function failAndExit(
	message: string,
	opts: { exit?: (code: number) => void; color?: boolean } = {}
): never {
	const { exit = (code) => process.exit(code), color = true } = opts;
	process.stderr.write(`${formatStartupError({ color })}\n`);
	exit(1);
	// `exit` is typed `(code: number) => void` so TS doesn't know it
	// terminates the process. The throw makes the `never` honest and
	// also protects tests where the injected `exit` is a no-op.
	throw new Error('failAndExit: reached unreachable code');
}

/**
 * Validate env, print warnings or errors, and (if missing required vars)
 * exit. `exit` is injectable for tests so the test runner doesn't kill
 * itself.
 */
export function validateOrExit(opts: {
	env?: Record<string, string | undefined>;
	exit?: (code: number) => void;
	color?: boolean;
} = {}): { apiKey: string; sharedSecret?: string; sessionKey?: string } {
	const env = opts.env ?? (process.env as Record<string, string | undefined>);
	const color = opts.color ?? process.stdout.isTTY ?? false;
	const exit = opts.exit ?? ((code) => process.exit(code));

	const { apiKey, sharedSecret, sessionKey } = readEnv(env);

	if (!apiKey) {
		failAndExit(formatStartupError({ color }), { exit, color });
	}

	if (!sharedSecret) {
		process.stderr.write(`${formatSharedSecretWarning({ color })}\n`);
	}

	return { apiKey, sharedSecret, sessionKey };
}
