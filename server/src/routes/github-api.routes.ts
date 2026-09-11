import { Router } from "express";

import { requireAuth } from "../middlewares/auth.middleware";

import {
  getGitHubApiUser,
  getGitHubRepositories,
  syncGitHubRepositories,
} from "../controllers/github.controller";

const router = Router();

router.get("/user", requireAuth, getGitHubApiUser);

router.get("/repositories", requireAuth, getGitHubRepositories);

router.post("/sync/repositories", requireAuth, syncGitHubRepositories);

export default router;
