import { GitHubAccount } from "../models/GitHubAccount";
import User from "../models/User";

export async function getGitHubConnectionStatus(userId: string) {
  const account = await GitHubAccount.findOne({
    userId,
  }).lean();

  if (!account) {
    return {
      connected: false,
      account: null,
    };
  }

  return {
    connected: true,
    account: {
      githubId: account.githubId,
      username: account.username,
      displayName: account.displayName,
      avatarUrl: account.avatarUrl,
      profileUrl: account.profileUrl,
      connectedAt: account.connectedAt,
      scopes: account.scopes,
    },
  };
}

export async function disconnectGitHub(userId: string) {
  const account = await GitHubAccount.findOne({
    userId,
  });

  if (!account) {
    return {
      disconnected: false,
    };
  }

  await GitHubAccount.deleteOne({
    _id: account._id,
  });

  await User.findByIdAndUpdate(userId, {
    githubConnected: false,
  });

  return {
    disconnected: true,
  };
}
