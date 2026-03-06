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
  'ar-SA', // Arabic (Saudi Arabia)
  'hy', // Armenian
  'az', // Azerbaijani
  'eu', // Basque
  'be', // Belarusian
  'bn-IN', // Bengali (India)
  'bn', // Bengali
  'bs-Cyrl', // Bosnian (Cyrillic)
  'bs', // Bosnian
  'my', // Burmese
  'ca', // Catalan
  'zh-CN', // Chinese (China)
  'zh-HK', // Chinese (Hong Kong)
  'zh-Hans', // Chinese (Simplified)
  'zh-TW', // Chinese (Taiwan)
  'zh-Hant', // Chinese (Traditional)
  'hr', // Croatian
  'nl-BE', // Dutch (Belgium)
  'en-AU', // English (Australia)
  'en-CA', // English (Canada)
  'en-NZ', // English (New Zealand)
  'en-PH', // English (Philippines)
  'en-ZA', // English (South Africa)
  'en-GB', // English (United Kingdom)
  'en-US', // English (United States)
  'en', // English
  'et', // Estonian
  'fil', // Filipino
  'fi', // Finnish
  'fr-CA', // French (Canada)
  'fr-CH', // French (Switzerland)
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
  'pt-BR', // Portuguese (Brazil)
  'pt-PT', // Portuguese (Portugal)
  'pa-PK', // Punjabi (Pakistan)
  'pa', // Punjabi
  'gd', // Scots Gaelic
  'sr', // Serbian
  'sk', // Slovak
  'sl', // Slovenian
  'so', // Somali
  'es-AR', // Spanish (Argentina)
  'es-CL', // Spanish (Chile)
  'es-CO', // Spanish (Colombia)
  'es-CR', // Spanish (Costa Rica)
  'es-EC', // Spanish (Ecuador)
  'es-SV', // Spanish (El Salvador)
  'es-GT', // Spanish (Guatemala)
  'es-HT', // Spanish (Haiti)
  'es-HN', // Spanish (Honduras)
  'es-419', // Spanish (Latin America)
  'es-MX', // Spanish (Mexico)
  'es-NI', // Spanish (Nicaragua)
  'es-PA', // Spanish (Panama)
  'es-PY', // Spanish (Paraguay)
  'es-PE', // Spanish (Peru)
  'es-PR', // Spanish (Puerto Rico)
  'es-ES', // Spanish (Spain)
  'es-US', // Spanish (United States)
  'es-UY', // Spanish (Uruguay)
  'es-VE', // Spanish (Venezuela)
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
