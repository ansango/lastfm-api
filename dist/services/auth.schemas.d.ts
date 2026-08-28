import { z } from 'zod';
export declare const authGetSessionRequestSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export declare const authGetMobileSessionRequestSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const sessionSchema: z.ZodObject<{
    name: z.ZodString;
    key: z.ZodString;
    subscriber: z.ZodNumber;
}, z.core.$strip>;
export declare const tokenSchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export declare const authGetSessionResponseSchema: z.ZodObject<{
    session: z.ZodObject<{
        name: z.ZodString;
        key: z.ZodString;
        subscriber: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const authGetTokenResponseSchema: z.ZodObject<{
    token: z.ZodString;
    authUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const authGetMobileSessionResponseSchema: z.ZodObject<{
    session: z.ZodObject<{
        name: z.ZodString;
        key: z.ZodString;
        subscriber: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AuthGetSessionRequest = z.infer<typeof authGetSessionRequestSchema>;
export type AuthGetMobileSessionRequest = z.infer<typeof authGetMobileSessionRequestSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Token = z.infer<typeof tokenSchema>;
export type AuthGetSessionResponse = z.infer<typeof authGetSessionResponseSchema>;
export type AuthGetTokenResponse = z.infer<typeof authGetTokenResponseSchema>;
export type AuthGetMobileSessionResponse = z.infer<typeof authGetMobileSessionResponseSchema>;
//# sourceMappingURL=auth.schemas.d.ts.map