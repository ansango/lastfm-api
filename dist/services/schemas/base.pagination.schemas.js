import { z } from 'zod';
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
//# sourceMappingURL=base.pagination.schemas.js.map