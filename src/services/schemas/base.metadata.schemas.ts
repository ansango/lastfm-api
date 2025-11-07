import { z } from "zod";

// User-specific metadata
export const ageSchema = z.string();
export const subscriberSchema = z.string();
export const realNameSchema = z.string();
export const bootstrapSchema = z.string();
export const genderSchema = z.string();
export const typeSchema = z.string();
export const countrySchema = z.string();
export const playlistsSchema = z.string();

// Count types
export const artistCountSchema = z.string();
export const albumCountSchema = z.string();
export const trackCountSchema = z.string();

// Rank
export const rankSchema = z.string();

// Inferred types
export type Age = z.infer<typeof ageSchema>;
export type Subscriber = z.infer<typeof subscriberSchema>;
export type RealName = z.infer<typeof realNameSchema>;
export type Bootstrap = z.infer<typeof bootstrapSchema>;
export type Gender = z.infer<typeof genderSchema>;
export type Type = z.infer<typeof typeSchema>;
export type Country = z.infer<typeof countrySchema>;
export type Playlists = z.infer<typeof playlistsSchema>;
export type ArtistCount = z.infer<typeof artistCountSchema>;
export type AlbumCount = z.infer<typeof albumCountSchema>;
export type TrackCount = z.infer<typeof trackCountSchema>;
export type Rank = z.infer<typeof rankSchema>;
