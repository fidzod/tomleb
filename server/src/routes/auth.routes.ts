import { Hono, Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { users, userProfiles } from "../db/schema";
import { requireAuth } from "../middleware";

import {
    hashPassword,
    verifyPassword,
    createSession,
    invalidateSession,
} from "../auth";

const authRoutes = new Hono();

authRoutes.post("/register", async (c) => {
    const { email, password, username, displayName } = await c.req.json();

    const existing = db.select().from(users).where(eq(users.email, email)).get();
    if (existing) return c.json({ error: "Email already in use" }, 400);

    const usernameTaken = db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .get();
    if (usernameTaken) return c.json({ error: "Username taken" }, 400);

    const passwordHash = await hashPassword(password);
    const [user] = await db
        .insert(users)
        .values({ email, passwordHash, username, displayName })
        .returning();

    await db
        .insert(userProfiles)
        .values({
            userId: user.id,
            bio: null,
            location: null,
            bannerUrl: null
        });

    const token = await createSession(user.id);
    setCookie(c, "session", token, {
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ message: 'success', user });
});

authRoutes.post("/login", async (c) => {
    const { email, password } = await c.req.json();

    const user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user) return c.json({ error: "Invalid username or password" }, 400);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return c.json({ error: "Invalid username or password" }, 400);

    const token = await createSession(user.id);
    setCookie(c, "session", token, {
        httpOnly: true,
        sameSite: "Lax",
        maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ message: 'success', user });
});

authRoutes.post("/logout", async (c) => {
    const token = getCookie(c, "session");
    if (token) await invalidateSession(token);
    deleteCookie(c, "session");
    return c.json({ success: true });
});


authRoutes.get("/me", requireAuth, (c: Context) => {
    const user = c.get("user");
    return c.json({ message: 'success', user });
});

export default authRoutes;
