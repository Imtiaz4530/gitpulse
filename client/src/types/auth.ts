export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  githubConnected: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;

  data: {
    accessToken: string;
    user: User;
  };
}
