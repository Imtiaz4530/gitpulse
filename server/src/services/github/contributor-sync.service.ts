import { ContributorModel } from "../../models/Contributor";
import { RepositoryModel } from "../../models/Repository";

import { listContributors } from "./github.api";
import { getGitHubAccessToken } from "./github-token.service";

interface SyncContributorsResult {
  synced: number;
  created: number;
  updated: number;
}

export async function syncRepositoryContributors(
  userId: string,
  repositoryId: string,
): Promise<SyncContributorsResult> {
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
    const result = await listContributors(
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

    for (const contributor of result.data) {
      // Anonymous contributors don't have a GitHub ID.
      // Our Contributor model requires githubId,
      // so skip them for now.
      if (contributor.id === undefined || contributor.login === undefined) {
        continue;
      }

      const existing = await ContributorModel.exists({
        repositoryId: repository._id,
        githubId: contributor.id,
      });

      const now = new Date();

      await ContributorModel.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubId: contributor.id,
        },
        {
          repositoryId: repository._id,

          githubId: contributor.id,

          login: contributor.login,

          avatarUrl: contributor.avatar_url ?? null,

          htmlUrl: contributor.html_url ?? null,

          contributions: contributor.contributions,

          firstSeenAt: existing ? undefined : now,

          lastSeenAt: now,
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
