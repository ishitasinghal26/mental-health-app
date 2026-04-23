import { apiClient } from "./apiClient";

export type User = {
  id: number;
  name: string;
  email: string;
  dass_completed: boolean;
  ai_consent: boolean | null;
  is_verified?: boolean;
  provider?: string;
};

type AuthResponse = { token: string; user: User };

export async function loginApi(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
}

/** Register now returns { message, email } — does NOT return a token */
export async function registerApi(data: { name: string; email: string; password: string }): Promise<{ message: string; email: string }> {
  const res = await apiClient.post("/auth/register", data);
  return res.data;
}

/** Verify OTP — returns token + user on success */
export async function verifyOtpApi(data: { email: string; otp: string }): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/verify-otp", data);
  return res.data;
}

/** Resend OTP */
export async function resendOtpApi(email: string): Promise<{ message: string }> {
  const res = await apiClient.post("/auth/resend-otp", { email });
  return res.data;
}

/** Google credential sign-in (login) or sign-up (fromRegister + password) */
export async function googleAuthApi(
  credential: string,
  opts?: { password?: string; fromRegister?: boolean }
): Promise<AuthResponse & { needsPassword?: boolean; profile?: { name: string; email: string }; is_new_user?: boolean }> {
  const res = await apiClient.post("/auth/google", { credential, ...opts });
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
