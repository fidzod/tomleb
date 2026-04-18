import { eq } from "drizzle-orm";
import { db } from "./db";
import { sessions, users } from "./db/schema";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password);
}

export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return Bun.password.verify(password, hash);
}

function generateSessionToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Buffer.from(bytes).toString("hex");
}

export async function createSession(userId: number): Promise<string> {
    const token = generateSessionToken();
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    await db.insert(sessions).values({ id: token, userId, expiresAt });

    return token;
}

export async function validateSession(token: string) {
    const result = db
        .select()
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, token))
        .get();

    if (!result) return null;
    if (Date.now() > result.sessions.expiresAt) {
        await db.delete(sessions).where(eq(sessions.id, token));
        return null;
    }

    return result.users;
}

export async function invalidateSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, token));
}
