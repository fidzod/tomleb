import { Hono } from "hono";

import type { Variables } from "../types";

import { db } from "../db";
import { users, posts, postMedia, postLikes } from "../db/schema";
import { and, eq, inArray, sql, desc } from "drizzle-orm";

import { requireAuth, optionalAuth } from "../middleware";

const postsRoutes = new Hono<{ Variables: Variables }>();

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

postsRoutes.get("/", optionalAuth, async (c) => {
    const username = c.req.query('user');
    const currentUserId = c.get("user")?.id ?? null;

    const postResults = await db
        .select({
            id: posts.id,
            content: posts.content,
            postedAt: posts.postedAt,
            user: {
                id: users.id,
                username: users.username,
                displayName: users.displayName,
                avatarUrl: users.avatarUrl,
            },
            likeCount: sql<number>`count(${postLikes.postId})`,
            likedByMe: sql<number>`max(case when ${postLikes.userId} = ${currentUserId} then 1 else 0 end)`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(postLikes, eq(posts.id, postLikes.postId))
        .groupBy(posts.id)
        .where(username ? eq(users.username, username) : undefined)
        .orderBy(desc(posts.postedAt));

    const mediaResults = postResults.length === 0 ? [] : await db
        .select()
        .from(postMedia)
        .where(inArray(postMedia.postId, postResults.map(p => p.id)));

    const grouped = postResults.map(post => ({
        ...post,
        likedByMe: Boolean(post.likedByMe),
        media: mediaResults
            .filter(m => m.postId === post.id)
            .map(m => m.url),
    }));

    return c.json({ posts: grouped });
});

postsRoutes.post("/:postId/like", requireAuth, async (c) => {
    const userId = c.get("user").id;
    const postId = +c.req.param("postId");

    if (isNaN(postId)) return c.json({ error: "Invalid post id." }, 400);

    const post = db.select().from(posts).where(eq(posts.id, postId)).get();
    if (!post) return c.json({ error: "Post does not exist." }, 404);

    const postLike = db
        .select()
        .from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        .get();
    if (postLike) return c.json({ error: "Cannot like a post more than once." }, 404);

    await db
        .insert(postLikes)
        .values({ userId, postId });

    const newCount = db
        .select({ likeCount: sql<number>`count(*)` })
        .from(postLikes)
        .where(eq(postLikes.postId, postId))
        .get()!.likeCount;

    return c.json({ likeCount: newCount, likedByMe: true });
});

postsRoutes.delete("/:postId/like", requireAuth, async (c) => {
    const userId = c.get("user").id;
    const postId = +c.req.param("postId");

    if (isNaN(postId)) return c.json({ error: "Invalid post id." }, 400);

    const post = db.select().from(posts).where(eq(posts.id, postId)).get();
    if (!post) return c.json({ error: "Post does not exist." }, 404);

    await db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));


    const newCount = db
        .select({ likeCount: sql<number>`count(*)` })
        .from(postLikes)
        .where(eq(postLikes.postId, postId))
        .get()!.likeCount;

    return c.json({ likeCount: newCount, likedByMe: false });
});

export default postsRoutes;
