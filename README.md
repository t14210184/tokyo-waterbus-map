# Tokyo Waterbus Atlas (東京水上巴士 Atlas)

> **Current Release**: `v1.1.0-RC.3.23` (Phase 1A: Multilingual Pier Arrival Cards)  
> **Public Site**: [https://t14210184.github.io/tokyo-waterbus-map/](https://t14210184.github.io/tokyo-waterbus-map/)

Tokyo Waterbus Atlas is a multilingual, traveller-first reference tool for official service status, timetable links, pier arrival guidance, trip planning, and clearly labelled offline exploration across Tokyo's waterways (Sumida River and Tokyo Bay).

---

## 🎯 What the App Does Today (v1.1.0-RC.3.23)

- **Multilingual UI Support (`i18n`)**: Real-time language switching between Traditional Chinese (`zh-TW`), English (`en`), Japanese (`ja`), and Korean (`ko`) with `localStorage` persistence and URL parameter overrides (`?lang=en|ja|ko|zh-TW`).
- **Multilingual Pier Arrival Cards**: Four data-driven arrival cards for **Asakusa**, **Hinode**, **Hamarikyu**, and **Odaiba Seaside Park**, featuring localized names, official Japanese names, romanization, transit walking times, checklists, official links, Google Maps area handoffs, and honest photo-readiness badges (`Photo wayfinding: planned`).
- **Official Service Gateway (`今天狀態`)**: Direct verified links to official daily operation notices and timetables for TOKYO CRUISE and Tokyo Mizube Line.
- **User-Controlled Offline Demo (`離線示範`)**: Optional, user-initiated movement animation clearly disclaimed as a non-real-time concept demo.
- **Human Review Portal (RGR Secondary Entry)**: Browser-based local validation suite for 13 canonical RGR geographic segment decisions without auto-uploading.

---

## ❌ What the App Explicitly Does NOT Do

- **NOT a live GPS / AIS vessel tracker**: Does not promise or display real-time vessel positions.
- **NOT an official nautical chart or maritime safety navigation system**.
- **NOT an automated schedule auto-inference tool**.
- **NOT a repository for copied or unverified social media photos**.

---

## 🌐 Choosing Your Language

Select your preferred language via the top header language menu or append the URL parameter:
- **Traditional Chinese**: `https://t14210184.github.io/tokyo-waterbus-map/?lang=zh-TW`
- **English**: `https://t14210184.github.io/tokyo-waterbus-map/?lang=en`
- **Japanese**: `https://t14210184.github.io/tokyo-waterbus-map/?lang=ja`
- **Korean**: `https://t14210184.github.io/tokyo-waterbus-map/?lang=ko`

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

# Run Phase 1A local audit script
node -e "import('./scripts/audit-phase1a-i18n-pier-cards.js')"

# Run local Playwright E2E tests
npx playwright test tests/pages/phase1a-i18n-pier-cards.spec.js
```

---

## 📚 Project Documentation

- [Phase 1A Reconnaissance & Source Audit](docs/phase1a-reconnaissance.md)
- [Pier Content Sources & Provenance Registry](docs/PIER_CONTENT_SOURCES.md)
- [Translation Scope & i18n Strategy](docs/TRANSLATION_SCOPE.md)
- [Photo Provenance & Intake Policy](docs/PHOTO_PROVENANCE_INTAKE.md)
- [Product Vision](docs/PRODUCT_VISION.md)
- [Data Trust Model](docs/DATA_TRUST_MODEL.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Product Roadmap](docs/ROADMAP.md)
- [Accessibility & i18n Strategy](docs/ACCESSIBILITY_AND_I18N.md)
- [Image & Content Policy](docs/IMAGE_AND_CONTENT_POLICY.md)
- [Changelog](CHANGELOG.md)
