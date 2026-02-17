<<<<<<< HEAD
=======
// src/context/AuthContext.tsx
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginApi, registerApi, User } from "../services/authApi";
import { setAuthToken } from "../services/apiClient";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
const STORAGE_KEY = "mindkare_auth";
=======
const STORAGE_KEY = "mindcare_auth";
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
=======
    // load from localStorage
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
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

  useEffect(() => {
<<<<<<< HEAD
=======
    // keep auth header and storage in sync
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
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

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    try {
      const data = await registerApi({ name, email, password });
      setToken(data.token);
      setUser(data.user);
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
