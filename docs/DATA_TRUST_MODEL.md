# Data Trust Model: Tokyo Waterbus Atlas

> **Version**: `v1.1.0-RC.3.22`  
> **Status**: Production Data Quality Framework

---

## 🛡 Four-Level Data Trust Hierarchy

To protect travellers from misleading claims and phantom vessel movements, Tokyo Waterbus Atlas enforces a strict four-level data trust model:

| Level | Name | Color Indicator | Definition & User Commitment |
| :--- | :--- | :--- | :--- |
| **Level A** | **官方狀態 (Official Status)** | Emerald (`#10b981`) | Verified same-day operating announcement directly linked to official operator web portals. |
| **Level B** | **時刻表參考 (Schedule Reference)** | Sky Blue (`#38bdf8`) | Scheduled operating window derived from published timetables *(Planned for future automated ingestion gates)*. |
| **Level C** | **離線示範 (Offline Demo)** | Amber (`#f59e0b`) | User-initiated, offline concept animation strictly disclaimed as non-real-time. |
| **Level D** | **停航或未知 (Suspended / Unknown)** | Coral Red (`#ef4444`) | Official suspension notice active (e.g. Tokyo Mizube Line) or missing same-day verification data. |

---

## 🚫 Non-Negotiable Operational Safety Rules

1. **No Unverified Real-Time Claims**: The application will NEVER claim live GPS/AIS tracking or guaranteed current vessel positions without a verifiable, cryptographically provable API source.
2. **Tokyo Mizube Line Suspension Lock**: Tokyo Mizube Line is strictly marked **SUSPENDED** (effective `2026-01-19`), excluded from demo vessel fleets, and locked out of trip planner results until a concrete official reopening announcement is published on `tokyo-park.or.jp`.
3. **Downgrade Behavior**: If same-day official status cannot be verified, the UI automatically downgrades display status to Level D (`未知或資料過期` / `暫停營運`) rather than inventing "normal operation".
