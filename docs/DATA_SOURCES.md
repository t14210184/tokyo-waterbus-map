# Tokyo Waterbus Atlas - Data Sources & References

This document records the authoritative sources and reference URLs used to compile route geometries, pier locations, timetable frequencies, and operator information.

## Primary Operators

### 1. TOKYO CRUISE (東京都観光汽船株式会社)
- **Official Website**: [https://www.suijobus.co.jp/en/](https://www.suijobus.co.jp/en/)
- **Fares & Timetables**: [https://www.suijobus.co.jp/en/price/](https://www.suijobus.co.jp/en/price/)
- **Day-of Operations**: [https://www.suijobus.co.jp/en/today-operation/](https://www.suijobus.co.jp/en/today-operation/)
- **Piers Covered**: Asakusa, Hamarikyu, Hinode, Odaiba Seaside Park, Toyosu, Tokyo Big Sight, Palette Town (Historical/Seasonal verification required).

### 2. Tokyo Mizube Line (東京水辺ライン / 東京都公園協会)
- **Official Website**: [https://www.tokyo-park.or.jp/water/bus/](https://www.tokyo-park.or.jp/water/bus/)
- **Tourism & Spot Reference**: [https://chikatoku.enjoytokyo.jp/en/spot/mizube_ryogoku.html](https://chikatoku.enjoytokyo.jp/en/spot/mizube_ryogoku.html)
- **JNTO Spot Guide**: [https://www.japan.travel/tw/spot/1678/](https://www.japan.travel/tw/spot/1678/)
- **Piers Covered**: Ryogoku River Center, Sumida City Office, Asakusa Nitenmon, Etchujima, Saint Luke's Garden, WATERS Takeshiba, Odaiba Seaside Park, Kasai Rinkai Park.

### 3. Official Tourism Guides
- **Go Tokyo (Tokyo Convention & Visitors Bureau)**: [https://www.gotokyo.org/en/plan/getting-around/cruise-ships-waterbuses/index.html](https://www.gotokyo.org/en/plan/getting-around/cruise-ships-waterbuses/index.html)

---

## Data Confidence Matrix

| Route ID | Route Name | Operator | Geometry Source | Schedule Source |
| :--- | :--- | :--- | :--- | :--- |
| `sumida-river` | 隅田川線 | TOKYO CRUISE | Curated Geographic | Official Reference |
| `asakusa-odaiba-direct` | 淺草－台場直達線 | TOKYO CRUISE | Curated Geographic | Official Reference |
| `hinode-odaiba` | 日之出－台場線 | TOKYO CRUISE | Curated Geographic | Official Reference |
| `hamarikyu` | 濱離宮線 | TOKYO CRUISE | Curated Geographic | Official Reference |
| `hinode-toyosu` | 日之出－豐洲連絡 | TOKYO CRUISE | Curated Geographic | Operator Reference |
| `mizube-line` | 東京水辺ライン | 東京都公園協會 | Curated Geographic | Operator Reference |
