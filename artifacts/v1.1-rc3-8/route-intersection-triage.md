# Evidence-First Route Intersection Triage Report (v1.1.0-RC.3.8)

- **Triage Timestamp**: 2026-08-01T08:11:16.429Z
- **Validator Scope**: `coastal-and-bay-waterways`
- **Total Routes Audited**: 6
- **Total Segments Audited**: 64
- **Phase Gate**: **`TRIAGE_COMPLETE_NO_AUTOMATIC_REPAIR`**
- **Route Geometry Changes**: `0` (No automatic geometry edits made)

## Scope Classification Breakdown

| Scope Classification | Segment Count |
| :--- | :---: |
| `coastal-bay-supported` | 24 |
| `riverbank-limited` | 15 |
| `canal-limited` | 11 |
| `inner-harbor-limited` | 2 |
| `terminal-exemption-zone` | 12 |
| `coverage-gap` | 0 |

## Validator Decision Summary

| Decision | Count | Description |
| :--- | :---: | :--- |
| `pass` | 51 | Segment lies safely in water or is terminal-exempt |
| `needs-review` | 13 | Segment requires human geographic review |
| `out-of-scope` | 0 | Segment outside dataset bounding box |

## Repair Eligibility Summary

| Repair Eligibility | Count | Action Taken |
| :--- | :---: | :--- |
| `not-needed` | 51 | No repair needed |
| `candidate` | 0 | Supported by second source for minimal fix |
| `human-review-only` | 13 | Marked for human geographic review |
| `blocked` | 0 | Blocked by coverage gap |
