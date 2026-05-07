# Boundary Bytes

Cricket statistics query platform built with Next.js 15, TypeScript, and Google Gemini AI. Ask questions about cricket statistics in natural language and receive data-driven insights.

## Features

- **Natural Language to SQL**: Ask cricket statistics questions in plain English
- **Multi-League Support**: IPL, WPL, BBL, WBBL, and SA20
- **Interactive Visualizations**: Charts, tables, and comparative analytics
- **AI Feedback System**: Users can rate response accuracy

## Tech Stack

| Category       | Technologies                               |
| -------------- | ------------------------------------------ |
| Framework      | Next.js 15, React 19, TypeScript 5.8       |
| Data Backend   | External backend APIs (Go)                 |
| AI             | Google Gemini 2.5 Flash, Vercel AI SDK 5.0 |
| State          | TanStack React Query 5.79, Zustand 5.0     |
| Styling        | Tailwind CSS 4.0, Framer Motion, Recharts  |
| Infrastructure | Vercel, Upstash Redis                      |

## Text to SQL with Gemini

- **[Gemini AI Integration](src/services/gemini-sql.ts)**: Structured SQL generation with Zod schema validation and cricket-specific prompt engineering
- **[SQL Injection Prevention](src/lib/sql-validator.ts)**: Multi-layer validation blocking dangerous keywords, restricting to allowlisted tables, enforcing LIMIT clauses
- **[Sequential Query Execution](src/services/gemini-sql.ts)**: Player name resolution via fuzzy matching before main query execution
- **[Team Name Normalization](src/services/gemini-sql.ts)**: CTEs mapping historical team names for consistent aggregation
- **[League Detection NLP](src/services/gemini-sql.ts)**: Auto-detects target league from user questions

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local

# Start development server
bun run dev
```

## Scripts

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `bun run dev`       | Start dev server with Turbopack |
| `bun run build`     | Production build                |
| `bun run lint`      | Run oxlint                      |
| `bun run typecheck` | TypeScript type checking        |
| `bun run format`    | Format with Prettier            |

## Environment Variables

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_GO_API_URL=
```

## Architecture

- **Service Layer**: Business logic and API client wrappers in `src/services/`
- **Validator Pattern**: Centralized input validation in `src/lib/validation/`
- **External API Access**: Frontend calls backend endpoints via `NEXT_PUBLIC_GO_API_URL`
- **Error Boundaries**: Root error handling with fallback UI
