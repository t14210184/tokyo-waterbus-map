/**
 * JMA Environment Context UI Panel Component for Tokyo Waterbus Atlas (Phase v1.1.0-RC.3.2)
 * Renders low-profile ambient weather context widget with aria-live accessibility and mandatory disclaimers.
 * Supports URL query parameter ?env_scenario= for deterministic visual audit testing.
 */

import { fetchJmaEnvironmentContext } from '../core/environment-service.js';

export async function renderEnvironmentPanel(containerEl, overrideInput = null) {
  if (!containerEl) return null;

  // Read URL query parameter if present for visual audit testing
  let activeOverride = overrideInput;
  if (!activeOverride && typeof window !== 'undefined' && window.location) {
    const urlParams = new URLSearchParams(window.location.search);
    const envScenario = urlParams.get('env_scenario');

    if (envScenario === 'live-success') {
      activeOverride = [
        {
          reportDatetime: new Date().toISOString(),
          timeSeries: [
            {
              timeDefines: [new Date().toISOString()],
              areas: [
                {
                  area: { name: '東京都', code: '130000' },
                  weathers: ['晴時多雲']
                }
              ]
            }
          ]
        }
      ];
    } else if (envScenario === 'network-failure') {
      activeOverride = 'NETWORK_ERROR';
    } else if (envScenario === 'timeout') {
      activeOverride = 'TIMEOUT_ERROR';
    } else if (envScenario === 'invalid-payload') {
      activeOverride = [{ invalidField: true }];
    } else if (envScenario === 'stale-payload') {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      activeOverride = [
        {
          reportDatetime: twelveHoursAgo,
          timeSeries: [
            {
              timeDefines: [twelveHoursAgo],
              areas: [
                {
                  area: { name: '東京都', code: '130000' },
                  weathers: ['晴時多雲']
                }
              ]
            }
          ]
        }
      ];
    }
  }

  // Render initial loading state
  containerEl.innerHTML = `
    <div class="env-context-card env-loading" aria-live="polite">
      <div class="env-header">東京環境參考載入中…</div>
    </div>
  `;

  const result = await fetchJmaEnvironmentContext(activeOverride);

  if (result.state === 'AVAILABLE') {
    containerEl.innerHTML = `
      <div class="env-context-card env-available" aria-live="polite">
        <div class="env-card-badge">環境參考</div>
        <div class="env-header">東京環境參考</div>
        <div class="env-source">日本氣象廳（JMA）資料</div>
        <div class="env-time">發布：${result.publishedAtJst}</div>
        <div class="env-summary">${result.weatherText}</div>
        <div class="env-disclaimer">此資訊僅供環境參考，可能影響水上運輸；請確認官方當日公告。</div>
        <a href="https://www.jma.go.jp/bosai/forecast/" target="_blank" rel="noopener noreferrer" class="env-link">查看 JMA 氣象廳官網 ↗</a>
      </div>
    `;
  } else {
    containerEl.innerHTML = `
      <div class="env-context-card env-unavailable" aria-live="polite">
        <div class="env-header">東京環境參考目前無法取得</div>
        <div class="env-disclaimer">水上巴士營運狀況請以官方公告為準。</div>
        <a href="https://www.jma.go.jp/bosai/forecast/" target="_blank" rel="noopener noreferrer" class="env-link">查看 JMA 氣象廳官網 ↗</a>
      </div>
    `;
  }

  return result;
}
