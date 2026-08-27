import { z } from "zod";
export declare const imageSchema: z.ZodObject<{
    "#text": z.ZodString;
    size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
}, z.core.$strip>;
export declare const datePropSchema: z.ZodObject<{
    uts: z.ZodString;
    "#text": z.ZodString;
}, z.core.$strip>;
export type Image = z.infer<typeof imageSchema>;
export type DateProp = z.infer<typeof datePropSchema>;
//# sourceMappingURL=base.entities.schemas.d.ts.map