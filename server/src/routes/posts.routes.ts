import { Hono } from "hono";

import type { Variables } from "../types";

import { db } from "../db";
import { users, posts, postMedia, postLikes, comments } from "../db/schema";
import {
    and,
    eq,
    inArray,
    sql,
    desc,
    isNull,
    aliasedTable,
    isNotNull,
} from "drizzle-orm";

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
    const username = c.req.query("user");
    const postId = c.req.query("postId");
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
            commentCount: sql<number>`(
                select count(*)
                from ${comments}
                where ${comments.postId} = ${posts.id}
                and ${comments.parentId} is null
            )`,
            likeCount: sql<number>`count(${postLikes.postId})`,
            likedByMe: sql<number>`max(case when ${postLikes.userId} = ${currentUserId} then 1 else 0 end)`,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .leftJoin(postLikes, eq(posts.id, postLikes.postId))
        .groupBy(posts.id)
        .where(
            username
                ? eq(users.username, username)
                : postId
                  ? eq(posts.id, parseInt(postId))
                  : undefined,
        )
        .orderBy(desc(posts.postedAt));

    const mediaResults =
        postResults.length === 0
            ? []
            : await db
                  .select()
                  .from(postMedia)
                  .where(
                      inArray(
                          postMedia.postId,
                          postResults.map((p) => p.id),
                      ),
                  );

    const grouped = postResults.map((post) => ({
        ...post,
        likedByMe: Boolean(post.likedByMe),
        media: mediaResults
            .filter((m) => m.postId === post.id)
            .map((m) => m.url),
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
    if (postLike)
        return c.json({ error: "Cannot like a post more than once." }, 404);

    await db.insert(postLikes).values({ userId, postId });

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

// Get the comments for a post with replies
postsRoutes.get("/:postId/comments", async (c) => {
    const postId = parseInt(c.req.param("postId") as string);

    if (isNaN(postId)) return c.json({ message: "Post does not exist." }, 404);

    const post = db.select().from(posts).where(eq(posts.id, postId)).get();
    if (!post) return c.json({ error: "Post does not exist." }, 404);

    const topLevelComments = await db
        .select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            postId: comments.postId,
            parentId: comments.parentId,
            user: {
                id: users.id,
                username: users.username,
                displayName: users.displayName,
                avatarUrl: users.avatarUrl,
            },
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(and(eq(comments.postId, postId), isNull(comments.parentId)))
        .orderBy(desc(comments.createdAt));

    const replyingToUsers = aliasedTable(users, "replyingToUsers");

    const allReplies = await db
        .select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            replyingTo: {
                id: replyingToUsers.id,
                username: replyingToUsers.username,
            },
            parentId: comments.parentId,
            postId: comments.postId,
            user: {
                id: users.id,
                username: users.username,
                displayName: users.displayName,
                avatarUrl: users.avatarUrl,
            },
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(replyingToUsers, eq(comments.replyingTo, replyingToUsers.id))
        .where(and(isNotNull(comments.parentId), eq(comments.postId, postId)))
        .orderBy(desc(comments.createdAt));

    const map = new Map();

    for (const c of [...topLevelComments, ...allReplies])
        map.set(c.id, { ...c, replies: [] });

    const roots = [];

    for (const c of map.values()) {
        if (c.parentId === null) {
            roots.push(c);
        } else {
            const parent = map.get(c.parentId);
            if (parent) parent.replies.push(c);
        }
    }

    return c.json({ comments: roots });
});

// Create top-level comment
postsRoutes.post("/:postId/comments", requireAuth, async (c) => {
    const postId = parseInt(c.req.param("postId") as string);

    if (isNaN(postId)) return c.json({ message: "Post does not exist." }, 404);

    const post = db.select().from(posts).where(eq(posts.id, postId)).get();
    if (!post) return c.json({ error: "Post does not exist." }, 404);

    const user = c.get("user");

    // Using FormData to eventually support images in comments
    const body = await c.req.parseBody({ all: true });

    const content = body["content"] as string;
    const parentId = null;
    const replyingTo = null;

    const createdAt = Date.now();

    const [comment] = await db
        .insert(comments)
        .values({
            content,
            postId,
            replyingTo,
            parentId,
            createdAt,
            userId: user.id,
        })
        .returning();

    return c.json({ comment });
});

// Create a reply to a comment
postsRoutes.post("/comments/:commentId/replies", requireAuth, async (c) => {
    const commentId = parseInt(c.req.param("commentId"));
    if (!commentId) return c.json({ message: "Comment does not exist." }, 404);

    const comment = db
        .select({
            postId: comments.postId,
            user: {
                id: users.id,
                username: users.username,
            },
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.id, commentId))
        .get();
    if (!comment) return c.json({ error: "Comment does not exist." }, 404);

    const postId = comment.postId;
    const user = c.get("user");
    const body = await c.req.parseBody({ all: true });
    const content = body["content"] as string;
    const createdAt = Date.now();

    const [reply] = await db
        .insert(comments)
        .values({
            content,
            postId,
            parentId: commentId,
            createdAt,
            userId: user.id,
            replyingTo: comment.user.id,
        })
        .returning();

    return c.json({
        ...reply,
        replyingTo: {
            id: comment.user.id,
            username: comment.user.username,
        },
    });
});

export default postsRoutes;
