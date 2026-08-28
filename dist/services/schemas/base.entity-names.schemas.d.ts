import type { z } from 'zod';
export declare const artistNameSchema: z.ZodString;
export declare const albumNameSchema: z.ZodString;
export declare const tagNameSchema: z.ZodString;
export declare const trackNameSchema: z.ZodString;
export declare const userNameSchema: z.ZodString;
export type ArtistName = z.infer<typeof artistNameSchema>;
export type AlbumName = z.infer<typeof albumNameSchema>;
export type TagName = z.infer<typeof tagNameSchema>;
export type TrackName = z.infer<typeof trackNameSchema>;
export type UserName = z.infer<typeof userNameSchema>;
//# sourceMappingURL=base.entity-names.schemas.d.ts.map