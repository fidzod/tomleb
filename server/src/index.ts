import { Hono, Context } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { requireAuth } from "./middleware";

import authRoutes from "./routes/auth.routes.ts";
import postsRoutes from "./routes/posts.routes.ts";
import profileRoutes from "./routes/profile.routes.ts";
import userRoutes from "./routes/user.routes.ts";

const app = new Hono();

app.use(
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Cookie"],
    credentials: true,
  }),
);

app.use("/uploads/*", serveStatic({ root: "./" }));

app.route("/auth", authRoutes);
app.route("/posts", postsRoutes);
app.route("/profile", profileRoutes);
app.route("/user", userRoutes);

export default {
  port: 3000,
  fetch: app.fetch,
};
