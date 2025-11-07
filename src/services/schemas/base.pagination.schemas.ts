import { z } from "zod";

// Standard pagination
export const totalPagesSchema = z.string();
export const totalSchema = z.union([z.string(), z.number()]);
export const pageSchema = z.union([z.string(), z.number()]);
export const countSchema = z.union([z.string(), z.number()]);
export const limitSchema = z.union([z.string(), z.number()]);

// OpenSearch pagination
export const totalResultsSchema = z.string();
export const startIndexSchema = z.string();
export const itemsPerPageSchema = z.string();

// Inferred types
export type TotalPages = z.infer<typeof totalPagesSchema>;
export type Total = z.infer<typeof totalSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Count = z.infer<typeof countSchema>;
export type Limit = z.infer<typeof limitSchema>;
export type TotalResults = z.infer<typeof totalResultsSchema>;
export type StartIndex = z.infer<typeof startIndexSchema>;
export type ItemsPerPage = z.infer<typeof itemsPerPageSchema>;
