import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import useAuth from "./useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
};

// provide component to render only if authenticated
const ProtectedRoute = ({
  children,
  redirectTo = "/users/login",
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
