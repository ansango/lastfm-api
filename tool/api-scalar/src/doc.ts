/**
 * OpenAPI doc + Scalar UI wiring (HU2 of #92).
 *
 * Mounts:
 *  - `GET /doc`  — raw OpenAPI 3.0 JSON
 *  - `GET /`     — Scalar API reference UI
 */
import { Scalar } from '@scalar/hono-api-reference';
import { name as pkgName, version as pkgVersion } from '../../../package.json' with { type: 'json' };
import type { OpenAPIHono } from '@hono/zod-openapi';

const PKG_NAME = typeof pkgName === 'string' ? pkgName : '@ansango/lastfm-api';
const PKG_VERSION = typeof pkgVersion === 'string' ? pkgVersion : '0.0.0';

export function mountOpenAPI(app: OpenAPIHono, opts: { serverUrl?: string } = {}): void {
	const serverUrl = opts.serverUrl ?? process.env.DOCS_SERVER_URL ?? 'http://localhost:3000';

	app.doc('/doc', {
		openapi: '3.0.0',
		info: {
			title: `${PKG_NAME} — local docs server`,
			version: PKG_VERSION,
			description:
				'Interactive API explorer for @ansango/lastfm-api. All 57 canonical Last.fm methods are wired declaratively from the method registry; "Try it" calls the real Last.fm API via the package.'
		},
		servers: [{ url: serverUrl, description: 'Local docs server' }]
	});

	app.get(
		'/',
		// Scalar's `HtmlRenderingConfiguration` type is narrow; the full
		// set of options (`showToolbar`, `defaultOpenAllTags`, ...) lives
		// on `ApiReferenceConfigurationWithSource` and is not re-exported
		// by `@scalar/hono-api-reference`. The runtime accepts all of
		// them, so we cast to widen.
		Scalar({
			url: '/doc',
			pageTitle: `${PKG_NAME} — API reference`,
			showToolbar: 'never',
			defaultOpenAllTags: true
		} as Parameters<typeof Scalar>[0])
	);
}
