import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthGuard from "../lib/useAuthGuard";
type Profile = {
  id: number;
  username: string;
  email?: string | null;
};

function ProtectedPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const { token, isAuthorized, isChecking } = useAuthGuard();

  useEffect(() => {
    if (!isAuthorized || !token) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/users/login");
            return;
          }
          const detail = error.response?.data?.detail as string | undefined;
          setError(detail || "Failed to load profile.");
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthorized, navigate, token]);

  if (isChecking) {
    return <div>Checking session...</div>;
  }

  if (!isAuthorized) {
    return <div>Redirecting...</div>;
  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      {profile ? (
        <div>
          <div>Username: {profile.username}</div>
          {profile.email && <div>Email: {profile.email}</div>}
        </div>
      ) : (
        <div>No profile data.</div>
      )}
    </div>
  );
}

export default ProtectedPage;
