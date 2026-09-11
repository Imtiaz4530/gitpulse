import { Router } from "express";

import { requireAuth } from "../middlewares/auth.middleware";

import { getSyncJob } from "../controllers/sync-job.controller";

const router = Router();

router.get("/:jobId", requireAuth, getSyncJob);

export default router;
