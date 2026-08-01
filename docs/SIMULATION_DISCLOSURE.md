# Tokyo Waterbus Atlas - Simulation Disclosure & Principles

## Public Disclosure Statement

> **NOTICE**: All vessel locations, headings, arrival ETAs, and dock statuses displayed on Tokyo Waterbus Atlas are generated via browser-based mathematical simulation models calibrated against official reference timetables. They **DO NOT** represent live AIS (Automatic Identification System) tracking or real-time GPS feeds.

## Strict Operational Principles

1. **Explicit Tagging**: Every vessel marker, card, and ETA readout is tagged with `SIMULATED POSITION` / `模擬動態` to prevent misleading passenger decision-making.
2. **Official Portal Gateway**: Tokyo Waterbus Atlas provides direct CTA buttons pointing users to official operator portals ([TOKYO CRUISE Today's Operation](https://www.suijobus.co.jp/en/today-operation/)) for actual departure confirmation.
3. **No Phantom Operators**: Routes and piers strictly belong to their authentic operators (TOKYO CRUISE vs. Tokyo Mizube Line).
4. **Transparent Calculation**: Simulation math uses standard Tokyo Local Time (JST / UTC+9), service windows (`serviceStart` / `serviceEnd`), departure offsets, segment travel scales, and fixed pier dwell times.
