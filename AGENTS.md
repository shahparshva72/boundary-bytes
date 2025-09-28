# Agent Instructions for Boundary Bytes

## Commands

- Build: `npm run build` (includes prisma generate)
- Dev: `npm run dev --turbopack`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Format: `npm run format`
- Database seed: `npm run db:seed` (or league-specific: `npm run seed:wpl`, `npm run seed:ipl`)
- Database backfill: `npm run backfill` (or league-specific: `npm run backfill:wpl`, `npm run backfill:ipl`, `npm run backfill:bbl`)
- To run a single test: Use `npm run lint` and `npm run typecheck` for code quality checks. There are no explicit unit test scripts.

## Code Style

- **Formatting**: Prettier with semicolons, single quotes, 100 char width, 2 spaces, trailing commas.
- **Imports**: Use `@/` alias for src imports (e.g., `@/components`, `@/lib`).
- **Components**: PascalCase, functional components with TypeScript interfaces.
- **Files**: kebab-case for directories, PascalCase for components, camelCase for utilities.
- **Database**: Snake_case column names, PascalCase model names.
- **Error handling**: Use proper HTTP status codes, structured error responses.
- **Types**: Define in `src/types/`, use Zod for validation.

## General Guidelines

- Do not run `prisma migrate` commands.
- Run `prisma generate` after schema changes.
- Run `npm run build`, `npm run lint`, `npm run typecheck`, and `npm run format` before pushing.
