const MICROSOFT_TRANSLATE_ENDPOINT = 'https://api.cognitive.microsofttranslator.com'

// Keep one entry per language where region variants would be redundant.
// Script variants stay when they represent materially different output options.
const MICROSOFT_TARGET_LANGUAGES = [
  'af', // Afrikaans
  'am', // Amharic
  'ar', // Arabic
  'as', // Assamese
  'az', // Azerbaijani
  'ba', // Bashkir
  'be', // Belarusian
  'bg', // Bulgarian
  'bho', // Bhojpuri
  'bn', // Bengali
  'bo', // Tibetan
  'brx', // Bodo
  'bs', // Bosnian
  'ca', // Catalan
  'cs', // Czech
  'cy', // Welsh
  'da', // Danish
  'de', // German
  'doi', // Dogri
  'dsb', // Lower Sorbian
  'dv', // Divehi
  'el', // Greek
  'en', // English
  'es', // Spanish
  'et', // Estonian
  'eu', // Basque
  'fa', // Persian
  'fi', // Finnish
  'fil', // Filipino
  'fj', // Fijian
  'fo', // Faroese
  'fr', // French
  'ga', // Irish
  'gl', // Galician
  'gom', // Konkani
  'gu', // Gujarati
  'ha', // Hausa
  'he', // Hebrew
  'hi', // Hindi
  'hne', // Chhattisgarhi
  'hr', // Croatian
  'hsb', // Upper Sorbian
  'ht', // Haitian Creole
  'hu', // Hungarian
  'hy', // Armenian
  'id', // Indonesian
  'ig', // Igbo
  'ikt', // Inuinnaqtun
  'is', // Icelandic
  'it', // Italian
  'iu', // Inuktitut
  'iu-Latn', // Inuktitut (Latin)
  'ja', // Japanese
  'ka', // Georgian
  'kk', // Kazakh
  'km', // Khmer
  'kmr', // Kurdish (Northern)
  'kn', // Kannada
  'ko', // Korean
  'ks', // Kashmiri
  'ku', // Kurdish (Central)
  'ky', // Kyrgyz
  'lb', // Luxembourgish
  'ln', // Lingala
  'lo', // Lao
  'lt', // Lithuanian
  'lug', // Ganda
  'lv', // Latvian
  'lzh', // Chinese (Literary)
  'mai', // Maithili
  'mg', // Malagasy
  'mi', // Maori
  'mk', // Macedonian
  'ml', // Malayalam
  'mn-Cyrl', // Mongolian (Cyrillic)
  'mn-Mong', // Mongolian (Traditional)
  'mni', // Manipuri
  'mr', // Marathi
  'ms', // Malay
  'mt', // Maltese
  'mww', // Hmong Daw
  'my', // Burmese
  'nb', // Norwegian Bokmal
  'ne', // Nepali
  'nl', // Dutch
  'nso', // Northern Sotho
  'nya', // Nyanja
  'or', // Odia
  'otq', // Queretaro Otomi
  'pa', // Punjabi
  'pl', // Polish
  'prs', // Dari
  'ps', // Pashto
  'pt', // Portuguese
  'ro', // Romanian
  'ru', // Russian
  'run', // Rundi
  'rw', // Kinyarwanda
  'sd', // Sindhi
  'si', // Sinhala
  'sk', // Slovak
  'sl', // Slovenian
  'sm', // Samoan
  'sn', // Shona
  'so', // Somali
  'sq', // Albanian
  'sr-Cyrl', // Serbian (Cyrillic)
  'sr-Latn', // Serbian (Latin)
  'st', // Sesotho
  'sv', // Swedish
  'sw', // Swahili
  'ta', // Tamil
  'te', // Telugu
  'th', // Thai
  'ti', // Tigrinya
  'tk', // Turkmen
  'tlh-Latn', // Klingon (Latin)
  'tlh-Piqd', // Klingon (pIqaD)
  'tn', // Setswana
  'to', // Tongan
  'tr', // Turkish
  'tt', // Tatar
  'ty', // Tahitian
  'ug', // Uyghur
  'uk', // Ukrainian
  'ur', // Urdu
  'uz', // Uzbek
  'vi', // Vietnamese
  'xh', // Xhosa
  'yo', // Yoruba
  'yua', // Yucatec Maya
  'yue', // Cantonese
  'zh-Hans', // Chinese (Simplified)
  'zh-Hant', // Chinese (Traditional)
  'zu', // Zulu
] as const

type MicrosoftTranslateResponse = Array<{
  translations?: Array<{ text?: string; to?: string }>
}>

export async function translatePhraseWithMicrosoft(
  phrase: string,
  sourceLanguage = 'en',
): Promise<Record<string, string>> {
  const key = process.env.MICROSOFT_TRANSLATE_KEY
  if (!key?.trim()) {
    throw new Error('MICROSOFT_TRANSLATE_KEY is not set')
  }

  const url = new URL('/translate', MICROSOFT_TRANSLATE_ENDPOINT)
  url.searchParams.set('api-version', '3.0')
  url.searchParams.set('from', sourceLanguage)
  for (const language of MICROSOFT_TARGET_LANGUAGES) {
    url.searchParams.append('to', language)
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': 'eastus',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ text: phrase }]),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Microsoft translation request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
    )
  }

  const data = (await response.json()) as MicrosoftTranslateResponse
  const translations: Record<string, string> = {}
  for (const translation of data[0]?.translations ?? []) {
    const language = translation.to?.trim()
    const text = translation.text?.trim()
    if (language && text) {
      translations[language] = text
    }
  }

  return translations
}
