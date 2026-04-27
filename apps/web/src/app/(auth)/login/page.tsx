"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-[#0f172a] flex overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
          style={{ backgroundImage: `url(${loginSideImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/90 via-[#0f172a]/70 to-[#0f766e]/70" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, rgba(13, 148, 136, 0.5) 0%, transparent 70%)",
              filter: "blur(60px)"
            }}
          />
        </div>
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="page-hero-label mb-8"
          >
            Trusted by 10,000+ Families
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-heading text-4xl lg:text-5xl text-white tracking-tight mb-6 leading-tight"
          >
            Welcome back to <span className="text-[#5eead4]">CareSphere</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-lg font-body leading-relaxed mb-12 max-w-md"
          >
            Continue your journey to find the perfect care for your loved ones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {["S", "M", "D", "J"].map((initial, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                >
                  <span className="text-sm font-body text-white/80">{initial}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/50 font-body">Joined by thousands of families</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 relative z-10 flex flex-col justify-center py-16 px-8 lg:px-16 max-w-xl mx-auto lg:mx-0 lg:ml-auto"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-body text-white/40 hover:text-white transition-colors duration-300 mb-10 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="CareSphere" className="h-10 w-auto" />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-3xl text-white tracking-tight mb-2"
        >
          Sign in to your account
        </motion.h2>
        <p className="text-white/50 font-body mb-10">
          Or{" "}
          <Link href="/register?role=CUSTOMER" className="text-[#5eead4] hover:underline">
            create a new account
          </Link>
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inner-card p-10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4">
                <p className="text-sm text-red-400 font-body">{error}</p>
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#0d9488] focus:ring-[#0d9488]/20 rounded-sm"
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#0d9488] focus:ring-[#0d9488]/20 rounded-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0d9488] focus:ring-[#0d9488] border-white/20 rounded-sm bg-transparent"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white/50 font-body">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-[#5eead4] hover:underline font-body">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white border-[#0d9488]" disabled={isLoading}>
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

          <div className="mt-8 pt-8 border-t border-white/5">
            <h3 className="text-xs font-body text-white/30 mb-4 text-center uppercase tracking-widest">Developer Quick Login</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("admin@caresphere.com")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-sm text-xs">
                Admin
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("customer1@example.com")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-sm text-xs">
                Customer
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("sarah.c@example.com")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-sm text-xs">
                Caregiver 1
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("john.d@example.com")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-sm text-xs">
                Caregiver 2
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => handleDemoFill("lisa.v@example.com")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-sm text-xs">
                Lisa Vance
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}