# Photo Provenance & Intake Policy: Phase 1A

> **Version**: `v1.1.0-RC.3.23`  
> **Status**: Photo Wayfinding Intake Specification

---

## 📷 Phase 1A Photo Guidance Readiness

In Phase 1A, all Pier Arrival Cards explicitly report the truthful photo readiness state:

- **zh-TW**: `現地辨識照片：建置中`
- **en**: `Photo wayfinding: planned`
- **ja**: `現地確認写真：準備中`
- **ko**: `현장 안내 사진: 준비 중`

No copied, scraped, or rehosted social media images (Instagram, Twitter/X, Google Maps, personal blogs) are bundled or rendered.

---

## 🛡 Mandatory Photo Metadata Intake Schema

Before any future wayfinding image is embedded, it must pass a strict provenance audit and include full metadata:

```json
{
  "photoId": "asakusa-exit-1-to-pier-01",
  "pierId": "asakusa",
  "sourceType": "official-link | wikimedia-commons | cc | public-domain",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:...",
  "creator": "Photographer Name / Entity",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "capturedDate": "2026-04-15",
  "locationCoordinates": [35.71195, 139.79825],
  "directionHeading": "East towards Azuma Bridge",
  "altText": {
    "zh-TW": "從淺草站 1 號出口望向淺草水上巴士碼頭與吾妻橋",
    "en": "View from Asakusa Station Exit 1 towards Asakusa Pier and Azuma Bridge",
    "ja": "浅草駅1番出口から浅草水上バス乗り場と吾妻橋を望む",
    "ko": "아사쿠사역 1번 출구에서 아사쿠사 선착장과 아즈마바시를 바라본 모습"
  }
}
```

---

## 🚫 Rejection Criteria

An image candidate MUST be rejected if:
1. It is copied from private social media without documented written permission.
2. The license is generic "fair use" or unspecified.
3. The photo merely decorates without aiding station-to-pier wayfinding.
4. EXIF location data contains unverified private personal identifiers.
