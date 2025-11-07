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
//# sourceMappingURL=auth.schemas.d.ts.map