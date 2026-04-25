# Guide 03 — Auth Hardening

> **Priority**: P0  
> **Estimated Time**: 4–5 hours  
> **Depends on**: Guides 01, 02

---

## Overview

This guide covers:
1. Email verification on registration
2. Password reset (forgot password) flow
3. Auto token refresh on the frontend
4. Banned user check on every authenticated request
5. Rate limiting on auth endpoints

---

## 1. Email Verification

### A. Schema Changes

Add to `apps/api/prisma/schema.prisma` — a `VerificationToken` model:

```prisma
model VerificationToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  type      String   // "EMAIL_VERIFY" | "PASSWORD_RESET"
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}
```

Run migration:
```bash
pnpm --filter api exec prisma migrate dev --name add_verification_tokens
```

### B. Update Auth Service

Add these methods to `apps/api/src/auth/auth.service.ts`:

```typescript
import * as crypto from 'crypto';

// In the register method, AFTER creating the user but BEFORE returning:
// Set isVerified to false (already the default)
// Generate and send verification email

async register(registerDto: RegisterDto) {
  // ... existing user creation code ...

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await this.prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: verificationToken,
      type: 'EMAIL_VERIFY',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  // Send verification email (inject NotificationsService or use nodemailer directly)
  // For now, we'll add a simple email sender
  await this.sendVerificationEmail(email, verificationToken);

  const tokens = await this.getTokens(user.id, user.email, user.role);
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName,
      lastName,
    },
    ...tokens,
    message: 'Registration successful. Please check your email to verify your account.',
  };
}

private async sendVerificationEmail(email: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  // Use the NotificationsService or create a transporter here
  // For simplicity, we'll log it in dev
  console.log(`📧 Verification link for ${email}: ${verifyUrl}`);

  // TODO: Integrate with NotificationsService for actual email sending
}

async verifyEmail(token: string) {
  const record = await this.prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    throw new BadRequestException('Invalid verification token');
  }

  if (record.expiresAt < new Date()) {
    throw new BadRequestException('Verification token has expired');
  }

  if (record.type !== 'EMAIL_VERIFY') {
    throw new BadRequestException('Invalid token type');
  }

  // Mark user as verified
  await this.prisma.user.update({
    where: { id: record.userId },
    data: { isVerified: true },
  });

  // Delete the used token
  await this.prisma.verificationToken.delete({
    where: { id: record.id },
  });

  return { message: 'Email verified successfully' };
}

async resendVerification(email: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists
    return { message: 'If the email exists, a verification link has been sent.' };
  }

  if (user.isVerified) {
    return { message: 'Email is already verified.' };
  }

  // Delete old tokens
  await this.prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: 'EMAIL_VERIFY' },
  });

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await this.prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: verificationToken,
      type: 'EMAIL_VERIFY',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await this.sendVerificationEmail(email, verificationToken);

  return { message: 'If the email exists, a verification link has been sent.' };
}
```

### C. Add Controller Endpoints

In `apps/api/src/auth/auth.controller.ts`:

```typescript
@Post('verify-email')
verifyEmail(@Body('token') token: string) {
  return this.authService.verifyEmail(token);
}

@Post('resend-verification')
resendVerification(@Body('email') email: string) {
  return this.authService.resendVerification(email);
}
```

### D. Frontend Verify Email Page

Create `apps/web/src/app/(auth)/verify-email/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login" className="bg-primary text-white px-6 py-3 rounded-lg font-medium">
              Go to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/login" className="text-primary font-medium">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 2. Password Reset (Forgot Password)

### A. Backend — Auth Service

Add to `apps/api/src/auth/auth.service.ts`:

```typescript
async forgotPassword(email: string) {
  const user = await this.usersService.findByEmail(email);

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  // Delete old reset tokens
  await this.prisma.verificationToken.deleteMany({
    where: { userId: user.id, type: 'PASSWORD_RESET' },
  });

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  await this.prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  console.log(`📧 Password reset link for ${email}: ${resetUrl}`);
  // TODO: Send actual email via NotificationsService

  return { message: 'If the email exists, a reset link has been sent.' };
}

async resetPassword(token: string, newPassword: string) {
  const record = await this.prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.type !== 'PASSWORD_RESET') {
    throw new BadRequestException('Invalid reset token');
  }

  if (record.expiresAt < new Date()) {
    throw new BadRequestException('Reset token has expired');
  }

  const passwordHash = await argon2.hash(newPassword);

  await this.prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  // Delete the used token
  await this.prisma.verificationToken.delete({
    where: { id: record.id },
  });

  return { message: 'Password has been reset successfully.' };
}
```

### B. Backend — Auth Controller

```typescript
@Post('forgot-password')
forgotPassword(@Body('email') email: string) {
  return this.authService.forgotPassword(email);
}

@Post('reset-password')
resetPassword(
  @Body('token') token: string,
  @Body('password') password: string,
) {
  return this.authService.resetPassword(token, password);
}
```

### C. Frontend — Forgot Password Page

Create `apps/web/src/app/(auth)/forgot-password/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

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
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            If an account exists with that email, we've sent a password reset link.
          </p>
          <Link href="/login" className="text-primary font-medium flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600 mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-primary">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### D. Frontend — Reset Password Page

Create `apps/web/src/app/(auth)/reset-password/page.tsx` with a form that takes the new password and confirms it, then calls `POST /auth/reset-password` with the token from the query string and the new password.

---

## 3. Banned User Check

### File: `apps/api/src/auth/jwt.strategy.ts`

Inject PrismaService and check if user is banned on every request:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // Check if user is banned on every request
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { isBanned: true },
    });

    if (!user || user.isBanned) {
      throw new UnauthorizedException('Account has been suspended');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

> **Note**: This adds one DB query per authenticated request. For better performance, cache banned users in Redis.

---

## 4. Frontend Token Refresh Interceptor

Update `apps/web/src/lib/api.ts` to automatically refresh tokens:

```typescript
// Add this to the apiFetch function, AFTER the initial response check:

if (response.status === 401) {
  // Try to refresh the token
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const tokens = await refreshResponse.json();
        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        // Retry the original request with new token
        const retryConfig = { ...config };
        (retryConfig.headers as any)['Authorization'] = `Bearer ${tokens.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);

        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
    } catch {
      // Refresh failed — force logout
    }

    // If refresh failed, clear tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}
```

---

## 5. Login Page — Link to Forgot Password

Update the login page's "Forgot your password?" link from `href="#"` to `href="/forgot-password"`.

---

## 6. Verification Checklist

- [ ] New user registration creates a `VerificationToken` record
- [ ] Verification link in console works and sets `isVerified = true`
- [ ] Forgot password generates a reset token and logs the link
- [ ] Reset password with valid token changes the password
- [ ] Reset password with expired token returns error
- [ ] Banned user gets 401 on any authenticated request
- [ ] Token auto-refresh works when access token expires
- [ ] Forgot Password page renders correctly
- [ ] Verify Email page renders correctly
