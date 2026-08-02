/**
 * "Today Status" (今天狀態) Panel Renderer for Tokyo Waterbus Atlas (v1.1.0-RC.3.22)
 * Truthful status layer with official operator links, timestamps, and service states.
 */

import { ICONS } from '../assets/icons.js';
import { SERVICE_STATUS_REGISTRY } from '../data/service-status.js';

export function renderTodayStatusPanel(container) {
  const mizubeStatus = SERVICE_STATUS_REGISTRY.operators['tokyo-mizube-line'];

  container.innerHTML = `
    <div class="today-status-panel-wrapper" style="padding: 0.15rem 0;">
      <!-- Truthful Status Header Card -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; background: var(--surface-dark-elevated); border-color: var(--ocean-500);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem;">
          <h2 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
            ${ICONS.ship} 今日營運狀態與官方連結
          </h2>
          <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8;">
            OFFICIAL LINKS
          </span>
        </div>

        <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.5; background: rgba(7, 25, 35, 0.8); padding: 0.6rem; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <div style="color: #38bdf8; font-weight: 600; margin-bottom: 0.25rem;">● 本系統提供官方驗證入口，不虛構即時船位</div>
          東京水上巴士 Atlas 為參考導覽工具，幫助您快速前往各航商當日最新官方營運頁面與時刻表。搭乘前請務必確認官方最新公告。
        </div>
      </div>

      <!-- Operator 1: TOKYO CRUISE -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; border-left: 4px solid #38bdf8; background: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0;">
            TOKYO CRUISE (東京都觀光汽船)
          </h3>
          <span class="badge" style="background: rgba(16, 185, 129, 0.18); color: #10b981; border: 1px solid #10b981; font-weight: 600;">
            正常狀態待官方確認
          </span>
        </div>

        <div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.6rem; line-height: 1.45;">
          隅田川線、淺草-台場直航線、日之出-台場線等常態航班，請點擊下方官方連結查看今日最新動態與航班表。
        </div>

        <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.6rem;">
          查核依據：公開時刻表與官方告示 ｜ 查核時間：2026-08-02
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="https://www.suijobus.co.jp/guide/operation/" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.73rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8;">
            ${ICONS.externalLink} TOKYO CRUISE 今日運航狀況
          </a>
          <a href="https://www.suijobus.co.jp/guide/timetable/" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.73rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
            ${ICONS.externalLink} 官方時刻表與票價
          </a>
        </div>
      </div>

      <!-- Operator 2: 東京水辺ライン (SUSPENDED) -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; border-left: 4px solid #ef4444; background: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0;">
            ${mizubeStatus.name}
          </h3>
          <span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; font-weight: 600;">
            ${mizubeStatus.publicLabel}
          </span>
        </div>

        <div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 0.5rem; line-height: 1.45;">
          ${mizubeStatus.publicMessage}
        </div>

        <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.6rem;">
          生效日期：${mizubeStatus.effectiveFrom} ｜ 官方預計復航：${mizubeStatus.expectedResume} (待官方發布) ｜ 查核時間：2026-08-02
        </div>

        <a href="${mizubeStatus.sourceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="font-size: 0.73rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;">
          ${ICONS.externalLink} 點此開啟 ${mizubeStatus.sourceName} 官方營運公告
        </a>
      </div>

      <!-- Footer Disclosure Statement -->
      <div style="font-size: 0.7rem; color: #64748b; text-align: center; margin-top: 0.8rem; line-height: 1.4;">
        This app tells me where to check today's official answer; it does not invent it.<br/>
        本系統純屬旅遊導覽參考，不代表官方發言或航行保障。
      </div>
    </div>
  `;
}
