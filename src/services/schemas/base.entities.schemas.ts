import { z } from "zod";
import { textSchema, utsSchema } from "./base.primitives.schemas.js";

// Complex entity schemas
export const imageSchema = z.object({
  "#text": textSchema,
  size: z.union([
    z.literal("small"),
    z.literal("medium"),
    z.literal("large"),
    z.literal("extralarge"),
    z.literal("mega"),
  ]),
});

export const datePropSchema = z.object({
  uts: utsSchema,
  "#text": textSchema,
});

// Inferred types
export type Image = z.infer<typeof imageSchema>;
export type DateProp = z.infer<typeof datePropSchema>;
