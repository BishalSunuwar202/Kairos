# Kairos — Fellowship Builder

An AI-powered church presentation builder for Nepali Christian fellowship communities. Fill in your fellowship details — anchor name, sermon leader, song lyrics, Bible references, announcements, and prayer points — and AI generates a complete, slide-by-slide presentation in **Nepali (Devanagari script)**, ready to project fullscreen.

🌐 **Live:** https://kairos-weld.vercel.app

## Features

- AI generates all slides in Nepali with name transliteration and Bikram Sambat (BS) date conversion
- AI-generated warm Nepali Christian welcome message for each fellowship
- Fullscreen presenter mode with keyboard navigation (arrow keys, Escape)
- Slide format toolbar: font size, bold, underline, colors, padding, vertical & horizontal text alignment
- Save and manage presentations in a personal library
- Public shareable links — share slides with your congregation (no login required to view)
- Print / export slides to PDF
- Demo mode with a pre-filled sample Nepali presentation
- Google OAuth sign-in

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Vercel AI SDK** + `@ai-sdk/google` (Gemini 2.5 Flash Lite)
- **Supabase** — PostgreSQL database + Google OAuth auth (no Prisma, schema managed via Supabase SQL Editor)
- **Zustand** for slide/presenter state
- **Tailwind CSS v4** + shadcn/ui

## Setup

1. Clone and install:
   ```bash
   npm install
   ```

2. Create a `.env` file with your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
   GOOGLE_GENERATIVE_AI_API_KEY=AIza...
   LYRICS_SUPABASE_URL=https://yyy.supabase.co
   LYRICS_SUPABASE_ANON_KEY=eyJ...
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

## Deployment

Deployed on Vercel. Add all environment variables in Vercel → Project → Settings → Environment Variables.

In Supabase → Authentication → URL Configuration, set:
- **Site URL**: `https://your-vercel-domain.vercel.app`
- **Redirect URLs**: `https://your-vercel-domain.vercel.app/**`
