<<<<<<< HEAD
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
});

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

=======
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
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
