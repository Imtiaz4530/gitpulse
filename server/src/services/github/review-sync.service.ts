import { PullRequestModel } from "../../models/PullRequest";
import { RepositoryModel } from "../../models/Repository";
import { ReviewModel } from "../../models/Review";

import { listPullRequestReviews } from "./github.api";

import { getGitHubAccessToken } from "./github-token.service";

interface SyncReviewsResult {
  synced: number;
  created: number;
  updated: number;
}

export async function syncPullRequestReviews(
  userId: string,
  repositoryId: string,
  pullRequestId: string,
): Promise<SyncReviewsResult> {
  const repository = await RepositoryModel.findOne({
    _id: repositoryId,
    userId,
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const pullRequest = await PullRequestModel.findOne({
    _id: pullRequestId,
    repositoryId: repository._id,
  });

  if (!pullRequest) {
    throw new Error("Pull request not found");
  }

  const accessToken = await getGitHubAccessToken(userId);

  let page = 1;

  let synced = 0;
  let created = 0;
  let updated = 0;

  while (true) {
    const result = await listPullRequestReviews(
      accessToken,
      repository.ownerLogin,
      repository.name,
      pullRequest.number,
      {
        page,
        perPage: 100,
      },
    );

    if (result.data.length === 0) {
      break;
    }

    for (const githubReview of result.data) {
      const existing = await ReviewModel.exists({
        pullRequestId: pullRequest._id,

        githubId: githubReview.id,
      });

      await ReviewModel.findOneAndUpdate(
        {
          pullRequestId: pullRequest._id,

          githubId: githubReview.id,
        },
        {
          repositoryId: repository._id,

          pullRequestId: pullRequest._id,

          githubId: githubReview.id,

          reviewerGithubId: githubReview.user?.id ?? null,

          reviewerLogin: githubReview.user?.login ?? null,

          reviewerAvatarUrl: githubReview.user?.avatar_url ?? null,

          state: githubReview.state.toLowerCase(),

          body: githubReview.body ?? null,

          submittedAt: githubReview.submitted_at
            ? new Date(githubReview.submitted_at)
            : null,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      if (existing) {
        updated++;
      } else {
        created++;
      }

      synced++;
    }

    if (!result.pagination.next) {
      break;
    }

    page++;
  }

  return {
    synced,
    created,
    updated,
  };
}
