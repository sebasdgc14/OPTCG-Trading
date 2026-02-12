import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

const useAuth = () => {
  const context = useContext(AuthContext); //uses the context provided

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
