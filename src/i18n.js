import { ref } from 'vue'
import { MESSAGES, EMOTION_I18N, LANGUAGES } from './locales.js'

const STORAGE_KEY = 'thoughtmap-locale'

// null until the user has picked a language (drives the first-run picker).
export const locale = ref(localStorage.getItem(STORAGE_KEY) || null)

export function hasLocale() {
  return !!locale.value
}

export function setLocale(code) {
  locale.value = code
  localStorage.setItem(STORAGE_KEY, code)
  applyDir(code)
}

// Reflect language + direction on <html> (RTL for Arabic).
export function applyDir(code) {
  const lang = LANGUAGES.find((l) => l.code === code)
  document.documentElement.lang = code || 'en'
  document.documentElement.dir = lang?.dir || 'ltr'
}

// Translate a UI key. Reads locale.value so it re-renders on language change.
export function t(key) {
  const loc = locale.value || 'en'
  return MESSAGES[loc]?.[key] ?? MESSAGES.en[key] ?? key
}

// Translate an emotion. Unknown names (user's custom emotions) pass through.
export function tEmotion(name) {
  const loc = locale.value || 'en'
  const entry = EMOTION_I18N[name]
  if (!entry) return name
  return entry[loc] ?? name
}

export { LANGUAGES }
