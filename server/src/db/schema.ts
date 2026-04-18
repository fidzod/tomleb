import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    username: text("username").notNull().unique(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
});

export const userProfiles = sqliteTable("user_profiles", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    bio: text("bio"),
    location: text("location"),
    bannerUrl: text("banner_url"),
});

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: integer("expires_at").notNull(),
});

export const posts = sqliteTable("posts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    content: text("content"),
    postedAt: integer("posted_at").notNull(),
    likes: integer("likes").default(0),
});

export const postMedia = sqliteTable("post_media", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
        .notNull()
        .references(() => posts.id),
    url: text("url").notNull(),
});

export const postLikes = sqliteTable("post_likes", {
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    postId: integer("post_id")
        .notNull()
        .references(() => posts.id),
});

export const comments = sqliteTable("comments", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
        .notNull()
        .references(() => posts.id),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    parentId: integer("parent_id"),
    replyingTo: integer("replying_to").references(() => users.id),
    content: text("content"),
    createdAt: integer("created_at").notNull(),
});
