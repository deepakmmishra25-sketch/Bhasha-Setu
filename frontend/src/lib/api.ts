import axios from "axios";

// Relative base URL — Next.js rewrites (/api/*) proxy to the FastAPI backend.
// Works in all environments: local dev, Replit preview, and production.
export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/** Read the access token from the Zustand persisted auth store. */
function getStoredToken(key: "accessToken" | "refreshToken"): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("bhashasetu-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.[key] ?? null;
  } catch {
    return null;
  }
}

/** Clear auth from localStorage and the access_token cookie. */
function clearAuth() {
  try {
    localStorage.removeItem("bhashasetu-auth");
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  } catch { /* ignore */ }
}

// Request interceptor — attach Bearer token from Zustand store
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = getStoredToken("refreshToken");
        if (refreshToken) {
          const { data } = await axios.post("/api/v1/auth/refresh", {
            refresh_token: refreshToken,
          });
          // Update persisted store with new access token
          const raw = localStorage.getItem("bhashasetu-auth");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state) {
              parsed.state.accessToken = data.access_token;
              localStorage.setItem("bhashasetu-auth", JSON.stringify(parsed));
              document.cookie = `access_token=${data.access_token}; path=/; max-age=1800; SameSite=Lax`;
            }
          }
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(original);
        }
      } catch {
        clearAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
