import { Hono, Context } from "hono";

import type { Variables } from "../types";

import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

import { requireAuth } from "../middleware";

const userRoutes = new Hono<{ Variables: Variables }>();

userRoutes.patch("/", requireAuth, async (c: Context) => {
    const user = c.get("user");
    const body = await c.req.parseBody();

    const avatarFile = body.avatar;
    const username = body.username as string;
    const displayName = body.displayName as string;

    let avatarUrl: string | undefined;
    if (avatarFile && typeof avatarFile !== "string") {
        const ext = avatarFile.name.split(".").pop();
        const filename = `${user.id}.${ext}`;
        const path = `uploads/${filename}`;

        await Bun.write(path, await avatarFile.arrayBuffer());

        avatarUrl = `/uploads/${filename}`;
    }

    await db
        .update(users)
        .set({
            ...(username !== undefined && { username }),
            ...(displayName !== undefined && { displayName }),
            ...(avatarUrl !== undefined && { avatarUrl }),
        })
        .where(eq(users.id, user.id));

    return c.json({ message: "success" });
});

export default userRoutes;
