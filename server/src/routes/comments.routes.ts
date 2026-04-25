import { Hono } from "hono";

import type { Variables } from "../types";

import { db } from "../db";
import { users, comments, commentLikes, commentMedia } from "../db/schema";
import { and, eq, sql } from "drizzle-orm";

import { requireAuth } from "../middleware";

const commentsRoutes = new Hono<{ Variables: Variables }>();

const maxUploads = 10; /* todo: move to config */

// Create a reply to a comment
commentsRoutes.post("/:commentId/replies", requireAuth, async (c) => {
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
    const files = [body["media"]]
        .flat()
        .filter((f) => f instanceof File)
        .slice(0, maxUploads);
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

    for (const file of files) {
        const ext = file.name.split(".").pop();
        const filename = `${crypto.randomUUID()}.${ext}`;
        const path = `uploads/${filename}`;
        await Bun.write(path, await file.arrayBuffer());

        await db.insert(commentMedia).values({
            commentId: reply.id,
            url: `/uploads/${filename}`,
        });
    }

    return c.json({
        ...reply,
        replyingTo: {
            id: comment.user.id,
            username: comment.user.username,
        },
    });
});

commentsRoutes.post("/:commentId/like", requireAuth, async (c) => {
    const userId = c.get("user").id;
    const commentId = +c.req.param("commentId");

    if (isNaN(commentId)) return c.json({ error: "Invalid comment id." }, 400);

    const comment = db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .get();
    if (!comment) return c.json({ error: "Post does not exist." }, 404);

    const commentLike = db
        .select()
        .from(commentLikes)
        .where(
            and(
                eq(commentLikes.commentId, commentId),
                eq(commentLikes.userId, userId),
            ),
        )
        .get();

    if (commentLike)
        return c.json({ error: "Cannot like a post more than once." }, 400);

    await db.insert(commentLikes).values({ userId, commentId });

    const newCount = db
        .select({ likeCount: sql<number>`count(*)` })
        .from(commentLikes)
        .where(eq(commentLikes.commentId, commentId))
        .get()!.likeCount;

    return c.json({ likeCount: newCount, likedByMe: true });
});

commentsRoutes.delete("/:commentId/like", requireAuth, async (c) => {
    const userId = c.get("user").id;
    const commentId = +c.req.param("commentId");

    if (isNaN(commentId)) return c.json({ error: "Invalid comment id." }, 400);

    const comment = db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .get();
    if (!comment) return c.json({ error: "Comment does not exist." }, 404);

    await db
        .delete(commentLikes)
        .where(
            and(
                eq(commentLikes.commentId, commentId),
                eq(commentLikes.userId, userId),
            ),
        );

    const newCount = db
        .select({ likeCount: sql<number>`count(*)` })
        .from(commentLikes)
        .where(eq(commentLikes.commentId, commentId))
        .get()!.likeCount;

    return c.json({ likeCount: newCount, likedByMe: false });
});

export default commentsRoutes;
