import { ReleaseModel } from "../../models/Release";
import { RepositoryModel } from "../../models/Repository";

import { listReleases } from "./github.api";
import { getGitHubAccessToken } from "./github-token.service";

interface SyncReleasesResult {
  synced: number;
  created: number;
  updated: number;
}

export async function syncRepositoryReleases(
  userId: string,
  repositoryId: string,
): Promise<SyncReleasesResult> {
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
    const result = await listReleases(
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

    for (const githubRelease of result.data) {
      const existing = await ReleaseModel.exists({
        repositoryId: repository._id,
        githubId: githubRelease.id,
      });

      await ReleaseModel.findOneAndUpdate(
        {
          repositoryId: repository._id,
          githubId: githubRelease.id,
        },
        {
          repositoryId: repository._id,

          githubId: githubRelease.id,

          tagName: githubRelease.tag_name,

          name: githubRelease.name ?? null,

          body: githubRelease.body ?? null,

          draft: githubRelease.draft,

          prerelease: githubRelease.prerelease,

          authorGithubId: githubRelease.author?.id ?? null,

          authorLogin: githubRelease.author?.login ?? null,

          authorAvatarUrl: githubRelease.author?.avatar_url ?? null,

          htmlUrl: githubRelease.html_url,

          createdAtGitHub: new Date(githubRelease.created_at),

          publishedAtGitHub: githubRelease.published_at
            ? new Date(githubRelease.published_at)
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
