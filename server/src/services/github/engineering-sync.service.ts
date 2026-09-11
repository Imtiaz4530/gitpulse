import { syncRepositoryCommits } from "./commit-sync.service";
import { syncRepositoryContributors } from "./contributor-sync.service";
import { syncRepositoryIssues } from "./issue-sync.service";
import { syncRepositoryPullRequests } from "./pull-request-sync.service";
import { syncRepositoryReleases } from "./release-sync.service";
import { syncPullRequestReviews } from "./review-sync.service";

import { RepositoryModel } from "../../models/Repository";
import { PullRequestModel } from "../../models/PullRequest";

interface SyncEngineeringDataResult {
  repositoryId: string;

  commits: {
    synced: number;
    created: number;
    updated: number;
  };

  pullRequests: {
    synced: number;
    created: number;
    updated: number;
  };

  issues: {
    synced: number;
    created: number;
    updated: number;
    skippedPullRequests: number;
  };

  reviews: {
    synced: number;
    created: number;
    updated: number;
  };

  contributors: {
    synced: number;
    created: number;
    updated: number;
  };

  releases: {
    synced: number;
    created: number;
    updated: number;
  };
}

export async function syncRepositoryEngineeringData(
  userId: string,
  repositoryId: string,
): Promise<SyncEngineeringDataResult> {
  const repository = await RepositoryModel.findOne({
    _id: repositoryId,
    userId,
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const commits = await syncRepositoryCommits(userId, repositoryId);

  const pullRequests = await syncRepositoryPullRequests(userId, repositoryId);

  const issues = await syncRepositoryIssues(userId, repositoryId);

  const contributors = await syncRepositoryContributors(userId, repositoryId);

  const releases = await syncRepositoryReleases(userId, repositoryId);

  let reviews = {
    synced: 0,
    created: 0,
    updated: 0,
  };

  const pullRequestsInDatabase = await PullRequestModel.find({
    repositoryId: repository._id,
  }).select("_id number");

  for (const pullRequest of pullRequestsInDatabase) {
    const result = await syncPullRequestReviews(
      userId,
      repositoryId,
      pullRequest._id.toString(),
    );

    reviews.synced += result.synced;
    reviews.created += result.created;
    reviews.updated += result.updated;
  }

  return {
    repositoryId,

    commits,

    pullRequests,

    issues,

    reviews,

    contributors,

    releases,
  };
}
