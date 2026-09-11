import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/auth";

import { SyncJobModel } from "../models/SyncJob";

export async function getSyncJob(req: AuthenticatedRequest, res: Response) {
  const job = await SyncJobModel.findOne({
    _id: req.params.jobId,
    userId: req.userId!,
  }).lean();

  if (!job) {
    res.status(404).json({
      success: false,
      code: "SYNC_JOB_NOT_FOUND",
      message: "Sync job not found.",
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: job,
  });
}
