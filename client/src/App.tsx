import { useQuery } from "@tanstack/react-query";
import { api } from "./lib/api";

interface HealthResponse {
  success: boolean;
  service: string;
  status: string;
  timestamp: string;
}

function App() {
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await api.get<HealthResponse>("/health");
      return response.data;
    },
  });

  if (isLoading) {
    return <div>Connecting to GitPulse API...</div>;
  }

  if (isError) {
    return <div>Unable to connect to GitPulse API.</div>;
  }

  return (
    <main>
      <h1>GitPulse</h1>

      <p>GitHub Engineering Intelligence Platform</p>

      <div>
        <strong>API:</strong> {data?.status}
      </div>
    </main>
  );
}

export default App;
