import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getGitHubStatus, disconnectGitHub } from "./github.api";

const githubStatusKey = ["github", "status"];

export function useGitHubStatus() {
  return useQuery({
    queryKey: githubStatusKey,
    queryFn: getGitHubStatus,
  });
}

export function useDisconnectGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectGitHub,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: githubStatusKey,
      });
    },
  });
}
