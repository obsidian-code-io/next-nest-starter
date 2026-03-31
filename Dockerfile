# ============================================================
# Stage 1: Base — install dependencies
# ============================================================
FROM oven/bun:1 AS base
WORKDIR /app

# Copy workspace root files
COPY package.json bun.lock* package-lock.json* turbo.json tsconfig.base.json ./

# Copy all package.json files to leverage Docker layer caching
COPY packages/prisma/package.json packages/prisma/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install all dependencies
RUN bun install --frozen-lockfile || bun install

# Copy all source code
COPY packages/ packages/
COPY apps/ apps/

# Generate Prisma client
RUN cd packages/prisma && bunx prisma generate --schema=schema


# ============================================================
# Stage 2: API build
# ============================================================
FROM base AS api-build
WORKDIR /app

# Build shared package first
RUN cd packages/shared && bun run build

# Build the NestJS API
RUN cd apps/api && bun run build


# ============================================================
# Stage 3: Web build
# ============================================================
FROM base AS web-build
WORKDIR /app

# Build shared package first
RUN cd packages/shared && bun run build

# Set build-time env vars for Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js frontend
RUN cd apps/web && bun run build


# ============================================================
# Stage 4: API production image
# ============================================================
FROM oven/bun:1-slim AS api
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=api-build /app/node_modules ./node_modules
COPY --from=api-build /app/packages/prisma ./packages/prisma
COPY --from=api-build /app/packages/shared ./packages/shared
COPY --from=api-build /app/apps/api/dist ./apps/api/dist
COPY --from=api-build /app/apps/api/package.json ./apps/api/
COPY --from=api-build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=api-build /app/package.json ./

ENV NODE_ENV=production
ENV API_PORT=3001

EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]


# ============================================================
# Stage 5: Web production image
# ============================================================
FROM oven/bun:1-slim AS web
WORKDIR /app

COPY --from=web-build /app/apps/web/.next ./apps/web/.next
COPY --from=web-build /app/apps/web/public ./apps/web/public
COPY --from=web-build /app/apps/web/package.json ./apps/web/
COPY --from=web-build /app/apps/web/next.config.ts ./apps/web/
COPY --from=web-build /app/node_modules ./node_modules
COPY --from=web-build /app/packages/shared ./packages/shared
COPY --from=web-build /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3000

WORKDIR /app/apps/web
CMD ["bun", "run", "start"]


# ============================================================
# Stage 6: Prisma migrations / seed runner
# ============================================================
FROM base AS prisma
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/packages/prisma
CMD ["sh", "-c", "bunx prisma db push --schema=schema --accept-data-loss && bun run seed.ts"]
