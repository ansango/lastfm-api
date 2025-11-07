import { z } from "zod";
import { nameSchema } from "./base.primitives.schemas.js";

// Entity name aliases
export const artistNameSchema = nameSchema;
export const albumNameSchema = nameSchema;
export const tagNameSchema = nameSchema;
export const trackNameSchema = nameSchema;
export const userNameSchema = nameSchema;

// Inferred types
export type ArtistName = z.infer<typeof artistNameSchema>;
export type AlbumName = z.infer<typeof albumNameSchema>;
export type TagName = z.infer<typeof tagNameSchema>;
export type TrackName = z.infer<typeof trackNameSchema>;
export type UserName = z.infer<typeof userNameSchema>;
