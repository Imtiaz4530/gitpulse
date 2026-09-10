import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  startGitHubOAuth,
  handleGitHubOAuthCallback,
} from "../controllers/github-oauth.controller";

const router = Router();

router.post("/oauth/start", requireAuth, startGitHubOAuth);
router.get("/oauth/callback", handleGitHubOAuthCallback);

export default router;
