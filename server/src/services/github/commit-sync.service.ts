import { CommitModel } from "../../models/Commit";
import { RepositoryModel } from "../../models/Repository";

import { getRepositoryCommit, listRepositoryCommits } from "./github.api";

import { getGitHubAccessToken } from "./github-token.service";

interface SyncCommitsResult {
  synced: number;
  created: number;
  updated: number;
}

export async function syncRepositoryCommits(
  userId: string,
  repositoryId: string,
): Promise<SyncCommitsResult> {
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
    const result = await listRepositoryCommits(
      accessToken,
      repository.ownerLogin,
      repository.name,
      {
        page,
        perPage: 100,
      },
    );

    if (result.data.length === 0) {
      break;
    }

    for (const githubCommit of result.data) {
      const commitDetail = await getRepositoryCommit(
        accessToken,
        repository.ownerLogin,
        repository.name,
        githubCommit.sha,
      );

      const existing = await CommitModel.exists({
        repositoryId: repository._id,
        githubSha: githubCommit.sha,
      });

      const author = githubCommit.author;

      const committer = githubCommit.committer;

      const commitAuthor = githubCommit.commit.author;

      const commitCommitter = githubCommit.commit.committer;

      await CommitModel.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubSha: githubCommit.sha,
        },
        {
          repositoryId: repository._id,

          githubSha: githubCommit.sha,

          authorGithubId: author?.id ?? null,

          authorLogin: author?.login ?? null,

          authorName: commitAuthor?.name ?? null,

          authorEmail: commitAuthor?.email ?? null,

          committerGithubId: committer?.id ?? null,

          committerLogin: committer?.login ?? null,

          message: githubCommit.commit.message,

          htmlUrl: githubCommit.html_url,

          authoredAt: commitAuthor?.date
            ? new Date(commitAuthor.date)
            : new Date(
                githubCommit.committer?.date ??
                  githubCommit.commit.author?.date ??
                  Date.now(),
              ),

          committedAt: commitCommitter?.date
            ? new Date(commitCommitter.date)
            : new Date(commitAuthor?.date ?? Date.now()),

          additions: commitDetail.stats?.additions ?? 0,

          deletions: commitDetail.stats?.deletions ?? 0,

          totalChanges: commitDetail.stats?.total ?? 0,
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
