import { z } from "zod";
export declare const totalPagesSchema: z.ZodString;
export declare const totalSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
export declare const pageSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
export declare const countSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
export declare const limitSchema: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
export declare const totalResultsSchema: z.ZodString;
export declare const startIndexSchema: z.ZodString;
export declare const itemsPerPageSchema: z.ZodString;
export type TotalPages = z.infer<typeof totalPagesSchema>;
export type Total = z.infer<typeof totalSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Count = z.infer<typeof countSchema>;
export type Limit = z.infer<typeof limitSchema>;
export type TotalResults = z.infer<typeof totalResultsSchema>;
export type StartIndex = z.infer<typeof startIndexSchema>;
export type ItemsPerPage = z.infer<typeof itemsPerPageSchema>;
//# sourceMappingURL=base.pagination.schemas.d.ts.map