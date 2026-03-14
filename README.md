# ManyTongues

ManyTongues is a small web app for turning text into visual word clouds.

It has two main tools:

- **Text Cloud**: paste or type any text and the app sizes each word by how often it appears.
- **Translator**: enter a short phrase, translate it into many languages, and render those translations as a word cloud.

The app is built with `TanStack Start`, `React`, and `react-wordcloud`.

## What The App Does

### Text Cloud

The text cloud page lets you:

- paste raw text into a text area
- automatically count repeated words
- render the most common words as a word cloud
- customize the cloud with controls for colors, font sizes, scale, padding, rotations, font family, and background color
- download the finished cloud as a PNG image

This is useful for quickly visualizing themes, repeated terms, or the dominant vocabulary in a block of text.

### Translator

The translator page lets you:

- enter a short phrase
- translate that phrase into many target languages
- show the original phrase and its translations together in a word cloud
- remove individual translations
- adjust each translation's weight so some languages appear larger or smaller in the cloud

Translations are looked up in a Turso database first. If the phrase has already been translated before, the cached result is returned. If not, the app requests translations from external translation providers, stores the result, and then displays it.

## Routes

- `/` home page with links to both tools
- `/text-cloud` text-to-word-cloud generator
- `/translate` phrase translator and multilingual word cloud

## Local Setup

Install dependencies:

```bash
pnpm install
```

Start the app locally:

```bash
pnpm dev
```

## Environment Variables

The text cloud works without external services. The translator needs API keys and database configuration.

Create a `.env` file with:

```bash
DB_URL=
DB_AUTH_TOKEN=
GOOGLE_TRANSLSTE=
MICROSOFT_TRANSLATE_KEY=
```

Notes:

- `DB_URL` and `DB_AUTH_TOKEN` are used for the Turso translation cache.
- `GOOGLE_TRANSLSTE` is the Google Translate API key variable currently used by the codebase.
- `MICROSOFT_TRANSLATE_KEY` is used as a fallback translation provider.

### Optional (analytics)

```bash
VITE_PUBLIC_POSTHOG_KEY=
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Deploying to Vercel

The app is configured for Vercel deployment with Nitro. To deploy:

1. Push your repo to GitHub and [import it in Vercel](https://vercel.com/new).
2. Add the environment variables above in **Project Settings → Environment Variables**.
3. Deploy. Vercel will auto-detect the Nitro/TanStack Start setup.

The `nitro.config.ts` sets the Vercel preset and proxies `/ingest` to PostHog for analytics.

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm typecheck
pnpm lint
pnpm format
pnpm check
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```

## Tech Stack

- `TanStack Start` for the app framework
- `TanStack Router` for file-based routing
- `React` for UI
- `Tailwind CSS` for styling
- `react-wordcloud` and `d3-cloud` for cloud layout/rendering
- `nuqs` for URL search params
- `Drizzle ORM` with `@libsql/client` for Turso persistence
- `Vitest` for tests
- `Biome` for linting and formatting
