export type AuthUser = {
  id: number;
  username: string;
  email?: string | null;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  initializeSession: () => void;
};
