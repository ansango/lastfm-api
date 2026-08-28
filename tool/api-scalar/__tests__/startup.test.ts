/**
 * Tests for the startup env validator (#103, PR-1 of epic).
 *
 * The entry point calls `validateOrExit()` before `createApp()`. If
 * `LASTFM_API_KEY` is missing, the tool prints a friendly error with
 * the create-form URL and a copy-pasteable `echo >> .env` snippet, then
 * exits with code 1. If `LASTFM_SHARED_SECRET` is missing, the tool
 * still starts but warns that signed calls will 401.
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
	formatSharedSecretWarning,
	formatStartupError,
	validateOrExit
} from '../src/startup.js';

/**
 * Sentinel thrown by the test `exit` shim. `validateOrExit` calls `exit(1)`
 * and then falls through to a `throw` to keep TS happy (the injected
 * `exit` is typed `(code: number) => void`, so TS doesn't know it never
 * returns). The test catches the sentinel.
 */
class FakeExit extends Error {
	constructor(public readonly code: number) {
		super(`fake exit(${code})`);
		this.name = 'FakeExit';
	}
}

const exitShim = (code: number) => {
	throw new FakeExit(code);
};

describe('formatStartupError', () => {
	it('includes the Last.fm create-account URL', () => {
		const msg = formatStartupError({ color: false });
		expect(msg).toContain('https://www.last.fm/api/account/create');
	});

	it('includes a copy-pasteable `echo ... >> .env` snippet for LASTFM_API_KEY', () => {
		const msg = formatStartupError({ color: false });
		expect(msg).toMatch(/echo\s+['"]?LASTFM_API_KEY=.*['"]?\s*>>\s*\.env/);
	});

	it('includes a copy-pasteable `echo ... >> .env` snippet for LASTFM_SHARED_SECRET', () => {
		const msg = formatStartupError({ color: false });
		expect(msg).toMatch(/echo\s+['"]?LASTFM_SHARED_SECRET=.*['"]?\s*>>\s*\.env/);
	});

	it('omits ANSI colour codes when color: false', () => {
		const msg = formatStartupError({ color: false });
		expect(msg).not.toContain('\u001b[');
	});

	it('includes ANSI colour codes when color: true', () => {
		const msg = formatStartupError({ color: true });
		expect(msg).toContain('\u001b[');
	});
});

describe('formatSharedSecretWarning', () => {
	it('names the missing var', () => {
		const msg = formatSharedSecretWarning({ color: false });
		expect(msg).toContain('LASTFM_SHARED_SECRET');
	});

	it('says read methods will still work', () => {
		const msg = formatSharedSecretWarning({ color: false });
		expect(msg.toLowerCase()).toContain('read methods');
	});

	it('says signed calls will fail', () => {
		const msg = formatSharedSecretWarning({ color: false });
		// the warning explains that signed methods need the secret
		expect(msg.toLowerCase()).toMatch(/sign(ed|ed methods)/);
	});
});

describe('validateOrExit', () => {
	let stderr: string[] = [];
	const origWrite = process.stderr.write.bind(process.stderr);

	beforeEach(() => {
		stderr = [];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		process.stderr.write = ((chunk: any) => {
			stderr.push(typeof chunk === 'string' ? chunk : chunk.toString());
			return true;
		}) as typeof process.stderr.write;
	});

	afterEach(() => {
		process.stderr.write = origWrite as typeof process.stderr.write;
	});

	it('returns the validated env when everything is set', () => {
		const result = validateOrExit({
			env: {
				LASTFM_API_KEY: 'abc',
				LASTFM_SHARED_SECRET: 'def',
				LASTFM_SESSION_KEY: 'ghi'
			},
			exit: exitShim,
			color: false
		});
		expect(result).toEqual({ apiKey: 'abc', sharedSecret: 'def', sessionKey: 'ghi' });
		expect(stderr.join('')).toBe('');
	});

	it('treats whitespace-only values as missing', () => {
		let code: number | undefined;
		try {
			validateOrExit({
				env: { LASTFM_API_KEY: '   ' },
				exit: exitShim,
				color: false
			});
		} catch (e) {
			expect(e).toBeInstanceOf(FakeExit);
			code = (e as FakeExit).code;
		}
		expect(code).toBe(1);
	});

	it('prints the startup error and exits 1 when LASTFM_API_KEY is missing', () => {
		let code: number | undefined;
		try {
			validateOrExit({
				env: {},
				exit: exitShim,
				color: false
			});
		} catch (e) {
			expect(e).toBeInstanceOf(FakeExit);
			code = (e as FakeExit).code;
		}
		expect(code).toBe(1);
		const out = stderr.join('');
		expect(out).toContain('missing LASTFM_API_KEY');
		expect(out).toContain('https://www.last.fm/api/account/create');
		expect(out).toMatch(/echo\s+['"]?LASTFM_API_KEY=.*['"]?\s*>>\s*\.env/);
	});

	it('starts and warns (does not exit) when LASTFM_API_KEY is set but LASTFM_SHARED_SECRET is not', () => {
		const result = validateOrExit({
			env: { LASTFM_API_KEY: 'abc' },
			exit: exitShim,
			color: false
		});
		expect(result).toEqual({ apiKey: 'abc', sharedSecret: undefined, sessionKey: undefined });
		const out = stderr.join('');
		expect(out).toContain('LASTFM_SHARED_SECRET');
	});

	it('treats an explicit empty string the same as a missing key', () => {
		let code: number | undefined;
		try {
			validateOrExit({
				env: { LASTFM_API_KEY: '' },
				exit: exitShim,
				color: false
			});
		} catch (e) {
			expect(e).toBeInstanceOf(FakeExit);
			code = (e as FakeExit).code;
		}
		expect(code).toBe(1);
	});

	it('treats a session key without api key as a fatal (cannot work)', () => {
		let code: number | undefined;
		try {
			validateOrExit({
				env: { LASTFM_SESSION_KEY: 'ghi' },
				exit: exitShim,
				color: false
			});
		} catch (e) {
			expect(e).toBeInstanceOf(FakeExit);
			code = (e as FakeExit).code;
		}
		expect(code).toBe(1);
	});
});
