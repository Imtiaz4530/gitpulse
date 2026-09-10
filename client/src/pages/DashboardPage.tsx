import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../features/auth/AuthContext";
import { startGitHubOAuth } from "../features/github/github.api";
import {
  useDisconnectGitHub,
  useGitHubStatus,
} from "../features/github/useGitHub";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { data, isLoading } = useGitHubStatus();
  const disconnectMutation = useDisconnectGitHub();

  const [searchParams, setSearchParams] = useSearchParams();

  const githubResult = searchParams.get("github");

  useEffect(() => {
    if (!githubResult) {
      return;
    }

    if (githubResult === "connected") {
      // Show success notification later
    }

    if (githubResult === "failed") {
      // Show error notification later
    }

    if (githubResult === "denied") {
      // Show cancellation message later
    }

    searchParams.delete("github");

    setSearchParams(searchParams, {
      replace: true,
    });
  }, [githubResult, searchParams, setSearchParams]);
  const handleConnectGitHub = async () => {
    try {
      const { authorizationUrl } = await startGitHubOAuth();

      window.location.href = authorizationUrl;
    } catch (error) {
      console.error("Failed to start GitHub OAuth", error);
    }
  };

  return (
    <main>
      <h1>GitPulse Dashboard</h1>

      <p>Welcome, {user?.name}</p>

      <p>{user?.email}</p>

      {isLoading ? (
        <p>Checking GitHub connection...</p>
      ) : data?.connected ? (
        <div>
          <img
            src={data.account?.avatarUrl ?? ""}
            alt={data.account?.username ?? "GitHub"}
          />

          <div>
            <strong>
              {data.account?.displayName ?? data.account?.username}
            </strong>

            <span>@{data.account?.username}</span>
          </div>

          <button
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
          >
            {disconnectMutation.isPending
              ? "Disconnecting..."
              : "Disconnect GitHub"}
          </button>
        </div>
      ) : (
        <button onClick={handleConnectGitHub}>Connect GitHub</button>
      )}
      <button onClick={logout}>Logout</button>
    </main>
  );
};

export default DashboardPage;
