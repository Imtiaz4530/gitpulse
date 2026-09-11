import { GitHubAccount } from "../../models/GitHubAccount";
import { RepositoryModel } from "../../models/Repository";

import { listRepositories } from "./github.api";
import { getGitHubAccessToken } from "./github-token.service";

interface SyncRepositoriesResult {
  synced: number;
  created: number;
  updated: number;
}

export async function syncRepositories(
  userId: string,
): Promise<SyncRepositoriesResult> {
  const githubAccount = await GitHubAccount.findOne({
    userId,
  }).select("_id");

  if (!githubAccount) {
    throw new Error("GitHub account not found");
  }

  const accessToken = await getGitHubAccessToken(userId);

  let page = 1;

  let synced = 0;
  let created = 0;
  let updated = 0;

  while (true) {
    const result = await listRepositories(accessToken, {
      page,
      perPage: 100,
    });

    if (result.data.length === 0) {
      break;
    }

    for (const githubRepository of result.data) {
      const existingRepository = await RepositoryModel.exists({
        userId,
        githubId: githubRepository.id,
      });

      await RepositoryModel.findOneAndUpdate(
        {
          userId,
          githubId: githubRepository.id,
        },
        {
          userId,
          githubAccountId: githubAccount._id,

          githubId: githubRepository.id,
          nodeId: githubRepository.node_id,

          ownerGithubId: githubRepository.owner.id,
          ownerLogin: githubRepository.owner.login,

          name: githubRepository.name,
          fullName: githubRepository.full_name,

          description: githubRepository.description,

          private: githubRepository.private,
          fork: githubRepository.fork,
          archived: githubRepository.archived,
          disabled: githubRepository.disabled,

          htmlUrl: githubRepository.html_url,

          defaultBranch: githubRepository.default_branch,

          visibility: githubRepository.visibility,

          language: githubRepository.language,

          stars: githubRepository.stargazers_count,
          watchers: githubRepository.watchers_count,
          forks: githubRepository.forks_count,
          openIssues: githubRepository.open_issues_count,

          size: githubRepository.size,

          githubCreatedAt: new Date(githubRepository.created_at),

          githubUpdatedAt: new Date(githubRepository.updated_at),

          githubPushedAt: githubRepository.pushed_at
            ? new Date(githubRepository.pushed_at)
            : null,

          syncedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      if (existingRepository) {
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
