import type { Job } from "bullmq";

import { githubSyncQueue } from "../queues/github-sync.queue";

import { SyncJobModel } from "../models/SyncJob";

import type {
  EngineeringDataSyncJobData,
  RepositorySyncJobData,
} from "../queues/github-sync.types";

export async function queueRepositorySync(
  data: RepositorySyncJobData,
): Promise<{
  job: Job;
  syncJobId: string;
}> {
  const jobId = `repository-sync-${data.userId}-${Date.now()}`;

  const syncJob = await SyncJobModel.create({
    userId: data.userId,

    bullJobId: jobId,

    type: "repository",

    status: "queued",
  });

  try {
    const job = await githubSyncQueue.add("repository", data, {
      jobId,
    });

    return {
      job,
      syncJobId: syncJob._id.toString(),
    };
  } catch (error) {
    await SyncJobModel.updateOne(
      {
        _id: syncJob._id,
      },
      {
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Failed to queue sync job.",
        failedAt: new Date(),
      },
    );

    throw error;
  }
}

export async function queueEngineeringDataSync(
  data: EngineeringDataSyncJobData,
): Promise<{
  job: Job;
  syncJobId: string;
}> {
  const jobId = `engineering-sync-${data.repositoryId}-${Date.now()}`;

  const syncJob = await SyncJobModel.create({
    userId: data.userId,

    repositoryId: data.repositoryId,

    bullJobId: jobId,

    type: "engineering-data",

    status: "queued",
  });

  try {
    const job = await githubSyncQueue.add("engineering-data", data, {
      jobId,
    });

    return {
      job,
      syncJobId: syncJob._id.toString(),
    };
  } catch (error) {
    await SyncJobModel.updateOne(
      {
        _id: syncJob._id,
      },
      {
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Failed to queue sync job.",
        failedAt: new Date(),
      },
    );

    throw error;
  }
}
