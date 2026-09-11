export type GitHubSyncJobName = "repository" | "engineering-data";

export interface RepositorySyncJobData {
  userId: string;
}

export interface EngineeringDataSyncJobData {
  userId: string;
  repositoryId: string;
}

export type GitHubSyncJobData =
  | RepositorySyncJobData
  | EngineeringDataSyncJobData;
