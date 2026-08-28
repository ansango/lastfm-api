import { z } from 'zod';
// Request schemas
export const authGetSessionRequestSchema = z.object({
    token: z.string(),
});
export const authGetMobileSessionRequestSchema = z.object({
    username: z.string(),
    password: z.string(),
});
// Entity schemas
export const sessionSchema = z.object({
    name: z.string(),
    key: z.string(),
    subscriber: z.number(),
});
export const tokenSchema = z.object({
    token: z.string(),
});
// Response schemas
export const authGetSessionResponseSchema = z.object({
    session: sessionSchema,
});
export const authGetTokenResponseSchema = z.object({
    token: z.string(),
    authUrl: z
        .string()
        .url()
        .optional()
        .describe('Pre-built Last.fm auth URL to open in a browser. Equivalent to `https://www.last.fm/api/auth/?api_key=<KEY>&token=<token>`. Open it, log in if prompted, click "Allow access", then pass the same token to `auth.getSession`.'),
});
export const authGetMobileSessionResponseSchema = z.object({
    session: sessionSchema,
});
//# sourceMappingURL=auth.schemas.js.map