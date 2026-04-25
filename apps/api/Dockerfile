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
