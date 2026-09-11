import { IssueModel } from "../../models/Issue";
import { RepositoryModel } from "../../models/Repository";

import { listIssues } from "./github.api";
import { getGitHubAccessToken } from "./github-token.service";

interface SyncIssuesResult {
  synced: number;
  created: number;
  updated: number;
  skippedPullRequests: number;
}

export async function syncRepositoryIssues(
  userId: string,
  repositoryId: string,
): Promise<SyncIssuesResult> {
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
  let skippedPullRequests = 0;

  while (true) {
    const result = await listIssues(
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

    for (const githubIssue of result.data) {
      if (githubIssue.pull_request) {
        skippedPullRequests++;
        continue;
      }

      const existing = await IssueModel.exists({
        repositoryId: repository._id,
        githubId: githubIssue.id,
      });

      await IssueModel.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubId: githubIssue.id,
        },
        {
          repositoryId: repository._id,

          githubId: githubIssue.id,

          number: githubIssue.number,

          title: githubIssue.title,

          state: githubIssue.state,

          authorGithubId: githubIssue.user?.id ?? null,

          authorLogin: githubIssue.user?.login ?? null,

          authorAvatarUrl: githubIssue.user?.avatar_url ?? null,

          labels: githubIssue.labels.map((label) => ({
            name: label.name,
            color: label.color,
          })),

          assignees: githubIssue.assignees.map((assignee) => ({
            githubId: assignee.id,
            login: assignee.login,
            avatarUrl: assignee.avatar_url,
          })),

          commentsCount: githubIssue.comments,

          htmlUrl: githubIssue.html_url,

          createdAtGitHub: new Date(githubIssue.created_at),

          updatedAtGitHub: new Date(githubIssue.updated_at),

          closedAtGitHub: githubIssue.closed_at
            ? new Date(githubIssue.closed_at)
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
    skippedPullRequests,
  };
}
