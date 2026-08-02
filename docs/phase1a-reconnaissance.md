# Phase 1A Reconnaissance & Source Audit Report

> **Version**: `v1.1.0-RC.3.23`  
> **Date**: `2026-08-02`

---

## 📌 Summary

Phase 1A reconnaissance audited primary official operator web portals and verified factual coverage for the four featured Pier Arrival Cards:
1. **Asakusa Pier** (`asakusa`)
2. **Hinode Pier** (`hinode`)
3. **Hamarikyu Pier** (`hamarikyu`)
4. **Odaiba Seaside Park Pier** (`odaiba-kaihinkouen`)

All unverified claims (such as exact turn-by-turn walking steps, real-time queue times, or unauthorized photo assets) have been intentionally excluded from Phase 1A.

---

## 📊 Fact & Source Coverage Summary

| Pier ID | Pier Name | Verified Transit & Address | Official Pier Page | Official Status Link | Photo Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `asakusa` | 淺草碼頭 (浅草 / Asakusa) | Tokyo Metro Ginza Line Asakusa Sta Exit 1 (1 min) | `suijobus.co.jp/en/cruise/asakusa/` | `suijobus.co.jp/guide/operation/` | Planned |
| `hinode` | 日之出碼頭 (日の出 / Hinode) | Yurikamome Hinode Sta (2 min), JR Hamamatsucho (8 min) | `suijobus.co.jp/en/cruise/hinode/` | `suijobus.co.jp/guide/operation/` | Planned |
| `hamarikyu` | 濱離宮碼頭 (浜離宮 / Hamarikyu) | Toei Oedo Line Shiodome Sta (7 min) + Garden Ticket required | `suijobus.co.jp/en/cruise/hamarikyu/` | `suijobus.co.jp/guide/operation/` | Planned |
| `odaiba-kaihinkouen` | 台場海濱公園碼頭 (お台場海浜公園 / Odaiba) | Yurikamome Odaiba-kaihinkouen Sta (5 min), Rinkai Line (10 min) | `suijobus.co.jp/en/cruise/odaiba/` | `suijobus.co.jp/guide/operation/` | Planned |

---

## 📸 Image Candidate Inventory

- **Downloaded/Rehosted Social Images**: 0 (STRICTLY PROHIBITED)
- **External Official Page Links**: 4 (Rendered as non-deceptive external link actions)
- **Photo Wayfinding UI Status**: Rendered as `Photo wayfinding: planned` across all 4 locales.

---

## 🛠 Proposed Code & Architecture Modifications

- `src/i18n/index.js` (Core i18n engine with URL param override & localStorage persistence)
- `src/i18n/locales/{zh-TW,en,ja,ko}.js` (4 locale dictionaries)
- `src/data/pier-arrival-cards.js` (Verified Pier Arrival Cards dataset)
- `src/ui/language-picker.js` (Keyboard-operable language menu)
- `src/ui/shell.js`, `today-status-panel.js`, `pier-panel.js`, `pier-detail-drawer.js`, `main.js` (UI integration)
- `scripts/build-static.js` (Module bundle update)
- `tests/pages/phase1a-i18n-pier-cards.spec.js` & `scripts/audit-phase1a-i18n-pier-cards.js`
