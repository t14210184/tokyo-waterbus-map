/**
 * JMA Environment Context Configuration for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3)
 */

export const JMA_CONTEXT_CONFIG = {
  source: 'Japan Meteorological Agency',
  sourceUrl: 'https://www.jma.go.jp/bosai/forecast/',
  endpoint: 'https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json',
  areaCode: '130000',
  timezone: 'Asia/Tokyo',
  timeoutMs: 5000,
  staleAfterMs: 8 * 60 * 60 * 1000
};
