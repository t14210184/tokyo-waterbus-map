/**
 * Multi-attribute Pier Filtering Engine for Tokyo Waterbus Atlas (Phase 3A)
 */

import { searchPiers } from './pier-search.js';

export function filterPiers(piers, { query = '', operatorFilter = 'all', statusFilter = 'all', routeFilter = 'all' } = {}) {
  let list = searchPiers(piers, query);

  if (operatorFilter !== 'all') {
    list = list.filter(p => {
      const op = p.operator || '';
      if (operatorFilter === 'TOKYO CRUISE') {
        return op.includes('TOKYO') || op.includes('CRUISE');
      } else if (operatorFilter === '東京水辺ライン') {
        return op.includes('水辺ライン') || op.includes('東京水辺');
      }
      return op === operatorFilter;
    });
  }

  if (statusFilter !== 'all') {
    list = list.filter(p => p.status === statusFilter);
  }

  if (routeFilter !== 'all') {
    list = list.filter(p => Array.isArray(p.routes) && p.routes.includes(routeFilter));
  }

  return list;
}
