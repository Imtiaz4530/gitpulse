import { GitHubAccount } from "../../models/GitHubAccount";
import { AppError } from "../../utils/AppError";
import { decryptToken } from "../../utils/encryption";

export async function getGitHubAccessToken(userId: string): Promise<string> {
  const account = await GitHubAccount.findOne({
    userId,
  });

  if (!account) {
    throw new AppError(
      "GITHUB_NOT_CONNECTED",
      404,
      "GitHub account is not connected.",
    );
  }

  if (
    account.accessTokenExpiresAt &&
    account.accessTokenExpiresAt.getTime() <= Date.now()
  ) {
    throw new AppError(
      "GITHUB_TOKEN_EXPIRED",
      401,
      "GitHub access token has expired.",
    );
  }

  return decryptToken(account.accessTokenEncrypted);
}
