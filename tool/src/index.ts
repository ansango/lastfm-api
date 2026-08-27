/**
 * Entry point for the local docs server (#92).
 *
 * Run with:
 *   bun run tool:dev
 *
 * Env vars (use `tool/.env`, see `.env.example`):
 *   - LASTFM_API_KEY         (required for any "Try it" call)
 *   - LASTFM_SHARED_SECRET   (required for signed methods)
 *   - LASTFM_SESSION_KEY     (required for write methods)
 *   - PORT                   (default: 3000)
 */
import { config as loadEnv } from 'dotenv';
import { createApp } from './server.js';
import { mountOpenAPI } from './doc.js';

// .env is optional; tools may inject via shell instead.
loadEnv({ path: `${import.meta.dir}/../.env` });

const app = createApp();
mountOpenAPI(app, { serverUrl: `http://localhost:${process.env['PORT'] ?? '3000'}` });

const port = Number.parseInt(process.env['PORT'] ?? '3000', 10);

export default {
	port,
	fetch: app.fetch
};
