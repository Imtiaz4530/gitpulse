import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  startGitHubOAuth,
  handleGitHubOAuthCallback,
  getGitHubStatus,
  disconnectGitHubAccount,
} from "../controllers/github-oauth.controller";

const router = Router();

router.post("/oauth/start", requireAuth, startGitHubOAuth);
router.get("/oauth/callback", handleGitHubOAuthCallback);

router.get("/status", requireAuth, getGitHubStatus);
router.delete("/disconnect", requireAuth, disconnectGitHubAccount);

export default router;
