# Guide 15 — Testing & Deployment

> **Priority**: P2  
> **Estimated Time**: 6–8 hours  
> **Depends on**: All previous guides

---

## 1. Testing Strategy

### Testing Pyramid for CareSphere

```
        ┌──────────────┐
        │   E2E Tests   │  ← Playwright (critical flows)
        │   (few, slow)  │
        ├──────────────┤
        │ Integration   │  ← Supertest + Prisma (API endpoints)
        │ Tests (some)   │
        ├──────────────┤
        │  Unit Tests   │  ← Jest (services, utilities)
        │  (many, fast)  │
        └──────────────┘
```

---

## 2. Backend Unit Tests

### Install

```bash
pnpm --filter api add -D @nestjs/testing jest @types/jest ts-jest
```

### Configure Jest

Create or update `apps/api/jest.config.ts`:

```typescript
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
```

### Example: Auth Service Test

File: `apps/api/src/auth/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
    },
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'password123',
          role: 'CUSTOMER',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create a user and return tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        role: 'CUSTOMER',
        profile: { firstName: 'Test', lastName: 'User' },
      });
      mockPrisma.verificationToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        role: 'CUSTOMER',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@test.com');
    });
  });
});
```

### Example: Bookings Service Test

File: `apps/api/src/bookings/bookings.service.spec.ts`

```typescript
describe('BookingsService', () => {
  describe('createBooking', () => {
    it('should reject booking with overlapping schedule', async () => {
      // Mock existing booking in the same time range
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createBooking('customer-1', {
          caregiverId: 'caregiver-1',
          serviceType: 'Elderly Care',
          scheduledAt: new Date('2024-03-01T09:00:00'),
          endAt: new Date('2024-03-01T11:00:00'),
        }),
      ).rejects.toThrow('Caregiver is not available');
    });

    it('should create booking and calculate cost', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null); // No overlap
      mockPrisma.caregiverProfile.findUnique.mockResolvedValue({
        hourlyRate: 25,
      });
      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-1',
        totalCost: 50, // 2 hours × $25
        status: 'PENDING',
      });

      const result = await service.createBooking('customer-1', {
        caregiverId: 'caregiver-1',
        serviceType: 'Elderly Care',
        scheduledAt: new Date('2024-03-01T09:00:00'),
        endAt: new Date('2024-03-01T11:00:00'),
      });

      expect(result.totalCost).toBe(50);
    });
  });
});
```

### Run Tests

```bash
pnpm --filter api test         # Run all tests
pnpm --filter api test:watch   # Watch mode
pnpm --filter api test:cov     # Coverage report
```

---

## 3. API Integration Tests

### Install

```bash
pnpm --filter api add -D supertest @types/supertest
```

### Example: Auth Endpoints

File: `apps/api/test/auth.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'SecurePass123!',
          role: 'CUSTOMER',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.role).toBe('CUSTOMER');
    });

    it('should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: '12345678',
          role: 'CUSTOMER',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'valid@example.com',
          password: '123',
          role: 'CUSTOMER',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Use seeded accounts
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
```

---

## 4. E2E Tests with Playwright

### Install

```bash
pnpm --filter web add -D @playwright/test
npx --filter web playwright install
```

### Configure Playwright

File: `apps/web/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm --filter web dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical User Flows to Test

File: `apps/web/tests/e2e/customer-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Customer Flow', () => {
  test('should login as customer', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/customer/dashboard');
  });

  test('should browse caregivers', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to caregivers
    await page.click('text=Find Caregivers');
    await expect(page).toHaveURL('/caregivers');
    // Verify caregiver cards appear
    await expect(page.locator('[data-testid="caregiver-card"]').first()).toBeVisible();
  });

  test('should complete a booking', async ({ page }) => {
    // Login → Browse → Select Caregiver → Book → Pay
    // ... detailed flow
  });
});
```

---

## 5. Production Docker Build

### File: `apps/api/Dockerfile` (NEW)

```dockerfile
FROM node:20-alpine AS base
RUN npm i -g pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm --filter shared build
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# Production
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/main.js"]
```

### File: `apps/web/Dockerfile` (NEW)

```dockerfile
FROM node:20-alpine AS base
RUN npm i -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm --filter web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

### File: `docker-compose.prod.yml` (NEW)

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://caresphere:caresphere@postgres:5432/caresphere
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      VAULT_ENCRYPTION_KEY: ${VAULT_ENCRYPTION_KEY}
      FRONTEND_URL: https://your-domain.com
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: https://api.your-domain.com

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: caresphere
      POSTGRES_USER: caresphere
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

---

## 6. CI/CD Pipeline

### File: `.github/workflows/ci.yml` (NEW)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: caresphere_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      # Backend
      - run: pnpm --filter api exec prisma generate
      - run: pnpm --filter api exec prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/caresphere_test
      - run: pnpm --filter api test
      - run: pnpm --filter api build

      # Frontend
      - run: pnpm --filter web build
```

---

## 7. Pre-Launch Checklist

### Security
- [ ] All secrets in environment variables (no hardcoded)
- [ ] CORS restricted to production domain
- [ ] Helmet security headers enabled
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all endpoints (ValidationPipe)
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection (input sanitization)
- [ ] CSRF protection for stateful operations

### Performance
- [ ] Database indexes on frequently queried fields
- [ ] Pagination on all list endpoints
- [ ] Image optimization (Cloudinary)
- [ ] Compression enabled
- [ ] Static assets served via CDN

### Reliability
- [ ] Error boundary on frontend
- [ ] Global exception filter on backend
- [ ] Health check endpoint (`GET /health`)
- [ ] Database connection retry logic
- [ ] Graceful shutdown handling

### Operations
- [ ] Production Docker builds working
- [ ] Database backup strategy
- [ ] Monitoring (Sentry or similar)
- [ ] Log aggregation
- [ ] SSL/TLS certificates

---

> This guide concludes the CareSphere implementation roadmap. Follow the guides in order (01 → 15) for best results.
