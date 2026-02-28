# Kairos

A church fellowship presentation builder. Fill in your fellowship details — anchor name, sermon leader, song lyrics, Bible verse, announcements, and prayer points — and Claude AI generates a structured, slide-by-slide presentation ready to project fullscreen.

## Features

- AI-generated slides via Claude (`claude-sonnet-4-6`) using the Vercel AI SDK
- Fullscreen presenter mode with keyboard navigation (arrow keys, Escape)
- Upload a lyrics image — Claude extracts the text automatically
- Save and manage presentations (Prisma + Supabase PostgreSQL)
- Google OAuth sign-in via Supabase Auth

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Vercel AI SDK** + `@ai-sdk/anthropic`
- **Prisma 6** ORM → Supabase PostgreSQL
- **Supabase Auth** (Google OAuth only)
- **Zustand** for slide/presenter state
- **Tailwind CSS v4** + shadcn/ui

## Setup

1. Clone and install:
   ```bash
   npm install
   ```

2. Copy `.env` and fill in your values:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   DATABASE_URL=postgresql://...
   ```

3. Run Prisma migration:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```
