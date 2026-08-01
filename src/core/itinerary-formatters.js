/**
 * Display Formatters & Data Integrity Helpers for Tokyo Waterbus Atlas (Phase 4A.3)
 * Guarantees zero user-facing 'undefined', 'null', 'NaN', '[object Object]', or raw missing data.
 */

import { ICONS } from '../assets/icons.js';
import { ROUTES } from '../data/routes.js';

/**
 * Safely format text value with fallback
 */
export function displayText(value, fallback = '') {
  if (value === null || value === undefined || Number.isNaN(value) || value === 'undefined' || value === 'null') {
    return fallback;
  }
  const str = String(value).trim();
  return str.length > 0 ? str : fallback;
}

/**
 * Safely format localized entity name
 */
export function displayLocalizedName(entity, locale = 'zhHant') {
  if (!entity || typeof entity !== 'object') return { main: '未命名碼頭', sub: '' };

  const name = entity.name || {};
  const main = displayText(name[locale] || name.zhHant || name.ja || name.en, '未命名碼頭');

  const ja = displayText(name.ja);
  const en = displayText(name.en);

  let sub = '';
  if (ja && en && ja !== main && en !== main) {
    sub = `${ja} / ${en}`;
  } else if (ja && ja !== main) {
    sub = ja;
  } else if (en && en !== main) {
    sub = en;
  }

  return { main, sub };
}

/**
 * Format Combobox Option label safely: "淺草碼頭 (浅草 / Asakusa Pier)"
 */
export function displayComboboxLabel(pier) {
  if (!pier) return '未指定碼頭';
  const { main, sub } = displayLocalizedName(pier);
  return sub ? `${main} (${sub})` : main;
}

/**
 * Format Pier Operation Status into localized badge metadata
 */
export function displayPierStatus(pier) {
  const status = displayText(pier?.status).toLowerCase();

  if (status === 'active') {
    return {
      text: '常態營運',
      class: 'status-active',
      icon: ICONS.check,
      ariaLabel: '狀態：常態營運'
    };
  }

  if (status === 'seasonal') {
    return {
      text: '季節性營運',
      class: 'status-seasonal',
      icon: ICONS.alert,
      ariaLabel: '狀態：季節性營運'
    };
  }

  if (status === 'verification-needed' || status === 'verify' || status === 'unverified') {
    return {
      text: '請向官方確認',
      class: 'status-verify',
      icon: ICONS.alert,
      ariaLabel: '狀態：請向官方確認'
    };
  }

  if (status === 'inactive' || status === 'historical') {
    return {
      text: '暫停／歷史碼頭',
      class: 'status-inactive',
      icon: ICONS.alert,
      ariaLabel: '狀態：暫停或歷史碼頭'
    };
  }

  return {
    text: '資料待確認',
    class: 'status-verify',
    icon: ICONS.alert,
    ariaLabel: '狀態：資料待確認'
  };
}

/**
 * Derive or format operator info
 */
export function displayOperator(pierOrRoute) {
  if (!pierOrRoute) return '營運商資訊待確認';

  // If explicit operator string exists (e.g. route)
  if (typeof pierOrRoute.operator === 'string' && pierOrRoute.operator.trim().length > 0) {
    return pierOrRoute.operator;
  }

  // If pier object, infer operators from served routes
  if (Array.isArray(pierOrRoute.routes) && pierOrRoute.routes.length > 0) {
    const servedOperators = Array.from(new Set(
      pierOrRoute.routes.map(rId => {
        const route = ROUTES.find(r => r.id === rId);
        return route ? route.operator : null;
      }).filter(Boolean)
    ));

    if (servedOperators.length === 1) {
      return servedOperators[0];
    }
    if (servedOperators.length > 1) {
      return `多營運商交會 (${servedOperators.join(' / ')})`;
    }
  }

  return '營運商資訊待確認';
}

/**
 * Format Confidence Metadata Badge
 */
export function displayConfidence(confidenceKey) {
  const key = displayText(confidenceKey).toLowerCase();

  if (key === 'official-reference') {
    return {
      text: '官方參考資料',
      class: 'conf-official',
      icon: ICONS.check
    };
  }

  if (key === 'operator-reference') {
    return {
      text: '營運商／觀光局資料',
      class: 'conf-operator',
      icon: ICONS.check
    };
  }

  if (key === 'simulated') {
    return {
      text: '模擬動態 (非AIS)',
      class: 'conf-simulated',
      icon: ICONS.ship
    };
  }

  return {
    text: '旅遊規劃預估',
    class: 'conf-estimate',
    icon: ICONS.alert
  };
}

/**
 * Format Nearest Transit list safely
 */
export function displayTransit(nearestTransit) {
  if (Array.isArray(nearestTransit) && nearestTransit.length > 0) {
    return nearestTransit.map(t => displayText(t)).filter(t => t.length > 0);
  }
  return ['鄰近大眾運輸資訊請參閱官方公告'];
}
