import { api } from "../../lib/api";
import type { AuthResponse, User } from "../../types/auth";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", input);

  return response.data;
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", input);

  return response.data;
};

export const refreshAccessToken = async (): Promise<string> => {
  const response = await api.post<{
    success: boolean;
    data: {
      accessToken: string;
    };
  }>("/auth/refresh");

  return response.data.data.accessToken;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{
    success: boolean;
    data: {
      user: User;
    };
  }>("/users/me");

  return response.data.data.user;
};
