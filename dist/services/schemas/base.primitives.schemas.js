import { z } from "zod";
// String primitives
export const nameSchema = z.string();
export const mbidSchema = z.string();
export const urlSchema = z.string();
export const playcountSchema = z.string();
export const durationSchema = z.string();
export const listenersSchema = z.string();
export const positionSchema = z.string();
export const publishedSchema = z.string();
export const summarySchema = z.string();
export const contentSchema = z.string();
export const textSchema = z.string();
export const utsSchema = z.string();
export const indexSchema = z.string();
export const langSchema = z.string();
export const matchSchema = z.string();
export const roleSchema = z.string();
export const searchTermsSchema = z.string();
export const startPageSchema = z.string();
export const fromSchema = z.string();
export const toSchema = z.string();
export const forSchema = z.string();
export const locSchema = z.string();
// Number primitives
export const unixtimeSchema = z.number();
export const reachSchema = z.number();
// Enum types
export const periodSchema = z.union([
    z.literal("overall"),
    z.literal("7day"),
    z.literal("1month"),
    z.literal("3month"),
    z.literal("6month"),
    z.literal("12month"),
]);
//# sourceMappingURL=base.primitives.schemas.js.map