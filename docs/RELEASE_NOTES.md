# Tokyo Waterbus Atlas — Release Notes

**Version:** v1.1.0
**Release candidate validation:** RC.3.11
**Release date:** 2026-08-01
**Release status:** CONDITIONAL PASS
**Condition:** Human review intake readiness verified (CANONICAL_REVIEW_INTAKE_READY_AWAITING_HUMAN_INPUT; 13 canonical corrected review IDs registered; zero fabricated sign-offs; product code checksums 100% immutable; classification maintained as approximate-reference).

---

## 🌟 產品狀態與說明 (Product Status & Disclosures)

- **Human Review Intake Readiness**: `CANONICAL_REVIEW_INTAKE_READY_AWAITING_HUMAN_INPUT` (13 個正式 Canonical Review IDs 建立與更正，準備接收真實人類 GIS 審核簽核)
- **Zero Fabricated Sign-off Policy**: `PASS` (拒絕任何 AI、系統提示或虛構人員充當簽核者，`eligibleForGeometryChangeCount = 0`)
- **Product Immutability**: `PASS` (`src/data/route-geometries.js` 等核心檔案 SHA-256 哈希值保持 100% 不變)
- **Required Geometry Wording**: `no unexempted land-intersection observed within validator scope` / `segment requires human geographic review` / `route remains approximate-reference`
- **Environment State Contract**: `PASS` (日本氣象廳 JMA 唯讀氣象 Context 5 種情境驗證通過)
- **Map Screenshot Authenticity**: `PASS` (真實 1440x900 Microsoft Edge Viewport 截圖)
- **Raster Basemap Quality Evidence**: `PASS` (CARTO Dark 底圖圖磚解碼完成)
- **Route Geometry Visual Credibility**: `CONDITIONAL` (6 條航線維持 `geometryClassification = approximate-reference`)
- **Overall Status**: `CONDITIONAL PASS`

---

## 🌟 核心功能 (Core Features)

### 1. 水路擬合參考幾何與船隊動態 (Approximate Waterway Geometry & Fleet Simulation)
- 收錄 6 條航線與 14 座碼頭之水路擬合參考幾何 (`geometryClassification = approximate-reference`)。
- 模擬船隻沿審核通過之水路離散折線進行分段測地距離線性插值。

### 2. 日本氣象廳（JMA）環境參考整合 (JMA Environment Context)
- 唯讀整合日本氣象廳 (JMA) 東京都區域氣象開放資料 (Area Code 130000)，提供發布時間、天氣概況與周邊氣象參考。

### 3. 三語碼頭探索與跨水陸旅程規劃器 (Trilingual Explorer & Planner)
- 支援繁體中文、日文、英文搜尋、篩選與圖形轉乘路徑規劃。
