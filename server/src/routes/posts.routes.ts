import { Hono } from "hono";

import { db } from "../db";
import { users, posts, postMedia } from "../db/schema";
import { eq } from "drizzle-orm";

import { requireAuth } from "../middleware";

const postsRoutes = new Hono();

const maxUploads = 10; /* todo: move to config */

postsRoutes.post("/", requireAuth, async (c) => {
    const user = c.get("user");
    const body = await c.req.parseBody({ all: true });

    const content = body["content"] as string;
    const files = [body["media"]]
        .flat()
        .filter((f) => f instanceof File)
        .slice(0, maxUploads);

    const postedAt = Date.now();

    const [post] = await db
        .insert(posts)
        .values({ userId: user.id, postedAt, content })
        .returning();

    for (const file of files) {
        const ext = file.name.split(".").pop();
        const filename = `${crypto.randomUUID()}.${ext}`;
        const path = `uploads/${filename}`;
        await Bun.write(path, await file.arrayBuffer());

        await db.insert(postMedia).values({
            postId: post.id,
            url: `/uploads/${filename}`,
        });
    }

    return c.json({ post });
});

postsRoutes.get("/", async (c) => {
    const username = c.req.query('user');
    let allPosts;

    if (username) {
        allPosts = await db
            .select()
            .from(posts)
            .leftJoin(postMedia, eq(posts.id, postMedia.postId))
            .innerJoin(users, eq(posts.userId, users.id))
            .where(eq(users.username, username));
    } else {
        allPosts = await db
            .select()
            .from(posts)
            .leftJoin(postMedia, eq(posts.id, postMedia.postId))
            .innerJoin(users, eq(posts.userId, users.id));
    }

    const grouped = allPosts.reduce((acc, row) => {
        const existing = acc.find((p) => p.id === row.posts.id);

        if (existing) {
            if (row.post_media) existing.media.push(row.post_media.url);
        } else {
            acc.push({
                id: row.posts.id,
                user: {
                    id: row.users.id,
                    username: row.users.username,
                    displayName: row.users.displayName,
                    avatarUrl: row.users.avatarUrl,
                },
                content: row.posts.content,
                postedAt: row.posts.postedAt,
                media: row.post_media ? [row.post_media.url] : [],
            });
        }

        return acc;
    }, [] as any[]);

    return c.json({ posts: grouped });
});

export default postsRoutes;
