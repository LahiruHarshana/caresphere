"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("No reset token provided.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const response = await api.post("/auth/reset-password", { token, password });
      setStatus("success");
      setMessage(response.message || "Password has been reset successfully.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to reset password.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inner-card p-12 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-heading text-2xl text-white mb-3 tracking-tight">Invalid Link</h2>
          <p className="text-white/50 font-body mb-6">No reset token was found in the URL.</p>
          <Link href="/login" className="text-[#5eead4] font-medium flex items-center justify-center gap-2 text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inner-card p-12 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#0d9488]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#0d9488]" />
          </div>
          <h2 className="font-heading text-2xl text-white mb-3 tracking-tight">Password Reset!</h2>
          <p className="text-white/50 font-body mb-8">{message}</p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-3 rounded-full text-sm font-body transition-colors">
            Go to Login
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
          <h2 className="font-heading text-2xl text-white mb-2 tracking-tight">Reset Password</h2>
          <p className="text-white/50 font-body mb-8">Enter your new password below.</p>
          
          {status === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 mb-6">
              <p className="text-sm text-red-400 font-body">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-white/70 text-sm font-body mb-2 block">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#0d9488] rounded-sm"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-white/70 text-sm font-body mb-2 block">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                dark
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#0d9488] rounded-sm"
              />
            </div>
            <Button type="submit" className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white border-[#0d9488]" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d9488]"></div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}