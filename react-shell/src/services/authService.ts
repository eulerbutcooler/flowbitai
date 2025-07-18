import axios from "axios";
import { ScreensResponse, AuthResponse } from "../types";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data as AuthResponse;
  },

  async getScreens(): Promise<ScreensResponse> {
    const response = await api.get("/api/me/screens");
    return response.data as ScreensResponse;
  },

  logout() {
    localStorage.removeItem("token");
  },
};
