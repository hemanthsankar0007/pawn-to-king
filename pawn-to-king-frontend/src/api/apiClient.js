import axios from "axios";

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:5000/api";
  }

  const { hostname, origin, port } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isViteLocalPort = port === "5173" || port === "4173";

  if (isLocalhost || isViteLocalPort) {
    return "http://localhost:5000/api";
  }

  return `${origin}/api`;
};

const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ptk_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
