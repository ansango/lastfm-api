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

// Inferred types
export type Name = z.infer<typeof nameSchema>;
export type Mbid = z.infer<typeof mbidSchema>;
export type Url = z.infer<typeof urlSchema>;
export type Playcount = z.infer<typeof playcountSchema>;
export type Duration = z.infer<typeof durationSchema>;
export type Listeners = z.infer<typeof listenersSchema>;
export type Position = z.infer<typeof positionSchema>;
export type Published = z.infer<typeof publishedSchema>;
export type Summary = z.infer<typeof summarySchema>;
export type Content = z.infer<typeof contentSchema>;
export type Text = z.infer<typeof textSchema>;
export type Uts = z.infer<typeof utsSchema>;
export type Lang = z.infer<typeof langSchema>;
export type Match = z.infer<typeof matchSchema>;
export type Role = z.infer<typeof roleSchema>;
export type SearchTerms = z.infer<typeof searchTermsSchema>;
export type StartPage = z.infer<typeof startPageSchema>;
export type From = z.infer<typeof fromSchema>;
export type To = z.infer<typeof toSchema>;
export type For = z.infer<typeof forSchema>;
export type Loc = z.infer<typeof locSchema>;
export type Unixtime = z.infer<typeof unixtimeSchema>;
export type Reach = z.infer<typeof reachSchema>;
export type Period = z.infer<typeof periodSchema>;
