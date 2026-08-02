# Changelog: Tokyo Waterbus Atlas

All notable changes to this project will be documented in this file.

---

## [v1.1.0-RC.3.23] - 2026-08-02

### Added
- **Phase 1A Multilingual Pier Arrival Cards**:
  - **Framework-free i18n Engine**: 4 supported locales (`zh-TW`, `en`, `ja`, `ko`) with URL parameter override (`?lang=en|ja|ko|zh-TW`), `localStorage` persistence, fallback to `zh-TW`, and dynamic `<html lang="...">` updating.
  - **Keyboard-Operable Language Picker**: Accessible menu component with `aria-expanded`, Escape key handling, and focus restoration.
  - **Four Multilingual Pier Arrival Cards**: Data-driven cards for Asakusa (`asakusa`), Hinode (`hinode`), Hamarikyu (`hamarikyu`), and Odaiba Seaside Park (`odaiba-kaihinkouen`) featuring localized names, Japanese official names, romanization, transit access, checklists, official URLs, Google Maps area handoffs, and honest photo-readiness indicators (`Photo wayfinding: planned`).
  - **Documentation & Provenance Suite**: Created `PIER_CONTENT_SOURCES.md`, `TRANSLATION_SCOPE.md`, `PHOTO_PROVENANCE_INTAKE.md`, `phase1a-reconnaissance.md`, and updated all project documentation.

---

## [v1.1.0-RC.3.22] - 2026-08-02

### Added
- **Phase 0 Truthful Tourist Foundation**: Established traveller-first navigation tab order (`今天狀態` / `航線` / `碼頭` / `行程規劃` / `攻略` / `探索`).
- **Release Identity Integrity**: Shared `src/data/version.js` registry dynamically injecting version string `v1.1.0-RC.3.22`, short Git commit SHA, build UTC ISO timestamp, and asset hash into header, footer disclosures, manifest, and production JS.
