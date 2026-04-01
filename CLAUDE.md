# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:5173
npm run build    # TypeScript check + production build to dist/
npm run preview  # preview the production build
```

## What this project is

A fake search engine prop for film/TV productions. It looks and behaves like a real search engine but shows entirely fictional results. Intended to be hosted on GitHub Pages and configured per-production.

**Three routes:**
- `/` — Search page (actors interact with this)
- `/results?q=...` — Results page (same results regardless of query)
- `/edit` — Configuration page, hidden in plain sight via "Settings" in the footer and hamburger menu

**History behaviour:** Navigating from `/edit` → `/` uses `replace: true` so the edit page is never in the actor's back stack.

## Architecture

```
src/
  types/schema.ts        — TypeScript interfaces (SearchEngineConfig, SearchResult, Sitelink)
  data/defaultSchema.ts  — 10 convincing-looking default results
  hooks/useConfig.ts     — reads/writes config to localStorage; shared across all pages
  pages/
    SearchPage.tsx       — centered search UI with logo + hamburger menu
    ResultsPage.tsx      — results list with sticky header + tab bar
    EditPage.tsx         — visual editor + raw JSON editor + import/export
  App.tsx                — BrowserRouter with three routes
```

Config is stored in `localStorage` under the key `searchEngineConfig`. The schema is a plain JSON object — see `src/types/schema.ts`.

## Logo

Drop a file named `logo.png` into `public/`. The `<img>` tag has an `onError` fallback that reveals a coloured text logo if the image is missing.

## Schema / LLM workflow

The edit page exposes **Export JSON** and **Import JSON** buttons alongside a raw JSON textarea. The intended workflow for non-technical users:

1. Export the JSON
2. Give it to an LLM with instructions (e.g. "populate these results for a 1990s FBI investigation")
3. Paste the returned JSON into the textarea and click **Apply JSON**, or import the saved file
4. Click **Launch Simulation** to go to `/` with history replaced

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 (via `@tailwindcss/vite`) · React Router v7
