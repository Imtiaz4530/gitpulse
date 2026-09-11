import { PullRequestModel } from "../../models/PullRequest";
import { RepositoryModel } from "../../models/Repository";

import { getPullRequest, listPullRequests } from "./github.api";

import { getGitHubAccessToken } from "./github-token.service";

interface SyncPullRequestsResult {
  synced: number;
  created: number;
  updated: number;
}

export async function syncRepositoryPullRequests(
  userId: string,
  repositoryId: string,
): Promise<SyncPullRequestsResult> {
  const repository = await RepositoryModel.findOne({
    _id: repositoryId,
    userId,
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const accessToken = await getGitHubAccessToken(userId);

  let page = 1;

  let synced = 0;
  let created = 0;
  let updated = 0;

  while (true) {
    const result = await listPullRequests(
      accessToken,
      repository.ownerLogin,
      repository.name,
      {
        page,
        perPage: 100,
        state: "all",
      },
    );

    if (result.data.length === 0) {
      break;
    }

    for (const githubPullRequest of result.data) {
      const detail = await getPullRequest(
        accessToken,
        repository.ownerLogin,
        repository.name,
        githubPullRequest.number,
      );

      const existing = await PullRequestModel.exists({
        repositoryId: repository._id,
        githubId: detail.id,
      });

      const createdAt = new Date(detail.created_at);

      const mergedAt = detail.merged_at ? new Date(detail.merged_at) : null;

      const closedAt = detail.closed_at ? new Date(detail.closed_at) : null;

      const cycleTimeSeconds = mergedAt
        ? Math.max(
            0,
            Math.floor((mergedAt.getTime() - createdAt.getTime()) / 1000),
          )
        : null;

      const mergeTimeSeconds = mergedAt ? cycleTimeSeconds : null;

      await PullRequestModel.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubId: detail.id,
        },
        {
          repositoryId: repository._id,

          githubId: detail.id,
          number: detail.number,

          title: detail.title,

          state: detail.state,

          draft: detail.draft,

          merged: detail.merged ?? false,

          authorGithubId: detail.user?.id ?? null,

          authorLogin: detail.user?.login ?? null,

          authorAvatarUrl: detail.user?.avatar_url ?? null,

          htmlUrl: detail.html_url,

          headRef: detail.head.ref,

          baseRef: detail.base.ref,

          createdAtGitHub: createdAt,

          updatedAtGitHub: new Date(detail.updated_at),

          closedAtGitHub: closedAt,

          mergedAtGitHub: mergedAt,

          additions: detail.additions ?? 0,

          deletions: detail.deletions ?? 0,

          changedFiles: detail.changed_files ?? 0,

          commentsCount: detail.comments ?? 0,

          reviewCommentsCount: detail.review_comments ?? 0,

          cycleTimeSeconds,

          mergeTimeSeconds,
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
