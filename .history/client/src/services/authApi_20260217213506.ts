<<<<<<< HEAD
import { apiClient } from "./apiClient";

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthResponse = {
=======
// src/services/authApi.ts
import { apiClient } from "./apiClient";

export type User = {
  id: number | string;
  name: string;
  email: string;
  role?: string;
};

export type AuthResponse = {
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
  token: string;
  user: User;
};

<<<<<<< HEAD
export async function loginApi(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
}

export async function registerApi(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/register", data);
=======
export async function registerApi(payload: { name: string; email: string; password: string; }) {
  const res = await apiClient.post<AuthResponse>("/auth/register", payload);
  return res.data;
}

export async function loginApi(payload: { email: string; password: string; }) {
  const res = await apiClient.post<AuthResponse>("/auth/login", payload);
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
  return res.data;
}
