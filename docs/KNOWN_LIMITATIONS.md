# Tokyo Waterbus Atlas (東京水上巴士 Atlas) - 已知限制說明 (Known Limitations)

**生效日期**: 2026-08-01  
**適用版本**: v1.1.0 (RC.3.13)

---

## 1. 班次與即時性限制 (Timetable & Real-time Limitations)

1. **無即時 AIS / GPS 定位**:
   - 地圖上動態移動之船隻均為模擬算法推算（Simulated Position），無法反映天候、潮汐、水流或突發調度造成的實際船速變化。
2. **非官方即時排班與訂位系統**:
   - 本系統不提供即時航班查詢、線上訂位、剩餘座位預估或票價試算服務。

---

## 2. 航線幾何與地理精確度限制 (Route Geometry Disclosures)

1. **近似水路擬合幾何參考 (approximate-reference)**:
   - 所有航線幾何標記為 `geometryClassification = approximate-reference`，採離散水路轉折點擬合，用於示意及繪製航線，非官方海事 AIS 航跡或 100% 幾何精確航道。
2. **GitHub Pages 審核門戶零上傳說明 (GitHub Pages Review Portal Disclosures)**:
   - 13 個 Canonical Needs-Review Segments 經公開門戶展示（`PAGES_REVIEW_PORTAL_READY`），本機格式預檢工具 100% 於瀏覽器記憶體內執行且零網路上傳，`eligibleForGeometryChangeCount = 0`，本輪零航線幾何修改。
