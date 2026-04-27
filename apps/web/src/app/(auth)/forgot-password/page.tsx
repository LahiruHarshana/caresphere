"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inner-card p-12 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#0d9488]/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#0d9488]" />
          </div>
          <h2 className="font-heading text-2xl text-white mb-3 tracking-tight">Check Your Email</h2>
          <p className="text-white/50 font-body mb-8 leading-relaxed">
            If an account exists with that email, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login" className="text-[#5eead4] font-medium flex items-center justify-center gap-2 text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-body text-white/40 hover:text-white transition-colors duration-300 mb-10 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="CareSphere" className="h-10 w-auto" />
        </div>

        <div className="inner-card p-10">
          <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Forgot Password?</h2>
          <p className="text-white/50 font-body mb-8">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white/70 text-sm font-body mb-2 block">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#0d9488] rounded-sm"
              />
            </div>
            <Button type="submit" className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white border-[#0d9488]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}