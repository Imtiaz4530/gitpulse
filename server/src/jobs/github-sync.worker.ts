import { Worker, type Job } from "bullmq";

import { redisConnection } from "../config/redis";

import { GITHUB_SYNC_QUEUE_NAME } from "../queues/github-sync.queue";

import type {
  EngineeringDataSyncJobData,
  RepositorySyncJobData,
} from "../queues/github-sync.types";

import { syncRepositories } from "../services/github/repository-sync.service";

import { syncRepositoryEngineeringData } from "../services/github/engineering-sync.service";

import { SyncJobModel } from "../models/SyncJob";

type GitHubSyncJob = Job<RepositorySyncJobData | EngineeringDataSyncJobData>;

export const githubSyncWorker = new Worker(
  GITHUB_SYNC_QUEUE_NAME,

  async (job: GitHubSyncJob) => {
    const syncJob = await SyncJobModel.findOne({
      bullJobId: job.id,
    });

    if (syncJob) {
      await SyncJobModel.updateOne(
        {
          _id: syncJob._id,
        },
        {
          status: "active",
          attempts: job.attemptsMade + 1,
          startedAt: new Date(),
          errorMessage: null,
        },
      );
    }

    try {
      let result;

      if (job.name === "repository") {
        result = await syncRepositories(job.data.userId);
      } else if (job.name === "engineering-data") {
        result = await syncRepositoryEngineeringData(
          job.data.userId,
          job.data.repositoryId,
        );
      } else {
        throw new Error(`Unsupported GitHub sync job: ${job.name}`);
      }

      if (syncJob) {
        await SyncJobModel.updateOne(
          {
            _id: syncJob._id,
          },
          {
            status: "completed",
            result,
            completedAt: new Date(),
          },
        );
      }

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "GitHub sync failed.";

      if (syncJob) {
        await SyncJobModel.updateOne(
          {
            _id: syncJob._id,
          },
          {
            attempts: job.attemptsMade + 1,
            errorMessage: message,
          },
        );
      }

      throw error;
    }
  },

  {
    connection: redisConnection,

    concurrency: 2,
  },
);

githubSyncWorker.on("completed", async (job) => {
  console.log(`[GitHub Worker] Job completed: ${job.id}`);
});

githubSyncWorker.on("failed", async (job, error) => {
  if (!job) {
    return;
  }

  const syncJob = await SyncJobModel.findOne({
    bullJobId: job.id,
  });

  if (!syncJob) {
    return;
  }

  const finalAttempt = job.attemptsMade >= (job.opts.attempts ?? 1);

  if (finalAttempt) {
    await SyncJobModel.updateOne(
      {
        _id: syncJob._id,
      },
      {
        status: "failed",
        failedAt: new Date(),
        errorMessage: error.message,
      },
    );
  }

  console.error(`[GitHub Worker] Job failed: ${job.id}`, error.message);
});

githubSyncWorker.on("error", (error) => {
  console.error("[GitHub Worker] Worker error:", error);
});
