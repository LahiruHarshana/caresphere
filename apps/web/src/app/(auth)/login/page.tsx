"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const loginSideImage = "/media/images/login-side.jpg";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      login(data.accessToken, data.refreshToken, data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
          style={{ backgroundImage: `url(${loginSideImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/90 via-neutral-900/70 to-primary-900/70" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="font-heading text-5xl mb-6 tracking-tight">Welcome Back to CareSphere</h1>
          <p className="text-lg text-white/70 mb-12 font-body leading-relaxed">
            Continue your journey to find the perfect care for your loved ones.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {["S", "M", "D", "J"].map((initial, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                >
                  <span className="text-sm font-body">{initial}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60 font-body">Joined by 10,000+ families</p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col justify-center py-10 px-6 sm:px-8 lg:px-16 max-w-xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm font-body text-neutral-600 hover:bg-neutral-50 transition-colors duration-300 mb-8 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="CareSphere" className="h-10 w-auto" />
        </div>
        <h2 className="font-heading text-3xl text-neutral tracking-tight mb-2">Sign in to your account</h2>
        <p className="text-neutral-600 font-body mb-8">
          Or{" "}
          <Link href="/register?role=CUSTOMER" className="text-primary hover:underline">
            create a new account
          </Link>
        </p>

        <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-soft-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-sm">
                <p className="text-sm text-red-700 font-body">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded-sm"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-600 font-body">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline font-body">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-body text-neutral-500 mb-4 text-center uppercase tracking-wider">Developer Quick Login</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("admin@caresphere.com")}>
                Admin
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("customer1@example.com")}>
                Customer
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("sarah.c@example.com")}>
                Caregiver 1
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("john.d@example.com")}>
                Caregiver 2
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("lisa.v@example.com")}>
                Lisa Vance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}