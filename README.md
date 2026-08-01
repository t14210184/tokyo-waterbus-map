# Tokyo Waterbus Atlas (東京水上巴士 Atlas)

> **Navigate Tokyo by water — routes, piers, live-status gateway, and simulated vessel movement.**

東京水上巴士 Atlas 是一個專為東京水上交通（TOKYO CRUISE 及東京水辺ライン）設計的互動式探索與模擬營運平台。兼具水域航線地圖、碼頭周邊資訊、搭乘決策規劃器、官方動態入口與明確標示的模擬船隻航行。

## 🌟 Key Features

- 🗺️ **Interactive Water Route Map**: 6 major waterbus route groups across Tokyo Bay and Sumida River with Focus Mode.
- 🚢 **Simulated Vessel Movement Engine**: Smooth vessel motion, heading orientation, dwell counts, and time acceleration controls (1x to 120x).
- 📍 **Comprehensive Pier Database**: Pier coordinates, transit connections, landmarks, facilities, and operator status.
- 🧭 **O-D Trip Planner & Ride Scenarios**: Custom decision tool for finding optimal water routes with confidence ratings.
- ⚡ **Official Status Gateway**: Direct links and live status integration disclaimers for TOKYO CRUISE and Tokyo Mizube Line.

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Validate core data schemas
npm run validate:data

# Production build
npm run build
```

## 📜 Documentation

- [Data Sources & References](docs/DATA_SOURCES.md)
- [Simulation Disclaimer & Disclosures](docs/SIMULATION_DISCLOSURE.md)
- [QA & Verification Checklist](docs/QA_CHECKLIST.md)

## 📄 License

MIT License
