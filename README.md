# Monorepo Starter — Next.js + NestJS

A production-ready fullstack TypeScript monorepo template powered by **Turborepo**, featuring a **NestJS** API backend and a **Next.js** frontend, with shared packages for Prisma ORM and common utilities.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + Bun workspaces |
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 |
| **Backend** | NestJS 11, Passport JWT, Swagger, class-validator |
| **Database** | PostgreSQL 15 + Prisma ORM (multi-file schema) |
| **Cache / Queues** | Redis 7 + BullMQ |
| **State Management** | Zustand (client), React Query v5 (server) |
| **Testing** | Vitest, Testing Library, Supertest |
| **Logging** | Pino (structured JSON in prod, pretty in dev) |
| **Error Tracking** | Sentry (optional — leave `SENTRY_DSN` empty to skip) |
| **Containerization** | Docker multi-stage builds (API, Web, Prisma runner) |
| **Email (dev)** | MailHog — catch all emails at `http://localhost:8025` |

## Project Structure

```
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── common/         # Decorators, filters, guards, middleware
│   │   │   ├── config/         # Database, Redis, Queue, Logger, Sentry modules
│   │   │   └── modules/        # Feature modules (auth, user, post, health)
│   │   └── package.json
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/            # App Router pages & layouts
│       │   ├── components/     # Shared UI components
│       │   ├── hooks/          # React Query hooks
│       │   ├── lib/            # API client, utils, constants
│       │   ├── providers/      # Theme, Query, Auth providers
│       │   └── stores/         # Zustand stores
│       └── package.json
├── packages/
│   ├── prisma/                 # Prisma schema, migrations, seed
│   │   ├── schema/             # Multi-file Prisma schema
│   │   │   ├── base.prisma     # Generator + datasource
│   │   │   ├── user.prisma     # User model
│   │   │   └── post.prisma     # Post model (example)
│   │   ├── seed.ts             # Database seed script
│   │   └── index.ts            # Re-exports PrismaClient + types
│   └── shared/                 # Shared types, enums, utilities
│       └── src/
│           ├── constants/      # Enums, constants
│           ├── types/          # Shared interfaces (JwtPayload, etc.)
│           └── utils/          # Utility functions
├── docker-compose.dev.yml      # Postgres + Redis + MailHog for local dev
├── docker-compose.yml          # Full production stack
├── Dockerfile                  # Multi-stage: api, web, prisma targets
├── turbo.json                  # Turborepo task config
├── tsconfig.base.json          # Shared TypeScript config
└── package.json                # Root workspace config + scripts
```

## Quick Start

### Prerequisites

- **Bun** v1.3+ — [install](https://bun.sh)
- **Docker** — for Postgres, Redis, and MailHog

### 1. Clone & Install

```bash
# Clone the template
git clone <your-repo-url> my-project
cd my-project

# Install all dependencies
bun install
```

### 2. Start Infrastructure

```bash
# Start Postgres, Redis, and MailHog
bun run docker:up
```

### 3. Setup Database

```bash
# Generate Prisma client + push schema + seed demo data
bun run db:generate
bun run db:push
bun run db:seed
```

### 4. Start Dev Servers

```bash
# Start both API (port 3001) and Web (port 3000) in parallel
bun run dev
```

Or run them individually:

```bash
bun run dev:api    # http://localhost:3001/api
bun run dev:web    # http://localhost:3000
```

### 5. Open

| URL | What |
|-----|------|
| `http://localhost:3000` | Next.js frontend |
| `http://localhost:3001/api/docs` | Swagger API docs |
| `http://localhost:3001/api/health` | Health check endpoint |
| `http://localhost:8025` | MailHog (captured emails) |

### Demo Credentials

```
Admin:  admin@example.com / password
User:   user@example.com  / password
```

## One-Line Setup

If you prefer a single command:

```bash
bun run setup
```

This runs: `bun install` → `db:generate` → `docker:up` → `db:push` → `db:seed`

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all apps in dev mode (parallel via Turbo) |
| `bun run build` | Build all apps for production |
| `bun run test` | Run all tests |
| `bun run lint` | Lint all apps |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run Prisma migrations |
| `bun run db:push` | Push schema without migration |
| `bun run db:seed` | Seed the database |
| `bun run db:studio` | Open Prisma Studio |
| `bun run docker:up` | Start dev infrastructure |
| `bun run docker:down` | Stop dev infrastructure |
| `bun run docker:prod` | Start full production stack |

## Adding a New Feature

### 1. Add a Prisma Model

Create `packages/prisma/schema/product.prisma`:

```prisma
model Product {
  id        String   @id @default(cuid())
  name      String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("products")
}
```

Then run:

```bash
bun run db:generate   # Regenerate Prisma client
bun run db:push       # Push to database
```

### 2. Add a NestJS Module

```bash
cd apps/api
# Create module structure manually or use NestJS CLI:
bunx nest g module modules/product
bunx nest g controller modules/product
bunx nest g service modules/product
```

Register it in `apps/api/src/app.module.ts`.

### 3. Add a Next.js Page

Create `apps/web/src/app/(dashboard)/dashboard/products/page.tsx` and add a
React Query hook in `apps/web/src/hooks/queries/use-products.ts`.

### 4. Add Shared Types

Add to `packages/shared/src/types/index.ts` — automatically available in both apps via `@monorepo/shared`.

## Environment Variables

Copy the example and customize:

```bash
cp .env.example .env
```

See `.env.example` for all available variables. Key ones:

- `DATABASE_URL` — Postgres connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — **Change in production!**
- `SENTRY_DSN` — Optional, leave empty to disable

## Docker Production Deploy

Build and run the full stack:

```bash
docker compose up -d --build
```

This creates separate containers for Postgres, Redis, API, Web, and a Prisma migration runner.

## API Features Out of the Box

- **JWT Authentication** — Register, login, token refresh, profile endpoint
- **Role-Based Access Control** — `@Roles('ADMIN')` decorator + guard
- **Global Exception Filter** — Consistent error responses with Sentry reporting
- **Request ID Tracing** — Every request gets a UUID via `X-Request-Id` header
- **Rate Limiting** — Throttle guard (60 req/min default)
- **Validation** — Auto-validation via `class-validator` DTOs
- **Swagger Docs** — Auto-generated at `/api/docs`
- **Health Check** — `/api/health` with Redis connectivity check
- **Structured Logging** — Pino with password redaction, pretty dev output
- **BullMQ Queues** — Email queue ready, easily extendable

## Frontend Features Out of the Box

- **App Router** — Next.js 16 with route groups `(auth)` and `(dashboard)`
- **Auth Flow** — Login, register, token refresh, protected routes
- **Zustand Store** — JWT decoding, hydration from localStorage
- **React Query** — Server state with query hooks pattern
- **Tailwind v4** — CSS-first config, dark mode, design tokens
- **Toast Notifications** — Via Sonner
- **Sidebar Layout** — Responsive dashboard shell with navigation

## License

MIT — use this template for anything.
# next-nest-starter
