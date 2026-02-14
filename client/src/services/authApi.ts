// src/services/authApi.ts
import { apiClient } from "./apiClient";

export type User = {
  id: number | string;
  name: string;
  email: string;
  role?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export async function registerApi(payload: { name: string; email: string; password: string; }) {
  const res = await apiClient.post<AuthResponse>("/auth/register", payload);
  return res.data;
}

export async function loginApi(payload: { email: string; password: string; }) {
  const res = await apiClient.post<AuthResponse>("/auth/login", payload);
  return res.data;
}
