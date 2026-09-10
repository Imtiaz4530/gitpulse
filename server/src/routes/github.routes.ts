import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { startGitHubOAuth } from "../controllers/github-oauth.controller";

const router = Router();

router.get("/oauth/start", requireAuth, startGitHubOAuth);

export default router;
