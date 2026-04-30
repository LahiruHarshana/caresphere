"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/api";
import { signInWithGoogle } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Loader2, Shield, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const loginSideImage = "/media/images/login-side.jpg";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const googleButtonClass =
    "w-full h-12 rounded-md border border-slate-200 bg-white !text-slate-950 shadow-sm hover:bg-slate-50 hover:border-slate-300 font-medium";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const googleUser = await signInWithGoogle();
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: googleUser.idToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google sign-in failed");
      }

      if (data.needsOnboarding) {
        sessionStorage.setItem("pendingGoogleUser", JSON.stringify(googleUser));
        router.push("/register?google=1&role=CUSTOMER");
        return;
      }

      login(data.accessToken, data.refreshToken, data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#0b1220] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 grayscale"
          style={{ backgroundImage: `url(${loginSideImage})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.24),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.9)_48%,rgba(15,118,110,0.45))]" />
      </div>

      <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto mb-8 flex w-full max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-body text-white/55 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link href="/register?role=CUSTOMER" className="text-sm font-body text-white/55 hover:text-[#5eead4] transition-colors">
            Create account
          </Link>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="hidden min-h-[680px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-8 shadow-2xl shadow-black/25 backdrop-blur-xl lg:flex lg:flex-col lg:justify-between"
          >
            <div>
              <div className="mb-10 flex items-center gap-3">
                <img src="/logo.png" alt="CareSphere" className="h-12 w-auto brightness-0 invert" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-teal-100">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome back
              </span>
              <h1 className="mt-6 font-heading text-4xl leading-tight tracking-tight text-white">
                Manage care with calm, clear tools.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                Sign in to coordinate bookings, messages, payments, and caregiver updates from one secure place.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Shield, label: "Secure account access" },
                { icon: Users, label: "Trusted family and caregiver workflows" },
                { icon: Check, label: "Fast demo access for development" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <item.icon className="h-4 w-4 text-[#5eead4]" />
                  <span className="text-sm text-white/75">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl sm:p-8 md:p-10"
          >
            <div className="mb-8 lg:hidden">
              <img src="/logo.png" alt="CareSphere" className="h-11 w-auto brightness-0 invert" />
            </div>

            <div className="mb-8">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#5eead4]">Account access</span>
              <h2 className="mt-3 font-heading text-3xl tracking-tight text-white">Sign in to CareSphere</h2>
              <p className="mt-2 text-sm text-white/55">
                Or{" "}
                <Link href="/register?role=CUSTOMER" className="text-[#5eead4] hover:underline">
                  create a new account
                </Link>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className={googleButtonClass}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-950" />
              ) : (
                <span className="mr-2 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-[#4285f4]">G</span>
              )}
              Continue with Google
            </Button>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-widest text-white/30">or use email</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-sm text-red-300 font-body">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-white/70 text-sm font-body mb-2 block">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dark
                  className="rounded-md bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus:border-[#0d9488]"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-white/70 text-sm font-body mb-2 block">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dark
                  className="rounded-md bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus:border-[#0d9488]"
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-transparent text-[#0d9488] focus:ring-[#0d9488]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white/55 font-body">
                    Remember me
                  </label>
                </div>

                <Link href="/forgot-password" className="text-sm text-[#5eead4] hover:underline font-body">
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" className="w-full rounded-md bg-[#0d9488] hover:bg-[#0f766e] text-white border-[#0d9488] shadow-lg shadow-teal-950/25" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-8 rounded-xl border border-white/10 bg-black/10 p-4">
              <h3 className="text-xs font-body text-white/35 mb-4 text-center uppercase tracking-widest">Developer Quick Login</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("admin@caresphere.com")}
                  className="rounded-md border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-white text-xs">
                  Admin
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("customer1@example.com")}
                  className="rounded-md border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-white text-xs">
                  Customer
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("sarah.c@example.com")}
                  className="rounded-md border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-white text-xs">
                  Caregiver 1
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("john.d@example.com")}
                  className="rounded-md border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-white text-xs">
                  Caregiver 2
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("lisa.v@example.com")}
                  className="col-span-2 rounded-md border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-white text-xs">
                  Lisa Vance
                </Button>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
