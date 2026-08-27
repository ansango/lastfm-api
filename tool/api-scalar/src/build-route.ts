/**
 * Generic Hono route + handler builder for the docs tool (HU4 of #92).
 *
 * Given a `MethodMeta` from the registry, produces a `createRoute({...})`
 * result and a Hono handler. The handler validates the input via the
 * Zod schema and invokes the corresponding `@ansango/lastfm-api`
 * method. Signing and Last.fm transport are handled inside the package
 * itself; the tool only routes the call.
 */
import { createRoute, type RouteConfig } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { z } from 'zod';

import type { MethodMeta } from '../../../src/method-registry.js';
import type { LastFmClient } from '../../../src/client.js';

const ERROR_SCHEMA = z.object({ message: z.string() }).openapi('LastFmError');

/**
 * Convert a method name like `getTopTags` to a path-friendly segment
 * like `get-top-tags`. Compound names are kebab-cased so the URLs read
 * naturally (`/track/get-top-tags` instead of `/track/getTopTags`).
 */
function kebab(name: string): string {
	return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * Build the `createRoute({...})` config for a single method. The
 * schemas from the registry are `ZodTypeAny`; the `createRoute` API
 * wants a narrower `ZodObject | ZodPipe` so we cast at the boundary.
 * Runtime validation is unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildRoute(meta: MethodMeta): RouteConfig {
	const path = `/${meta.ns}/${kebab(meta.name)}`;
	const tag = meta.ns;
	const schema = meta.schema as any;
	const response = meta.response as any;

	const request =
		meta.bodyKind === 'json'
			? { body: { content: { 'application/json': { schema } } } }
			: { query: schema };

	return createRoute({
		method: meta.httpMethod.toLowerCase() as 'get' | 'post',
		path,
		tags: [tag],
		summary: `${meta.id} (Last.fm)`,
		description: `Wire endpoint: \`/?method=${meta.id}\`. See https://www.last.fm/api/show/${meta.id}`,
		request,
		responses: {
			200: {
				description: 'Last.fm response (validated against the Zod response schema)',
				content: { 'application/json': { schema: response } }
			},
			400: {
				description: 'Invalid request parameters (Zod validation failed)',
				content: { 'application/json': { schema: ERROR_SCHEMA } }
			},
			500: {
				description: 'Last.fm error envelope or transport failure',
				content: { 'application/json': { schema: ERROR_SCHEMA } }
			}
		}
	});
}

/**
 * Build the Hono handler for a single method. The handler is typed
 * `any` at the public boundary because each route has its own inferred
 * request shape; the `bodyKind` discriminator selects the right
 * `c.req.valid(...)` target at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildHandler(meta: MethodMeta, client: LastFmClient): any {
	return async (c: Context) => {
		// Hono's `valid()` takes a target key ('json' or 'query'). The
		// `bodyKind` discriminator tells us which one to read. We cast
		// `c.req` to bypass the route-inferred narrowing — the runtime
		// check is correct, but TypeScript can't know the right key from
		// a generic Context.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const req = c.req as any;
		const params = (
			meta.bodyKind === 'json' ? req.valid('json') : req.valid('query')
		) as Record<string, unknown>;

		// Invoke the package method via the env-derived client. The
		// package internally handles api_key, sharedSecret and sk —
		// these are already baked into the client. `sk` in the params
		// still works because createClient sets it as `sessionKey` on
		// the config, but signedPost will throw if it's missing.
		try {
			const fn = meta.resolve(client);
			const result = await fn(params, undefined);
			return c.json(result, 200);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			return c.json({ message }, 500);
		}
	};
}
