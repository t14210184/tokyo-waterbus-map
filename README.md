# Tokyo Waterbus Atlas (東京水上巴士 Atlas)

> **Current Release**: `v1.1.0-RC.3.22`  
> **Public Site**: [https://t14210184.github.io/tokyo-waterbus-map/](https://t14210184.github.io/tokyo-waterbus-map/)

Tokyo Waterbus Atlas is a multilingual, traveller-first reference tool for official service status, timetable links, pier-finding guidance, trip planning, and clearly labelled offline exploration across Tokyo's waterways (Sumida River and Tokyo Bay).

---

## 🎯 What the App Does Today (v1.1.0-RC.3.22)

- **Official Service Gateway (`今天狀態`)**: Direct verified links to official daily operation notices and timetables for TOKYO CRUISE and Tokyo Mizube Line.
- **Route & Pier Guidance (`航線` / `碼頭`)**: Interactive reference map for Tokyo waterbus routes, terminal piers, transit connections, and landmarks.
- **Trip Planner (`行程規劃`)**: Pure graph-based waterbus route planning between verified piers.
- **User-Controlled Offline Demo (`離線示範`)**: Optional, user-initiated movement animation clearly disclaimed as a non-real-time concept demo.
- **Human Review Portal (RGR Secondary Entry)**: Full browser-based local validation suite for 13 canonical RGR geographic segment decisions without auto-uploading.

---

## ❌ What the App Explicitly Does NOT Do

- **NOT a live GPS / AIS vessel tracker**: Does not promise or display real-time vessel positions.
- **NOT an official nautical chart or maritime safety navigation system**.
- **NOT an automated schedule auto-inference tool**: Does not pretend unverified estimates are real-time status.
- **NOT an official ticketing or reservation system**.

---

## 🔗 Official Operator Sources

- **TOKYO CRUISE (東京都觀光汽船)**:
  - Today's Operating Status: [https://www.suijobus.co.jp/guide/operation/](https://www.suijobus.co.jp/guide/operation/)
  - Official Timetables & Fares: [https://www.suijobus.co.jp/guide/timetable/](https://www.suijobus.co.jp/guide/timetable/)
- **Tokyo Mizube Line (東京水辺ライン - 東京都公園協會)**:
  - Service Page & Suspension Notice: [https://www.tokyo-park.or.jp/water/waterbus/](https://www.tokyo-park.or.jp/water/waterbus/)  
    *(Status: SUSPENDED since 2026-01-19, reopening pending official notice)*

---

## 🛠 Local Build & Verification

```bash
# Install dependencies
npm ci

# Production build
npm run build

# Run local Playwright tests
npx playwright test tests/pages/phase0-traveler-foundation.spec.js

# Run Phase 0 audit script
node -e "import('./scripts/audit-phase0-traveler-foundation.js')"
```

---

## 📚 Project Documentation

- [Product Vision](docs/PRODUCT_VISION.md)
- [Data Trust Model](docs/DATA_TRUST_MODEL.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Product Roadmap](docs/ROADMAP.md)
- [Accessibility & i18n Strategy](docs/ACCESSIBILITY_AND_I18N.md)
- [Image & Content Policy](docs/IMAGE_AND_CONTENT_POLICY.md)
- [Changelog](CHANGELOG.md)

---

## 🛡 License & Data Disclaimers

The map layout and geometries are provided for approximate reference (`geometryClassification = approximate-reference`). All operational decisions must be cross-checked against official operator channels.
