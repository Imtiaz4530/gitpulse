import { useAuth } from "../features/auth/AuthContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>GitPulse Dashboard</h1>

      <p>Welcome, {user?.name}</p>

      <p>{user?.email}</p>

      <button onClick={logout}>Logout</button>
    </main>
  );
};

export default DashboardPage;
