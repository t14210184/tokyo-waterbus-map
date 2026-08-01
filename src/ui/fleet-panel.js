/**
 * Fleet Operations Panel Renderer for Tokyo Waterbus Atlas (v1.1.0-RC.3.18 Operational Truth)
 * Renders operational status per operator/route, suspension notices, and disclaimers.
 */
import { ICONS } from '../assets/icons.js';
import { SERVICE_STATUS_REGISTRY, getRouteOperationalState } from '../data/service-status.js';

export function renderFleetPanel(container, vessels = []) {
  const mizubeStatus = SERVICE_STATUS_REGISTRY.operators['tokyo-mizube-line'];
  const cruiseStatus = SERVICE_STATUS_REGISTRY.operators['tokyo-cruise'];

  container.innerHTML = `
    <div class="fleet-panel-wrapper" style="padding: 0.15rem 0;">
      <!-- Operational Status Header Bar -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; background: var(--surface-dark-elevated); border-color: var(--ocean-500);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.45rem;">
          <h2 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
            ${ICONS.ship} 船隊運航與營運狀態
          </h2>
          <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b;">
            NO LIVE SIMULATION
          </span>
        </div>

        <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.4; background: rgba(7, 25, 35, 0.8); padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.2);">
          <div style="color: #38bdf8; font-weight: 600; margin-bottom: 0.2rem;">● 目前無可驗證的模擬航行 (Safe Lockout Active)</div>
          本系統不提供即時 GPS / AIS 船位。因航線包含待審核地理區段，或處於非服務時段，所有動態船位模擬全數安全停用。
        </div>
      </div>

      <!-- Operator 1: 東京水辺ライン (SUSPENDED) -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; border-left: 4px solid #ef4444; background: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <h3 style="font-size: 0.9rem; font-weight: 700; color: #ffffff; margin: 0;">
            ${mizubeStatus.name}
          </h3>
          <span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; font-weight: 600;">
            ${mizubeStatus.publicLabel}
          </span>
        </div>

        <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.5rem; line-height: 1.4;">
          ${mizubeStatus.publicMessage}
        </div>

        <div style="font-size: 0.7rem; color: #64748b; margin-bottom: 0.5rem;">
          生效日期：${mizubeStatus.effectiveFrom} ｜ 官方預計復航：${mizubeStatus.expectedResume} (待確定) ｜ 查核時間：2026-08-02
        </div>

        <a href="${mizubeStatus.sourceUrl}" target="_blank" rel="noopener" class="btn btn-secondary" style="font-size: 0.72rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
          ${ICONS.externalLink} 點此開啟 ${mizubeStatus.sourceName} 公告
        </a>
      </div>

      <!-- Operator 2: TOKYO CRUISE (OPERATING WITH GEOMETRY LOCK) -->
      <div class="card" style="margin-bottom: 0.75rem; padding: 0.75rem; border-left: 4px solid #38bdf8; background: #0f172a;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <h3 style="font-size: 0.9rem; font-weight: 700; color: #ffffff; margin: 0;">
            ${cruiseStatus.name}
          </h3>
          <span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; font-weight: 600;">
            ${cruiseStatus.publicLabel}
          </span>
        </div>

        <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.5rem; line-height: 1.4;">
          ${cruiseStatus.publicMessage} 航線包含待人工地理審核區段，依安全規則鎖定動態模擬。
        </div>

        <div style="font-size: 0.7rem; color: #64748b; margin-bottom: 0.5rem;">
          服務時段：09:00 - 19:00 JST ｜ 查核時間：2026-08-02
        </div>

        <a href="${cruiseStatus.sourceUrl}" target="_blank" rel="noopener" class="btn btn-secondary" style="font-size: 0.72rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
          ${ICONS.externalLink} 點此開啟 ${cruiseStatus.sourceName}
        </a>
      </div>
    </div>
  `;
}
