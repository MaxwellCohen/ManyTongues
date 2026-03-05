/**
 * Ambient types for the experimental Translator API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Translator
 */

type TranslatorAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable'

interface TranslatorCreateOptions {
  sourceLanguage: string
  targetLanguage: string
  monitor?: unknown
  signal?: AbortSignal
}

interface TranslatorInstance {
  translate(text: string): Promise<string>
  translateStreaming(text: string): ReadableStream<string>
  measureInputUsage(text: string): Promise<unknown>
  destroy(): void
  readonly inputQuota: number
  readonly sourceLanguage: string
  readonly targetLanguage: string
}

interface TranslatorConstructor {
  availability(options: {
    sourceLanguage: string
    targetLanguage: string
  }): Promise<TranslatorAvailability>
  create(options: TranslatorCreateOptions): Promise<TranslatorInstance>
}

declare global {
  interface Window {
    Translator?: TranslatorConstructor
  }
  const Translator: TranslatorConstructor | undefined
}

export {}
