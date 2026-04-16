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

profileRoutes.patch("/", requireAuth, async (c: Context) => {
    const user = c.get("user");
    const body = await c.req.parseBody();

    const bannerFile = body.banner;
    const bio = body.bio as string;
    const location = body.location as string;

    let bannerUrl: string | undefined;
    if (bannerFile && typeof bannerFile !== "string") {
        const ext = bannerFile.name.split(".").pop();
        const filename = `${user.id}.banner.${ext}`;
        const path = `uploads/${filename}`;

        await Bun.write(path, await bannerFile.arrayBuffer());

        bannerUrl = `/uploads/${filename}`;
    }

    await db
        .update(userProfiles)
        .set({
            ...(bio !== undefined && { bio }),
            ...(location !== undefined && { location }),
            ...(bannerUrl !== undefined && { bannerUrl }),
        })
        .where(eq(userProfiles.userId, user.id));

    return c.json({ message: 'success' });
});

export default profileRoutes;
