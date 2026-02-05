import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  // These are the states used, pretty self explanatory
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // To move through the frontend
  const navigate = useNavigate();

  // This is to validate the input of data, and set error flag in case of improper data
  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }
    setError("");
    return true;
  };

  //
  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axios.post(
        // Creating an async POST request to await response
        "http://localhost:8000/login", // from this endpoint
        new URLSearchParams({
          username: email, // some renaming schenanigans, nothing major
          password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }, // This is to parse it as OAuth2form data
        },
      );
      setLoading(false);
      localStorage.setItem("token", response.data.access_token); // to verify token when accessing subsequent protected pages
      navigate("/");
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail as string | undefined;
        setError(detail || "Authentication failed!");
        return;
      }
      setError("An error occurred. Please try again later");
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label> Email: </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label> Password: </label>
          <input
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
