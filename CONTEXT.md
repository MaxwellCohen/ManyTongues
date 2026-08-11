# ManyTongues domain glossary

## Text Cloud

Paste or type text; the app tokenizes it and renders a **word cloud** sized by word frequency. Supports **Experimental** (wordcloud2.js) and **Classic** (react-wordcloud) engines via URL `engine` param. No external services required.

## Translator

Enter a short **phrase** with a **source language**. The app fetches translations into many target languages and shows them in a word cloud. Users can hide languages, adjust per-language **weights**, and share state via URL search params (Zipson).

## Phrase translation

Server pipeline: validate phrase → Turso **phrase cache** lookup → **Google** provider → **Microsoft** provider fallback → persist → analytics. Exposed as `getOrTranslatePhrase`.

## Translator search state

URL-backed settings for the Translator: phrase input, source language, cloud engine (`experimental` | `classic`), cloud styling for both engines, hidden languages, serialized weights.

## Translator cloud data

Client-side construction of word cloud items from the phrase, visible translations, and weights—including deduplication when multiple languages share the same translated text.

## Turso

LibSQL database (`DB_URL`) used for phrase cache and per-IP rate limiting. The Translator requires Turso; rate limits are skipped when it is not configured.
