import { apiClient } from "./apiClient";

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

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
  return res.data;
}
