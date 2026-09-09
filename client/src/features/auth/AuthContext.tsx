import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth.api";

import { type User } from "../../types/auth";
import { setAccessToken as setApiAccessToken } from "../../lib/api";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;

  accessToken: string | null;

  isLoading: boolean;

  isAuthenticated: boolean;

  register: (input: RegisterInput) => Promise<void>;

  login: (input: LoginInput) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAuthToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await refreshAccessToken();

        setAuthToken(token);
        setApiAccessToken(token);

        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch {
        setAuthToken(null);
        setApiAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (input: RegisterInput) => {
    const result = await registerUser(input);

    setApiAccessToken(result.data.accessToken);

    setUser(result.data.user);
  };

  const login = async (input: LoginInput) => {
    const result = await loginUser(input);

    setApiAccessToken(result.data.accessToken);

    setUser(result.data.user);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setApiAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
