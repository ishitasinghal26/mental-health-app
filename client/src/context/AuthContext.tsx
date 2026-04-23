import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginApi, registerApi, saveConsentApi, getMeApi,
  verifyOtpApi, googleAuthApi, User,
} from "../services/authApi";
import { setAuthToken } from "../services/apiClient";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Returns { email } for redirect to OTP verify page */
  register: (name: string, email: string, password: string) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  loginWithGoogle: (credential: string, opts?: { password?: string; fromRegister?: boolean }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  saveConsent: (aiConsent: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "mindkare_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* Restore session on mount */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
        setAuthToken(parsed.token || null);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  /* Persist session whenever token/user changes */
  useEffect(() => {
    setAuthToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }, [token, user]);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  /** Register: sends OTP, does NOT set session — caller redirects to /verify-otp */
  async function register(name: string, email: string, password: string) {
    const data = await registerApi({ name, email, password });
    return { email: data.email };
  }

  async function verifyOtp(email: string, otp: string) {
    setLoading(true);
    try {
      const data = await verifyOtpApi({ email, otp });
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(credential: string, opts?: { password?: string; fromRegister?: boolean }) {
    setLoading(true);
    try {
      const data = await googleAuthApi(credential, opts);
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  }

  function updateUser(updates: Partial<User>) {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }

  async function saveConsent(aiConsent: boolean) {
    const data = await saveConsentApi(aiConsent);
    setUser(data.user);
  }

  async function refreshUser() {
    try {
      const freshUser = await getMeApi();
      setUser(freshUser);
    } catch {
      // silently fail
    }
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, verifyOtp, loginWithGoogle,
      logout, updateUser, saveConsent, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
