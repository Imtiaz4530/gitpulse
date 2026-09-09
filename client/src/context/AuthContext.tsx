import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  clearAuthData,
  getToken,
  getUser,
  setAuthData,
  type AuthUser,
} from "../lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(getUser);
  const [token, setToken] = useState<string | null>(getToken);

  const login = (newToken: string, newUser: AuthUser) => {
    setAuthData(newToken, newUser);

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearAuthData();

    setToken(null);
    setUser(null);
  };

  // Keep authentication state synchronized with localStorage.
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(getToken());
      setUser(getUser());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
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
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};
