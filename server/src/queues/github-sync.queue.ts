import { Queue } from "bullmq";

import { redisConnection } from "../config/redis";

export const GITHUB_SYNC_QUEUE_NAME = "github-sync";

export const githubSyncQueue = new Queue(GITHUB_SYNC_QUEUE_NAME, {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5_000,
    },

    removeOnComplete: {
      age: 60 * 60 * 24,
      count: 1000,
    },

    removeOnFail: {
      age: 60 * 60 * 24 * 7,
      count: 5000,
    },
  },
});
