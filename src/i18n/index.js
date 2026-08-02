/**
 * Framework-free i18n Core Engine for Tokyo Waterbus Atlas (Phase 1A)
 * Supports URL param `?lang=`, localStorage persistence, and zh-TW fallback.
 */

import { zhTW } from './locales/zh-TW.js';
import { en } from './locales/en.js';
import { ja } from './locales/ja.js';
import { ko } from './locales/ko.js';

const LOCALES = {
  'zh-TW': zhTW,
  'en': en,
  'ja': ja,
  'ko': ko
};

const HTML_LANG_MAP = {
  'zh-TW': 'zh-Hant',
  'en': 'en',
  'ja': 'ja',
  'ko': 'ko'
};

let currentLocale = 'zh-TW';
const subscribers = new Set();

function detectInitialLocale() {
  // 1. URL parameter takes precedence (?lang=en)
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam && LOCALES[langParam]) {
      return langParam;
    }
  }

  // 2. LocalStorage persistence
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('tokyo_waterbus_atlas_locale');
    if (saved && LOCALES[saved]) {
      return saved;
    }
  }

  // 3. Fallback to zh-TW
  return 'zh-TW';
}

export function initI18n() {
  currentLocale = detectInitialLocale();
  updateHtmlLangAttribute(currentLocale);
  return currentLocale;
}

export function getLocale() {
  return currentLocale;
}

export function setLocale(locale) {
  const targetLocale = LOCALES[locale] ? locale : 'zh-TW';
  currentLocale = targetLocale;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('tokyo_waterbus_atlas_locale', targetLocale);
    } catch (e) {
      console.warn('Could not save locale to localStorage:', e);
    }
  }

  updateHtmlLangAttribute(targetLocale);
  subscribers.forEach(cb => {
    try {
      cb(targetLocale);
    } catch (err) {
      console.error('i18n subscriber error:', err);
    }
  });
}

export function updateHtmlLangAttribute(locale) {
  if (typeof document !== 'undefined' && document.documentElement) {
    const htmlLang = HTML_LANG_MAP[locale] || 'zh-Hant';
    document.documentElement.setAttribute('lang', htmlLang);
  }
}

export function subscribeI18n(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function t(keyPath, fallback = '') {
  const keys = keyPath.split('.');
  const activeDict = LOCALES[currentLocale] || LOCALES['zh-TW'];
  const fallbackDict = LOCALES['zh-TW'];

  let result = activeDict;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      result = null;
      break;
    }
  }

  if (result !== null && result !== undefined) {
    return result;
  }

  // Fallback to zh-TW if key missing in active locale
  let fbResult = fallbackDict;
  for (const k of keys) {
    if (fbResult && typeof fbResult === 'object' && k in fbResult) {
      fbResult = fbResult[k];
    } else {
      fbResult = null;
      break;
    }
  }

  return (fbResult !== null && fbResult !== undefined) ? fbResult : fallback;
}

// Global debug export
if (typeof window !== 'undefined') {
  window.__atlasI18n = {
    getLocale,
    setLocale,
    t
  };
}
