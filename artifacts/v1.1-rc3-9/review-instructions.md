# Human Geographic Review Package Instructions (v1.1.0-RC.3.9)

## Overview
This review package contains **13 needs-review route segments** flagged during the Phase RC.3.8 evidence-first intersection triage.

## Guidelines for Reviewers
1. Open `review-decision-template.csv`.
2. For each `reviewId` (e.g. `RGR-sumida-river-3`), evaluate against authoritative second sources (Official Operator Timetables, GSI Japan Maps, Maritime Safety Announcements).
3. Select an allowed decision:
   - `TRUE_LAND_INTERSECTION`
   - `BOUNDARY_ALIGNMENT_AMBIGUITY`
   - `TERMINAL_SNAP_ONLY`
   - `VALIDATOR_DATA_INSUFFICIENT`
   - `REQUIRES_OFFICIAL_SOURCE`
   - `NOT_REVIEWED`
4. Provide mandatory evidence metadata (Source Name, URL, License, Date, Notes).
5. Any decision without verifiable second-source evidence MUST remain `NOT_REVIEWED`.
6. Product route geometries remain strictly `approximate-reference` until formal human review sign-off.
