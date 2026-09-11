import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import githubRoutes from "./routes/github.routes";
import githubApiRoutes from "./routes/github-api.routes";
import syncJobRoutes from "./routes/sync-job.routes";

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (_req, res) => {
  res.json({
    name: "GitPulse API",
    version: "1.0.0",
    status: "running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/github", githubApiRoutes);
app.use("/api/sync-jobs", syncJobRoutes);

app.use(errorHandler);

export default app;
