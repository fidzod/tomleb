import { Hono, Context } from "hono";

import { db } from "../db";
import { userProfiles, users } from "../db/schema";
import { eq } from "drizzle-orm";

import { requireAuth } from "../middleware";

const profileRoutes = new Hono();

profileRoutes.get("/:username", (c: Context) => {
    const username = c.req.param("username");

    if (!username) return c.json({ message: "User not found." }, 404);

    const profile = db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .get();

    if (!profile) return c.json({ message: "User not found." }, 404);

    const { userId, ...profileWithoutId } = profile.user_profiles;

    return c.json({
        profile: {
            ...profile.users,
            ...profileWithoutId,
        }
    });
});

profileRoutes.post("/upload-avatar", requireAuth, async (c: Context) => {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const file = body["avatar"];

    if (!file || typeof file === "string")
        return c.json({ error: "No file uploaded." }, 400);

    const ext = file.name.split(".").pop();
    const filename = `${user.id}.${ext}`;
    const path = `uploads/${filename}`;

    await Bun.write(path, await file.arrayBuffer());

    const avatarUrl = `/uploads/${filename}`;
    await db.update(users).set({ avatarUrl }).where(eq(users.id, user.id));

    return c.json({ avatarUrl });
});

profileRoutes.post("/upload-banner", requireAuth, async (c: Context) => {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const file = body["banner"];

    if (!file || typeof file === "string")
        return c.json({ error: "No file uploaded." }, 400);

    const ext = file.name.split(".").pop();
    const filename = `${user.id}.banner.${ext}`;
    const path = `uploads/${filename}`;

    await Bun.write(path, await file.arrayBuffer());

    const bannerUrl = `/uploads/${filename}`;
    await db
        .update(userProfiles)
        .set({ bannerUrl })
        .where(eq(userProfiles.userId, user.id));

    return c.json({ bannerUrl });
});

profileRoutes.post("/update", requireAuth, async (c: Context) => {
    const user = c.get("user");
    const { bio, location } = await c.req.json();

    if (bio)
        await db
            .update(userProfiles)
            .set({ bio })
            .where(eq(userProfiles.userId, user.id));

    if (location)
        await db
            .update(userProfiles)
            .set({ location })
            .where(eq(userProfiles.userId, user.id));

    return c.json({ message: 'success' });
});

export default profileRoutes;
