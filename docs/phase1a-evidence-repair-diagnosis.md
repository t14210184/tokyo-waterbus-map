# Phase 1A Evidence Repair Diagnosis Report

> **Reproduction Timestamp**: `2026-08-02T12:35:00Z`  
> **Public Site**: `https://t14210184.github.io/tokyo-waterbus-map/`  
> **Target Version**: `v1.1.0-RC.3.23`

---

## 🔍 Defect 1: Blank / Dark Screenshot Artifacts

### Original Failure
All 6 screenshot artifacts generated in Phase 1A appeared as uniform `#0a1622` dark canvas images.

### Root Cause
`scripts/generate-phase1a-artifacts.js` executed `execSync('msedge.exe --headless --screenshot=...')` directly against the live URL. Headless Edge took a viewport capture immediately upon network connection before:
1. DOM scripts finished parsing and mounting `createUIShell`;
2. Leaflet CSS and vector map tiles finished loading;
3. Web fonts finished rendering (`document.fonts.ready`);
4. Interactive tabs (e.g. Asakusa Pier Arrival Card, language picker menu) were clicked.

### Repair Strategy
Replace raw CLI `--screenshot` invocation with Playwright browser session that:
1. Navigates to the live page URL;
2. Waits for `domcontentloaded` and `networkidle`;
3. Waits for font readiness: `await page.evaluate(() => document.fonts?.ready)`;
4. Executes explicit tab and card click sequences;
5. Asserts target element visibility (`await expect(locator).toBeVisible()`) and positive bounding box dimensions;
6. Waits 2 animation frames (`requestAnimationFrame`);
7. Captures viewport/element PNGs;
8. Decodes PNGs programmatically to measure unique color count and non-background pixel ratio, rejecting uniform `#0a1622` dark images.

---

## 🔍 Defect 2: Asset Hash Mismatch & False Verified Gate

### Original Failure
`public-test-results.json` recorded `assetHashMatch: false`, yet the report declared `PHASE1A_MULTILINGUAL_PIER_CARDS_VERIFIED`.

### Root Cause
1. `assetHashMatch` compared a newly compiled local build SHA-256 against the remote public bundle SHA-256. Because `build-static.js` embeds a dynamic build ISO timestamp (`buildTimestamp`), local and remote builds produce different SHA-256 hashes even for identical source code.
2. The audit script did not enforce `assetHashMatch === true` as a hard prerequisite for `PHASE1A_MULTILINGUAL_PIER_CARDS_VERIFIED`.

### Repair Strategy
1. Replace semantically ambiguous `assetHashMatch` with `publicAssetIdentityVerified` based on remote public consistency chain:
   - `index.html` returns HTTP 200;
   - `index.html` references script asset `assets/index-atlas.<hash>.js`;
   - `assets/manifest.json` returns HTTP 200 and matches script tag asset name;
   - `assets/index-atlas.<hash>.js` returns HTTP 200 and yields valid non-empty content SHA-256 (`publicJsSha256`);
   - Embedded build metadata matches release version `v1.1.0-RC.3.23` AND feature commit SHA matching expected HEAD commit.
2. Enforce strict gate logic in `artifacts/phase1a-i18n-pier-cards/phase-gate.json`: the final gate `PHASE1A_MULTILINGUAL_PIER_CARDS_VERIFIED` will fail automatically if `publicAssetIdentityVerified` is false.
