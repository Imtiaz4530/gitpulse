import { Router } from "express";

import { requireAuth } from "../middlewares/auth.middleware";

import {
  getGitHubApiUser,
  getGitHubRepositories,
} from "../controllers/github.controller";

const router = Router();

router.get("/user", requireAuth, getGitHubApiUser);

router.get("/repositories", requireAuth, getGitHubRepositories);

export default router;
