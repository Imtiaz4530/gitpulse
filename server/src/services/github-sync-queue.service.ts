import type { Job } from "bullmq";

import { githubSyncQueue } from "../queues/github-sync.queue";

import type {
  EngineeringDataSyncJobData,
  RepositorySyncJobData,
} from "../queues/github-sync.types";

export async function queueRepositorySync(
  data: RepositorySyncJobData,
): Promise<Job> {
  return githubSyncQueue.add("repository", data);
}

export async function queueEngineeringDataSync(
  data: EngineeringDataSyncJobData,
): Promise<Job> {
  return githubSyncQueue.add("engineering-data", data);
}
