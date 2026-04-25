# Guide 01 — Critical Backend Fixes

> **Priority**: P0 — Must be done before anything else.  
> **Estimated Time**: 2–3 hours

---

## 1. Enable Global ValidationPipe

**Problem**: The NestJS API never validates incoming DTOs. All `class-validator` decorators on DTOs are ignored.

### File: `apps/api/src/main.ts`

Add the `ValidationPipe` import and enable it globally:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';  // ADD THIS

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  // ADD: Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if unknown properties sent
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert query params to correct types
      },
    }),
  );

  // CHANGE: Proper CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    credentials: true,
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('CareSphere API')
    .setDescription('The CareSphere marketplace API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'tmp', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 API running on http://localhost:${process.env.PORT ?? 4000}`);
  console.log(`📚 Swagger docs at http://localhost:${process.env.PORT ?? 4000}/api/docs`);
}
bootstrap();
```

---

## 2. Add Global ConfigModule

**Problem**: Env variables are accessed via raw `process.env` — no validation, no defaults, no type safety.

### File: `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';  // ADD THIS
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CaregiversModule } from './caregivers/caregivers.module';
import { BookingsModule } from './bookings/bookings.module';
import { MatchingModule } from './matching/matching.module';
import { VaultModule } from './vault/vault.module';
import { ChatModule } from './chat/chat.module';
import { VideoModule } from './video/video.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { InvoicesModule } from './invoices/invoices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';  // ADD THIS

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // ADD THIS — loads .env globally
    PrismaModule,  // ADD THIS — make Prisma globally available
    AuthModule,
    UsersModule,
    CaregiversModule,
    BookingsModule,
    MatchingModule,
    VaultModule,
    ChatModule,
    VideoModule,
    PaymentsModule,
    AdminModule,
    InvoicesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### File: `apps/api/src/prisma/prisma.module.ts`

Make PrismaModule globally available so every module can inject `PrismaService`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // ADD THIS
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

> **After this change**: Remove all `PrismaModule` imports from individual modules (auth.module, users.module, etc.) since it's now global. Remove all manual `PrismaService` provider declarations in individual modules too.

---

## 3. Fix the `GET /auth/me` Endpoint

**Problem**: Currently returns the raw JWT payload `{ sub, email, role }`. The frontend expects `{ id, email, role, firstName, lastName }`.

### File: `apps/api/src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refresh(@Req() req: any) {
    const userId = req.user.userId;
    const email = req.user.email;
    const role = req.user.role;
    return this.authService.refreshTokens(userId, email, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    // CHANGED: Return full user object instead of JWT payload
    return this.authService.getMe(req.user.userId);
  }

  // ADD: Logout endpoint (frontend calls this)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // With stateless JWTs, logout is handled client-side.
    // This endpoint exists so the frontend doesn't get a 404.
    // In the future, add token blacklisting via Redis here.
    return { message: 'Logged out successfully' };
  }
}
```

### File: `apps/api/src/auth/auth.service.ts`

Add the `getMe` method:

```typescript
// ADD this method to the AuthService class:

async getMe(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  if (user.isBanned) {
    throw new UnauthorizedException('Account has been suspended');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.profile?.firstName || '',
    lastName: user.profile?.lastName || '',
    avatarUrl: user.profile?.avatarUrl || null,
    isVerified: user.isVerified,
  };
}
```

---

## 4. Fix JWT Strategy to Include `userId`

**Problem**: The JWT strategy extracts `sub` from the payload and maps it to `userId`, but the `auth/me` controller was just passing `req.user` directly. Verify the JWT strategy is correct:

### File: `apps/api/src/auth/jwt.strategy.ts`

Ensure it looks like this:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

---

## 5. Create Centralized API Utility (Frontend)

**Problem**: Every page hardcodes `http://localhost:4000`. This must be centralized.

### File: `apps/web/src/lib/api.ts` (NEW FILE)

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type RequestOptions = {
  method?: string;
  body?: any;
  token?: string | null;
  headers?: Record<string, string>;
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new ApiError(
      errorData.message || 'Request failed',
      response.status,
      errorData,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, token?: string | null) =>
    apiFetch<T>(endpoint, { token }),

  post: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'POST', body, token }),

  patch: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'PATCH', body, token }),

  put: <T = any>(endpoint: string, body?: any, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'PUT', body, token }),

  delete: <T = any>(endpoint: string, token?: string | null) =>
    apiFetch<T>(endpoint, { method: 'DELETE', token }),
};

export { ApiError };
export { API_BASE_URL };
```

### Then update `apps/web/.env.local` (create if not exists):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Migration Strategy for Existing Pages

Replace all instances of:
```typescript
fetch("http://localhost:4000/some/endpoint", {
  headers: { Authorization: `Bearer ${token}` },
})
```

With:
```typescript
import { api } from '@/lib/api';

// Then in your component:
const data = await api.get('/some/endpoint', token);
```

> **Important**: Do this file by file as you touch each page. Don't try to update all pages at once.

---

## 6. Update Auth Context (Frontend)

### File: `apps/web/src/lib/auth-context.tsx`

Key changes:
- Use the centralized `api` utility
- Store refresh token
- Remove the broken logout fetch (or fix to use new endpoint)
- Fix the `login` redirect routes

```typescript
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
    if (userData.role === "ADMIN") router.push("/admin/analytics");
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
```

> **Important**: After updating the auth context, update the login page and register page to pass the `refreshToken` to the `login` function:
> ```typescript
> login(data.accessToken, data.refreshToken, data.user);
> ```

---

## 7. Update `.env.example`

### File: `.env.example` (root)

```env
# Database
DATABASE_URL=postgresql://caresphere:caresphere@localhost:5433/caresphere

# JWT
JWT_SECRET=your-jwt-secret-at-least-32-characters
JWT_REFRESH_SECRET=your-refresh-jwt-secret-at-least-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vault Encryption
VAULT_ENCRYPTION_KEY=  # 64 hex chars (32 bytes) - generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Cloudinary (for file uploads)
CLOUDINARY_URL=cloudinary://...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
PORT=4000
```

---

## 8. Verification Checklist

After completing all changes in this guide, verify:

- [ ] `pnpm --filter api start:dev` starts without errors
- [ ] `pnpm --filter web dev` starts without errors
- [ ] Login with demo accounts works
- [ ] `/auth/me` returns full user object with `firstName`, `lastName`
- [ ] Logout doesn't show 404 in console
- [ ] Sending invalid data to `/auth/register` returns validation errors (not a 500)
- [ ] Swagger docs load at `http://localhost:4000/api/docs`
- [ ] CORS only allows requests from `http://localhost:3000`
