import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/auth";
import { syncRepositories } from "../services/github/repository-sync.service";

import {
  getAuthenticatedUser,
  listRepositories,
} from "../services/github/github.api";

import { getGitHubAccessToken } from "../services/github/github-token.service";
import { syncRepositoryEngineeringData } from "../services/github/engineering-sync.service";
import {
  queueRepositorySync,
  queueEngineeringDataSync,
} from "../services/github-sync-queue.service";

import { SyncJobModel } from "../models/SyncJob";

export async function getGitHubApiUser(
  req: AuthenticatedRequest,
  res: Response,
) {
  const accessToken = await getGitHubAccessToken(req.userId!);

  const githubUser = await getAuthenticatedUser(accessToken);

  res.status(200).json({
    success: true,
    data: githubUser,
  });
}

export async function getGitHubRepositories(
  req: AuthenticatedRequest,
  res: Response,
) {
  const accessToken = await getGitHubAccessToken(req.userId!);

  const page = req.query.page ? Number(req.query.page) : 1;

  const perPage = req.query.perPage ? Number(req.query.perPage) : 100;

  const repositories = await listRepositories(accessToken, {
    page,
    perPage,
  });

  res.status(200).json({
    success: true,
    data: repositories.data,
    pagination: repositories.pagination,
  });
}

export async function syncGitHubRepositories(
  req: AuthenticatedRequest,
  res: Response,
) {
  const job = await queueRepositorySync({
    userId: req.userId!,
  });

  await SyncJobModel.create({
    userId: req.userId!,
    bullJobId: job.id!,
    type: "repository",
    status: "queued",
  });

  res.status(202).json({
    success: true,
    message: "GitHub repository synchronization queued.",
    data: {
      jobId: job.id,
      status: "queued",
    },
  });
}

export async function syncGitHubEngineeringData(
  req: AuthenticatedRequest,
  res: Response,
) {
  const repositoryId = req.params.repositoryId;

  const job = await queueEngineeringDataSync({
    userId: req.userId!,
    repositoryId,
  });

  await SyncJobModel.create({
    userId: req.userId!,

    repositoryId,

    bullJobId: job.id!,

    type: "engineering-data",

    status: "queued",
  });

  res.status(202).json({
    success: true,

    message: "GitHub engineering data synchronization queued.",

    data: {
      jobId: job.id,
      repositoryId,
      status: "queued",
    },
  });
}
