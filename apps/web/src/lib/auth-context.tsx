"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  role: "CUSTOMER" | "CAREGIVER" | "ADMIN";
  firstName: string;
  lastName: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("token");
    const checkAuth = async () => {
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${storedToken}`,
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setToken(storedToken);
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        }
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (newToken: string, user: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(user);
    if (user.role === "ADMIN") router.push("/admin/users");
    else if (user.role === "CAREGIVER") router.push("/gigs");
    else router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", { 
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : undefined
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("token");
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
