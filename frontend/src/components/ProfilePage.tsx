import { useEffect, useState } from "react";
import axios from "axios";
import api from "../lib/api";

type Profile = {
  id: number;
  username: string;
  email?: string | null;
};

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile");
        setProfile(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
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
  }, []);

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

export default ProfilePage;
