import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../auth/useAuth";

function Login() {
  const redirectUrl: string = "/";
  // States and navigtion
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // This is to validate the input of data, and set error flag in case of improper data
  const validateForm = () => {
    if (!email || !password) {
      setError("Credentials required");
      return false;
    }
    setError("");
    return true;
  };

  // handling the submit with proper typing
  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return; // validate fields
    setLoading(true);
    // connection and retrieval attempt
    try {
      await login({
        username: email,
        password,
      });
      navigate(redirectUrl);
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail as string | undefined;
        setError(detail || "Authentication failed.");
        return;
      }
      setError("An unexpeceted error ocurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label> Email: </label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label> Password: </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in ..." : "Login"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
export default Login;
