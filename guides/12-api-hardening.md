# Guide 12 — API Hardening

> **Priority**: P1  
> **Estimated Time**: 2–3 hours  
> **Depends on**: Guide 01

---

## 1. Rate Limiting

### Install

```bash
pnpm --filter api add @nestjs/throttler
```

### Configure Globally

```typescript
// In app.module.ts:
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 3,     // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 seconds
        limit: 20,    // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minute
        limit: 100,   // 100 requests per minute
      },
    ]),
    // ... other imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
```

### Stricter Limits on Auth Endpoints

```typescript
// In auth.controller.ts:
import { Throttle } from '@nestjs/throttler';

@Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
@Post('login')
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

@Throttle({ short: { ttl: 60000, limit: 3 } }) // 3 attempts per minute
@Post('forgot-password')
forgotPassword(@Body('email') email: string) {
  return this.authService.forgotPassword(email);
}
```

> **Note**: For WebSocket gateways, add `@SkipThrottle()` decorator since they have their own rate limiting concerns.

---

## 2. Pagination for All List Endpoints

Create a reusable pagination DTO:

### File: `apps/api/src/common/dto/pagination.dto.ts` (NEW)

```typescript
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

### Apply to endpoints that return lists:

```typescript
// Example for bookings:
@Get()
getUserBookings(@Query() query: PaginationDto, @Req() req: any) {
  return this.bookingsService.getUserBookings(
    req.user.userId,
    req.user.role,
    query.page || 1,
    query.limit || 20,
  );
}

// In service:
async getUserBookings(userId: string, role: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = role === 'CAREGIVER'
    ? { caregiverId: userId }
    : { customerId: userId };

  const [data, total] = await Promise.all([
    this.prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledAt: 'desc' },
      include: {
        customer: { include: { profile: true } },
        caregiver: { include: { profile: true, caregiverProfile: true } },
      },
    }),
    this.prisma.booking.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## 3. Global Exception Filter

### File: `apps/api/src/common/filters/http-exception.filter.ts` (NEW)

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'An error occurred';
      details = typeof exceptionResponse === 'object' ? exceptionResponse : undefined;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error(
        `Unhandled exception: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && status < 500 ? { errors: details } : {}),
    });
  }
}
```

### Register in `main.ts`:

```typescript
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

app.useGlobalFilters(new AllExceptionsFilter());
```

---

## 4. Request Logging Middleware

### File: `apps/api/src/common/middleware/logger.middleware.ts` (NEW)

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const duration = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
```

### Apply in `AppModule`:

```typescript
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

---

## 5. Input Sanitization

### Install

```bash
pnpm --filter api add class-sanitizer
# or use a custom pipe
```

### Simple Sanitization Pipe

```typescript
// apps/api/src/common/pipes/sanitize.pipe.ts

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.sanitize(value);
    }
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitize(str: string): string {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }

  private sanitizeObject(obj: any): any {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = this.sanitize(obj[key]);
      } else if (Array.isArray(obj[key])) {
        sanitized[key] = obj[key].map((item: any) =>
          typeof item === 'string' ? this.sanitize(item) : item,
        );
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
}
```

---

## 6. Helmet (Security Headers)

```bash
pnpm --filter api add helmet
```

```typescript
// In main.ts:
import helmet from 'helmet';

app.use(helmet());
```

---

## 7. Compression

```bash
pnpm --filter api add compression
```

```typescript
// In main.ts:
import compression from 'compression';

app.use(compression());
```

---

## 8. Verification Checklist

- [ ] Rate limiting works — returns 429 when limit exceeded
- [ ] Auth endpoints have stricter rate limits
- [ ] All list endpoints return paginated responses
- [ ] Exception filter catches all errors gracefully
- [ ] Request logger shows HTTP method, path, status, and duration
- [ ] Helmet security headers are present in responses
- [ ] Compression is enabled for responses
- [ ] HTML special characters are sanitized in user inputs
