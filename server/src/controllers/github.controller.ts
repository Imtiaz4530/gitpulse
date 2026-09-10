import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/auth";

import {
  getAuthenticatedUser,
  listRepositories,
} from "../services/github/github.api";

import { getGitHubAccessToken } from "../services/github/github-token.service";

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
