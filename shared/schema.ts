import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  youtubeId: text("youtube_id").notNull().unique(),
  title: text("title").notNull(),
  channel: text("channel").notNull(),
  duration: text("duration").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  status: text("status").notNull().default("ready"), // ready, active, error
  lastUsed: timestamp("last_used"),
  isActive: boolean("is_active").default(true),
});

export const viewingSessions = pgTable("viewing_sessions", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  duration: integer("duration").notNull(), // seconds watched
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  viewDuration: integer("view_duration").default(40),
  accountSwitchInterval: integer("account_switch_interval").default(3),
  autoShuffle: boolean("auto_shuffle").default(false),
  loopPlaylist: boolean("loop_playlist").default(true),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  addedAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  lastUsed: true,
  isActive: true,
});

export const insertViewingSessionSchema = createInsertSchema(viewingSessions).omit({
  id: true,
  viewedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type ViewingSession = typeof viewingSessions.$inferSelect;
export type InsertViewingSession = z.infer<typeof insertViewingSessionSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
