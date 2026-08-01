# Tokyo Waterbus Atlas (東京水上巴士 Atlas) - 資料與模擬聲明 (Data Disclosure Policy)

**生效日期**: 2026-07-30  
**適用版本**: v1.0.0

---

## 1. 資料來源與權責說明 (Data Sources)

1. **公開路線與碼頭參考資料**:
   - 本系統所使用之水上巴士路線（如隅田川線、淺草台場直航線、水邊線等）與 14 個碼頭位置、鄰近車站資訊，均彙整自東京都觀光汽船 (TOKYO CRUISE) 與東京水邊線 (東京都公園協會) 公開之宣傳圖資、官方網頁與觀光局導覽手冊。
2. **模擬船隊動態 (Simulated Vessel Movement)**:
   - 地圖與船隊儀表板所展示之船隻即時位置、航向與進港動態，**全數為前端客戶端模擬推算（Client-side Simulation）**。
   - 本系統**絕不使用、亦不提供** AIS (Automatic Identification System)、GPS 追蹤或官方即時船隻定位數據。

---

## 2. 旅程規劃器計算機制 (OD Trip Planner Methodology)

1. **區段航程時間 (Leg Duration)**:
   - 航程時間係依據公開路線全程時間，按碼頭間距比例分配之「規劃預估值 (Planning Estimate)」。
2. **轉乘時間緩衝 (Transfer Buffer)**:
   - 當行程涉及不同航線轉乘時，系統自動加入 **15 分鐘規劃轉乘緩衝時間 (DEFAULT_TRANSFER_BUFFER_MINUTES = 15)**。
   - 此緩衝時間為旅遊規劃參考用，**不代表官方保證銜接或保證登船**。
3. **多營運商提醒 (Cross-Operator Notice)**:
   - 若行程跨越 TOKYO CRUISE 與東京水邊線不同營運商，系統將顯著提示需分別購買船票與確認登船碼頭。

---

## 3. 誠實顯示策略 (Honest Representation Strategy)

- 任何未經官方獨立驗證之資料欄位，系統一律標示為「請向官方確認」或「資料待確認」，絕不冒充常態營運。
- 所有外連至官方營運商之連結均加上 `target="_blank"`、`rel="noopener noreferrer"` 與專屬外連圖示。
- 本系統不蒐集任何使用者個人隱私，亦不呼叫 `navigator.geolocation` 瀏覽器定位 API。
