import { apiClient } from "./apiClient";

export type User = {
  id: number;
  name: string;
  email: string;
  dass_completed: boolean;
  ai_consent: boolean | null;
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

export async function saveConsentApi(ai_consent: boolean): Promise<{ user: User }> {
  const res = await apiClient.patch("/auth/consent", { ai_consent });
  return res.data;
}

export async function getMeApi(): Promise<User> {
  const res = await apiClient.get("/auth/me");
  return res.data;
}
