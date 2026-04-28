# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version

This project uses **Next.js 16.2.4** which has breaking changes from earlier versions. Read guides in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — run ESLint (flat config, ESLint 9+)

## Architecture

Next.js App Router project with TypeScript, Tailwind CSS v4, and React 19.

### Routing

- `src/app/page.tsx` — home page (`/`)
- `src/app/leaderboard/page.tsx` — leaderboard page (`/leaderboard`)
- `src/app/layout.tsx` — root layout (renders Header and Navigation on all pages)

### Shared Components

Located in `src/app/components/`. Header and Navigation are client components ("use client"); Breadcrumbs is a server component.

### Styling

- Tailwind CSS v4 via `@tailwindcss/postcss` plugin (uses `@import "tailwindcss"` and `@theme inline` syntax)
- CSS variables defined in `src/app/globals.css`
- No dark mode — light theme only

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).
