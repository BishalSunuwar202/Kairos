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
- Always use Vercel AI SDK (`ai` + provider package) — never call AI APIs directly with fetch
- Model: `gemini-2.5-flash-lite` via `@ai-sdk/google`
- Use `generateText` for structured data (JSON) responses — returns complete text, easier to parse
- Use `streamText` only for chat/prose where partial output is useful to the user

## State Management
- Zustand for client-only UI state (slide viewer, presentation slides)
- No TanStack Query or Redux

## Package Rules
- Use latest stable versions — do not downgrade packages without a reason
- Do not add packages that duplicate existing functionality
- Tailwind v4 is installed — do not install v3 utilities or plugins

## Database / Supabase
- Use Supabase client (`src/lib/supabase/server.ts`) for ALL database reads and writes in Server Actions
- Use Supabase client (`src/lib/supabase/client.ts`) for auth interactions in Client Components
- No Prisma — table schema is managed via Supabase SQL Editor
- RLS (Row Level Security) is enabled on all tables — user isolation is enforced at the database level
- Never bypass RLS by using the service role key in client-facing code

## Code Style
- TypeScript strict mode — no `any` types
- No `console.log` left in production code
- Prefer Server Components over Client Components unless interactivity is needed
- Add `'use client'` only when necessary
