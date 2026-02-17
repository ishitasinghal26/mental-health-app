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

