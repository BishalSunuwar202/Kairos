# Kairos — Claude Code Rules

## Security
- NEVER read, log, or expose `.env` / `.env.local` file contents
- NEVER hardcode API keys, secrets, or credentials anywhere in code
- All secret env vars (ANTHROPIC_API_KEY, Supabase keys) are server-only — never use NEXT_PUBLIC_ prefix for secrets

## Next.js 16 Conventions
- Use `proxy.ts` (NOT middleware.ts) for route protection — Next.js 16 renamed it
- Export function must be named `proxy` (not `middleware`)
- proxy.ts is for routing only (redirects, rewrites) — never put auth validation logic there
- Auth validation belongs in Server Components and Server Actions

## Data Fetching
- Use React 19 Server Components for data reads — no TanStack Query
- Use Server Actions (`'use server'`) for all mutations (save, delete, sign out)
- After mutations, use `revalidatePath()` to update cached data

## AI / Claude
- Always use Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) — never call Anthropic API directly with fetch
- Model: `claude-sonnet-4-6`
- Use `streamText` for streaming responses in API routes
- Return `result.toDataStreamResponse()` from route handlers

## State Management
- Zustand for client-only UI state (slide viewer, presentation slides)
- No TanStack Query or Redux

## Package Rules
- Use latest stable versions — do not downgrade packages without a reason
- Do not add packages that duplicate existing functionality
- Tailwind v4 is installed — do not install v3 utilities or plugins

## Database / Prisma
- Use Prisma client (`src/lib/prisma.ts`) for ALL database reads and writes
- Never use Supabase client for database queries — Supabase is auth-only
- Always verify user identity via Supabase `auth.getUser()` in Server Actions before any DB operation
- Use `userId` check in every Prisma query to prevent cross-user data access
- Prisma client is generated to `src/generated/prisma` — import from there
- Run `npx prisma migrate dev` for schema changes, never edit the DB directly

## Code Style
- TypeScript strict mode — no `any` types
- No `console.log` left in production code
- Prefer Server Components over Client Components unless interactivity is needed
- Add `'use client'` only when necessary
