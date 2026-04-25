"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

type User = {
  id: string;
  email: string;
  role: "CUSTOMER" | "CAREGIVER" | "ADMIN";
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const checkAuth = async () => {
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.get("/auth/me", storedToken);
        setUser(data);
        setToken(storedToken);
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setToken(accessToken);
    setUser(userData);

    // Redirect based on role
    if (userData.role === "ADMIN") router.push("/admin");
    else if (userData.role === "CAREGIVER") router.push("/caregiver/dashboard");
    else router.push("/customer/dashboard");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", undefined, token);
    } catch {
      // Ignore errors — we're logging out anyway
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
