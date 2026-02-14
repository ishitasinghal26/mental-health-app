// src/services/apiClient.ts
import axios from "axios";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// helper to set auth header when token available
export function setAuthToken(token: string | null) {
  if (token) apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete apiClient.defaults.headers.common["Authorization"];
}
