import axios from "axios";

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// placeholder functions
let getToken: TokenGetter = () => null;
let onUnauthorized: UnauthorizedHandler | null = null;

// update the token getter with the one provided in the AuthProvider
export const setTokenGetter = (tokenGetter: TokenGetter) => {
  getToken = tokenGetter;
};

// update the authorization handler with the one provided in the AuthProvider
export const setUnauthorizedHandler = (
  unauthorizedHandler: UnauthorizedHandler,
) => {
  onUnauthorized = unauthorizedHandler;
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    return Promise.reject(error);
  },
);

export default api;
