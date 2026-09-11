import { Router } from "express";

import { requireAuth } from "../middlewares/auth.middleware";

import {
  getGitHubApiUser,
  getGitHubRepositories,
  syncGitHubRepositories,
  syncGitHubEngineeringData,
} from "../controllers/github.controller";

const router = Router();

router.get("/user", requireAuth, getGitHubApiUser);

router.get("/repositories", requireAuth, getGitHubRepositories);

router.post("/sync/repositories", requireAuth, syncGitHubRepositories);

router.post(
  "/sync/repository/:repositoryId",
  requireAuth,
  syncGitHubEngineeringData,
);

export default router;
