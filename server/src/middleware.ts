import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { validateSession } from "./auth";

export const requireAuth = createMiddleware(async (c, next) => {
  const token = getCookie(c, "session");
  if (!token) return c.json({ error: "Unauthorised" }, 401);

  const user = await validateSession(token);
  if (!user) return c.json({ error: "Unauthorised" }, 401);

  c.set("user", user);
  await next();
});
