/** Target languages (BCP 47) for translation. Shared by translator UI and server. */
export const TARGET_LANGUAGES = [
  'it', // Italian
  'es', // Spanish
  'fr', // French
  'de', // German
  'pt', // Portuguese
  'ru', // Russian
  'uk', // Ukrainian
  'pl', // Polish
  'nl', // Dutch
  'sv', // Swedish
  'da', // Danish
  'el', // Greek
  'tr', // Turkish
  'hu', // Hungarian
  'ro', // Romanian
  'cs', // Czech
  'bg', // Bulgarian
  'vi', // Vietnamese
  'ja', // Japanese
  'ko', // Korean
  'zh', // Chinese
  'ar', // Arabic
  'he', // Hebrew
  'af', // Afrikaans
  'sq', // Albanian
  'am', // Amharic
  'hy', // Armenian
  'az', // Azerbaijani
  'eu', // Basque
  'be', // Belarusian
  'bn', // Bengali
  'bs', // Bosnian
  'my', // Burmese
  'ca', // Catalan
  'zh-Hans', // Chinese (Simplified)
  'zh-Hant', // Chinese (Traditional)
  'hr', // Croatian
  'en', // English
  'et', // Estonian
  'fil', // Filipino
  'fi', // Finnish
  'fy', // Frisian
  'gl', // Galician
  'ka', // Georgian
  'gn', // Guarani
  'gu', // Gujarati
  'ha', // Hausa
  'iw', // Hebrew (legacy)
  'hi', // Hindi
  'is', // Icelandic
  'ig', // Igbo
  'id', // Indonesian
  'ga', // Irish
  'it', // Italian
  'kn', // Kannada
  'km', // Khmer
  'ky', // Kyrgyz
  'lo', // Lao
  'lv', // Latvian
  'ln', // Lingala
  'lt', // Lithuanian
  'lb', // Luxembourgish
  'mk', // Macedonian
  'ms', // Malay
  'ml', // Malayalam
  'mt', // Maltese
  'mr', // Marathi
  'mn', // Mongolian
  'ne', // Nepali
  'nb', // Norwegian Bokmål
  'no', // Norwegian
  'or', // Odia
  'fa', // Persian
  'pa', // Punjabi
  'gd', // Scots Gaelic
  'sr', // Serbian
  'sk', // Slovak
  'sl', // Slovenian
  'so', // Somali
  'sw', // Swahili
  'tl', // Tagalog
  'tg', // Tajik
  'ta', // Tamil
  'te', // Telugu
  'th', // Thai
  'ur', // Urdu
  'uz', // Uzbek
  'cy', // Welsh
  'zu', // Zulu
] as const

export type TargetLanguage = (typeof TARGET_LANGUAGES)[number]
