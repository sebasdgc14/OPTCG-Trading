import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import api, { setTokenGetter, setUnauthorizedHandler } from "../lib/api";
import {
  type AuthContextValue,
  type AuthUser,
  type LoginPayload,
} from "../types/auth";

const TOKEN_KEY = "token";

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

// wraps children in context
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // clears login information, removing token and user
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // sets user data, null if not available from the api response
  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get<AuthUser>("/profile");
      setUser(response.data);
    } catch {
      setUser(null);
    }
  }, []);

  // gets the token, were there no token it ends loading
  const initializeSession = useCallback(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  // POSTs credentials to api endpoint in OAuth2 format
  const login = useCallback(async (payload: LoginPayload) => {
    const response = await axios.post(
      "http://localhost:8000/login",
      new URLSearchParams(payload),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );
    const accessToken = response.data.access_token as string;
    localStorage.setItem(TOKEN_KEY, accessToken); // sets token in local storage
    setToken(accessToken); // sets it automatically at first
  }, []);

  // Trigger on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);
  // update when token changes
  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);
  // update the unauthorized handler
  useEffect(() => {
    setUnauthorizedHandler(() => logout);
  }, [logout]);
  // load profile when token changes
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    loadProfile();
  }, [token, loadProfile]);

  // to only change when a dependency does as well
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      initializeSession,
    }),
    [token, user, isLoading, login, logout, initializeSession],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
