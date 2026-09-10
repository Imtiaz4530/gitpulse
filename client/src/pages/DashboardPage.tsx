import { useAuth } from "../features/auth/AuthContext";
import { startGitHubOAuth } from "../features/github/github.api";
const DashboardPage = () => {
  const { user, logout } = useAuth();

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

      <button onClick={handleConnectGitHub}>Connect GitHub</button>
      <button onClick={logout}>Logout</button>
    </main>
  );
};

export default DashboardPage;
