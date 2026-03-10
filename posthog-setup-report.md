# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into ManyTongues. Here is a summary of all changes made:

- **Packages installed**: `posthog-js`, `posthog-node`, `@posthog/react`
- **Environment variables** added to `.env`: `VITE_PUBLIC_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST`
- **`src/routes/__root.tsx`**: Wrapped the app body in `<PostHogProvider>` with the `/ingest` reverse proxy host and automatic exception capture enabled
- **`src/utils/posthog-server.ts`** (new file): Singleton `posthog-node` client for use inside TanStack Start server functions
- **`vite.config.ts`**: Added a `/ingest` reverse proxy to `https://us.i.posthog.com` to ensure reliable event delivery
- **`src/lib/translate.functions.ts`**: Captures `phrase_translated` (success) and `phrase_translation_failed` (error) server-side inside the `getOrTranslatePhrase` server function
- **`src/components/WordCloudCanvas.tsx`**: Captures `word_cloud_downloaded` after a PNG is successfully rendered and downloaded
- **`src/routes/translate.tsx`**: Captures `translation_language_removed` when a user hides a language from the word cloud
- **`src/routes/text-cloud.tsx`**: Captures `text_cloud_text_entered` when a user pastes or types source text

## Events

| Event | Description | File |
|---|---|---|
| `phrase_translated` | Fires on the server when a phrase is successfully translated via the API | `src/lib/translate.functions.ts` |
| `phrase_translation_failed` | Fires on the server when a phrase translation request fails | `src/lib/translate.functions.ts` |
| `word_cloud_downloaded` | Fires client-side after the user successfully downloads a PNG word cloud | `src/components/WordCloudCanvas.tsx` |
| `translation_language_removed` | Fires when the user removes a language from the translate page word cloud | `src/routes/translate.tsx` |
| `text_cloud_text_entered` | Fires when the user enters or edits source text on the text cloud page | `src/routes/text-cloud.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/129800/dashboard/1348077)
- [Phrases Translated (Daily)](https://us.posthog.com/project/129800/insights/ObuZMNSe)
- [Word Clouds Downloaded (Daily)](https://us.posthog.com/project/129800/insights/rVmb2V8i)
- [Translate → Download Conversion Funnel](https://us.posthog.com/project/129800/insights/dsiBsH3w)
- [Daily Active Users by Feature](https://us.posthog.com/project/129800/insights/dbnaAEtp)
- [Translation Failures (Daily)](https://us.posthog.com/project/129800/insights/nwiRK1Z6)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
