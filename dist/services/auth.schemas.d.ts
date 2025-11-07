import { z } from "zod";
export declare const authGetSessionRequestSchema: z.ZodObject<{
    token: z.ZodString;
    api_key: z.ZodString;
}, z.core.$strip>;
export declare const sessionSchema: z.ZodObject<{
    name: z.ZodString;
    key: z.ZodString;
    subscriber: z.ZodNumber;
}, z.core.$strip>;
export declare const authGetSessionResponseSchema: z.ZodObject<{
    session: z.ZodObject<{
        name: z.ZodString;
        key: z.ZodString;
        subscriber: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AuthGetSessionRequest = z.infer<typeof authGetSessionRequestSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type AuthGetSessionResponse = z.infer<typeof authGetSessionResponseSchema>;
//# sourceMappingURL=auth.schemas.d.ts.map