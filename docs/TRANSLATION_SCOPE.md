# Translation Scope & i18n Strategy: Phase 1A

> **Version**: `v1.1.0-RC.3.23`  
> **Status**: i18n Coverage & Categorization Specification

---

## 🌐 Supported Locales

- `zh-TW`: Traditional Chinese (繁體中文 - Default Baseline)
- `en`: English
- `ja`: Japanese (日本語)
- `ko`: Korean (한국어)

---

## 🎯 100% Translated Traveller UI Scope (Phase 1A)

The following components are 100% translated across all four supported locales:

1. **Header & Brand Area**: App title, brand subtitle, version badge, language selector label.
2. **Primary Navigation Tabs**: `今天狀態` / `航線` / `碼頭` / `行程規劃` / `攻略` / `探索`.
3. **"Today Status" Gateway (`今天狀態`)**: Operator names, status badges (`正常狀態待官方確認`, `暫停營運`), official links, disclaimers.
4. **Header Status Chip & Offline Demo**: `● 目前無可驗證的模擬航行`, `▶ 啟動離線示範`, `⏹ 停止示範`, `重設示範`, scannable disclaimer banner.
5. **Data Trust Levels Drawer**: Explanations for Level A, Level B, Level C, and Level D.
6. **Pier Arrival Cards (Four Featured Piers)**: Localized names, official Japanese names, romanization, route context, address, transit access, "before leaving" checklist, official action buttons, Google Maps area handoff button, wayfinding confidence, facilities, missed service fallbacks, source disclosures.
7. **Map Overlay & Floating Controls**: Reset view tooltip, basemap mode labels (`深色`, `淺色`, `無(參考資料)`).
8. **Footer Disclosures**: Gateway title, official operator link anchors, secondary review portal entry button.

---

## 🛠 Intentionally Untranslated Engineering/Review Scope

The following developer/reviewer-only artifacts MAY remain in Traditional Chinese during Phase 1A, categorized strictly under "資料品質與審核 / Data quality & review":

- 13 RGR geographic review canonical records (`RGR-sumida-river-13` through `RGR-mizube-line-11`).
- Human review intake CSV schema and local validation error messages.
- Developer diagnostic console logs and build test scripts.
