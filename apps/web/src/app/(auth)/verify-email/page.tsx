"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const dynamic = "force-dynamic";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    api.post("/auth/verify-email", { token })
      .then((data) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inner-card p-12 max-w-md w-full text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-14 h-14 text-[#0d9488] mx-auto mb-6 animate-spin" />
            <h2 className="font-heading text-xl text-white">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#0d9488]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#0d9488]" />
            </div>
            <h2 className="font-heading text-2xl text-white mb-3 tracking-tight">Email Verified!</h2>
            <p className="text-white/50 font-body mb-8 leading-relaxed">{message}</p>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white px-6 py-3 rounded-full text-sm font-body transition-colors">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-heading text-2xl text-white mb-3 tracking-tight">Verification Failed</h2>
            <p className="text-white/50 font-body mb-8 leading-relaxed">{message}</p>
            <Link href="/login" className="text-[#5eead4] font-medium hover:underline">
              Back to Login
            </Link>
          </>
        )}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyEmailForm />
    </Suspense>
  );
}