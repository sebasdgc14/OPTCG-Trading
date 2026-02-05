import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthGuardOptions = {
  redirectTo?: string;
  tokenKey?: string;
};

type AuthGuardResult = {
  token: string | null;
  isAuthorized: boolean;
  isChecking: boolean;
};

const useAuthGuard = (options: AuthGuardOptions = {}): AuthGuardResult => {
  const { redirectTo = "/users/login", tokenKey = "token" } = options;
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(tokenKey);
    if (!storedToken) {
      navigate(redirectTo);
      setIsChecking(false);
      return;
    }

    setToken(storedToken);
    setIsChecking(false);
  }, [navigate, redirectTo, tokenKey]);

  return { token, isAuthorized: Boolean(token), isChecking };
};

export default useAuthGuard;
