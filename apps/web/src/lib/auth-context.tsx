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
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in cookies
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
          headers: {
            "Content-Type": "application/json",
            // Include credentials to send httpOnly cookies if configured, 
            // but Next.js will likely handle it differently.
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (token: string, user: User) => {
    // In a real app, token should be stored in httpOnly cookie via an API route.
    // For now, we just set the state.
    setUser(user);
    if (user.role === "ADMIN") router.push("/admin/users");
    else if (user.role === "CAREGIVER") router.push("/gigs");
    else router.push("/dashboard");
  };

  const logout = async () => {
    // Call API to logout (blacklist token / clear cookie)
    try {
      await fetch("http://localhost:4000/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
