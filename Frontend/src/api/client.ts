import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getAuthToken = (): string => {
  return localStorage.getItem("authToken") || "";
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message =
        error.response.data?.error ||
        error.response.data?.message ||
        "An error occurred";
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
