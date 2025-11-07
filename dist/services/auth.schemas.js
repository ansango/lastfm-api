import { z } from "zod";
// Request schemas
export const authGetSessionRequestSchema = z.object({
    token: z.string(),
    api_key: z.string(),
});
// Entity schemas
export const sessionSchema = z.object({
    name: z.string(),
    key: z.string(),
    subscriber: z.number(),
});
// Response schemas
export const authGetSessionResponseSchema = z.object({
    session: sessionSchema,
});
//# sourceMappingURL=auth.schemas.js.map