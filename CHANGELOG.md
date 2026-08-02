# Changelog: Tokyo Waterbus Atlas

All notable changes to this project will be documented in this file.

---

## [v1.1.0-RC.3.22] - 2026-08-02

### Added
- **Phase 0 Truthful Tourist Foundation**: Established traveller-first navigation tab order (`今天狀態` / `航線` / `碼頭` / `行程規劃` / `攻略` / `探索`).
- **Release Identity Integrity**: Shared `src/data/version.js` registry dynamically injecting version string `v1.1.0-RC.3.22`, short Git commit SHA, build UTC ISO timestamp, and asset hash into header, footer disclosures, manifest, and production JS.
- **`今天狀態` Primary Status Gateway**: Direct links to official daily operation notices and timetables for TOKYO CRUISE (`suijobus.co.jp`) and Tokyo Mizube Line (`tokyo-park.or.jp`).
- **Secondary Review Entry**: Moved "地理審核" to secondary footer/About button ("資料品質與審核") while preserving all 13 canonical RGR IDs, 4 download links, file input, and zero-upload local CSV validation.
- **Data Trust Levels Drawer**: Expandable modal detailing Levels A, B, C, and D.
- **Mobile-First Responsive Baseline**: Enforced 24x24 px min (44x44 px preferred) touch targets and prevented horizontal overflow across 360x800 and 390x844 viewports.
- **Comprehensive Project Documentation**: Created `PRODUCT_VISION.md`, `DATA_TRUST_MODEL.md`, `ROADMAP.md`, `ACCESSIBILITY_AND_I18N.md`, `IMAGE_AND_CONTENT_POLICY.md`, and `ARCHITECTURE.md`.

---

## [v1.1.0-RC.3.21] - 2026-08-02

### Added
- **User-Controlled Offline Demo Mode**: Added `#btn-offline-demo` toggle button, concise disclaimer banner, `demo-vessel-01` .. `demo-vessel-04` markers, and strict Tokyo Mizube Line demo exclusion.

---

## [v1.1.0-RC.3.20] - 2026-08-02

### Fixed
- **Public Runtime Interaction Defect Repairs**: Resolved Leaflet base layer closure `ReferenceError`, header status chip initial rendering, stale vessel marker cleanup, and static bundle `import.meta.env` undefined errors.
