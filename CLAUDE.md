# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boundary Bytes is a cricket statistics query platform built with Next.js 15.4.7 (App Router), TypeScript, Prisma ORM, and PostgreSQL. The application allows users to query cricket statistics across IPL, WPL, and BBL leagues using natural language queries powered by AI-driven text-to-SQL generation.

## Development Commands

### Core Commands

- **Start dev server**: `npm run dev` - Runs Next.js with Turbopack at `http://localhost:3000`
- **Build**: `npm run build` - Generates Prisma client and builds Next.js
- **Type check**: `npm run typecheck` - Runs `tsc --noEmit`
- **Lint**: `npm run lint` - Runs ESLint
- **Format**: `npm run format` - Runs Prettier on all files

### Database Commands

- **Prisma generate**: `npx prisma generate` - Generates Prisma client to `src/generated/prisma/client`
- **Prisma migrations**: `npx prisma migrate` - Creates and applies database migrations
- **Prisma seed**: `npx prisma db seed` - Seeds database (runs `tsx prisma/seed.ts`)

### Pre-commit Checks

Husky runs on every commit via `.husky/pre-commit`:

- Prettier check on staged files
- TypeScript compilation (`npm run typecheck`)

## Architecture

### Database Layer

**PostgreSQL with Prisma ORM**

- Connection via PrismaPg adapter using `DATABASE_URL` environment variable
- Prisma models in `prisma/schema.prisma`:
  - `WplMatch`: Core match data with deliveries
  - `WplDelivery`: Ball-by-ball delivery data containing runs, wickets, and player info
  - `WplMatchInfo`: Match metadata (toss, venue, winner, etc.)
  - `WplTeam` / `WplPlayer`: Team and player information per match
  - `WplOfficial` / `WplPersonRegistry`: Officials and person registries
- **Prisma client is custom-generated to `src/generated/prisma/client`** (not `node_modules`)
- Client instance exported from `src/lib/prisma.ts` with singleton pattern for development

### API Architecture

**Route Handlers in `src/app/api/`**:

- `ai/` - Text-to-SQL AI endpoint powered by Google Gemini
- `leagues/` - League-specific data endpoints
- `matches/` - Match listing and details
- `stats/` - Statistics endpoints (players, teams, aggregates)
- `players/` - Player-specific data
- `text-to-sql/` - Legacy AI endpoint (deprecated)
- `health/` - Health check endpoint
- `cache/` - Cache management
- `news/` - News/RSS aggregation

**API Rate Limiting**: Applied to all API routes via `src/middleware.ts` using Upstash Redis rate limiting. Limit headers added to responses:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

### State Management

**League Selection System** (`src/contexts/LeagueContext.tsx`):

- Central context manages league selection (IPL/WPL/BBL)
- Persists user preference in localStorage
- Animates transitions between leagues
- Provides `leagueConfig` for league-specific settings and messaging

**TanStack Query** (`src/providers/QueryProvider.tsx`):

- Used for server state management and caching
- All API calls should use `useQuery` or `useMutation` hooks

### Services Layer

**AI Text-to-SQL Service** (`src/services/gemini-sql.ts`):

- Converts natural language cricket queries to SQL
- Contains hardcoded master prompt (reference: `master_prompt.md` is outdated)
- Critical security: Only generates SELECT statements, validates against allowlist
- Handles player name resolution and BBL season date calculations

**Query Services**:

- `cricket-query.ts` - Orchestrates AI SQL generation, validation, and execution
- `matchService.ts` / `playerService.ts` / `statsService.ts` - Simple data fetching wrappers

### Component Architecture

**League-Aware Components**:

- `AppWithLeagueSelection.tsx` - Wraps app and shows league selection UI on first visit
- `Header` - Contains league switcher and navigation
- `Footer` - Site footer

**Stats Components** (`src/components/`):

- `Matchup.tsx` - Player vs player/bowler matchup analysis
- `TeamWins.tsx` / `TeamAverages.tsx` - Team-based statistics
- `RunScorers.tsx` / `WicketTakers.tsx` - Top performers
- `FallOfWickets.tsx` - Wicket analysis
- `BowlingWicketTypes.tsx` - Wicket type breakdown

**UI Components** (`src/components/ui/`):

- Reusable UI primitives (buttons, cards, tabs, etc.)
- Shared component library for consistency

### Utilities

**SQL Validation** (`src/lib/sql-validator.ts`):

- Validates all generated SQL against allowlist (no DDL/DML)
- Prevents dangerous operations
- Enforces row limits (max 1000)

**Response Formatting** (`src/lib/response-formatter.ts`):

- Standardizes API response format
- Handles error normalization

**Result Normalization** (`src/lib/result-normalizer.ts`):

- Transforms raw SQL results into frontend-friendly format
- `result-normalizer.ts` - Flatten arrays, format numbers, handle nulls

**Custom Hooks** (`src/hooks/`):

- `useLeagueAPI.ts` - Fetches league data with React Query
- `useLocalStorage.ts` - Type-safe localStorage wrapper
- `useTextToSql.ts` - Connects to AI endpoint

## Key Development Patterns

### Adding New API Endpoints

1. Create route handler in `src/app/api/[feature]/route.ts`
2. Use standard request/response pattern
3. Apply rate limiting automatically via middleware
4. Return standardized responses using `response-formatter.ts`
5. Add TypeScript types to `src/types/`

### Database Queries

- ALWAYS use Prisma client from `src/lib/prisma.ts`
- For performance-sensitive queries, leverage Prisma's query logging in development
- Add indexes to frequently-queried columns (see existing indexes in `schema.prisma`)
- Use parameterized queries - never string concatenation

### State Management

- Server state: Use TanStack Query hooks (see `src/hooks/use*API.ts`)
- Client state: Use React Context (LeagueContext pattern)
- Persistent state: Use `useLocalStorage` hook

### Styling

- **Tailwind CSS v4** (see `tailwind.config.ts`)
- Use utility-first approach
- Component-specific styles should be colocated

### Error Handling

- API routes should catch errors and return standardized responses
- Use `response-formatter.ts` for consistent error shapes
- Log errors with context using `logger.ts`

## Environment Variables

Required environment variables (check `.env`):

- `DATABASE_URL` - PostgreSQL connection string
- Upstash Redis credentials (for rate limiting)
- Google AI API key (for Gemini text-to-SQL)
- Other API keys for external services

## Testing Approach

No formal test suite currently exists. Manual testing is done via:

1. Development server with hot reload
2. TypeScript compilation checks
3. ESLint for code quality
4. Prettier for formatting consistency

## Deployment

**Vercel deployment ready**:

- Build command: `npm run vercel-build` (includes Prisma generate + migrate + build)
- Post-build migrations: `prisma migrate deploy`
- Analytics: Vercel Analytics integrated

## Important Notes

- **Prisma client is NOT in `node_modules/@prisma/client`** - it's generated to `src/generated/prisma/client`. Always import from `@/generated/prisma/client`.
- **AI Prompt Location**: The active AI prompt is hardcoded in `src/services/gemini-sql.ts`. `master_prompt.md` is outdated documentation only.
- **Rate Limiting**: All API routes are rate-limited by IP. Respect headers and handle 429 responses.
- **Security**: SQL validation is critical - never bypass `sql-validator.ts` for user-generated queries.
- **League System**: Many components depend on `LeagueContext` - always render within `LeagueProvider`.
- **Turbopack**: Using Next.js Turbopack for faster dev builds (`--turbopack` flag in dev script).
