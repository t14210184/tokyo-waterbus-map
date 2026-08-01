# Human Review Intake Instructions (v1.1.0-RC.3.11)

## Purpose
This document provides guidelines for human GIS reviewers evaluating the 13 needs-review route segments in Tokyo Waterbus Atlas.

## Intake Rules
1. Fill out `human-review-intake-template.csv`.
2. Do NOT alter the 13 canonical `reviewId` values.
3. Complete all mandatory sign-off fields:
   - `reviewer`: Full name / institutional role of human reviewer.
   - `reviewedAt`: Valid ISO-8601 timestamp.
   - `decision`: Must be one of `TRUE_LAND_INTERSECTION`, `BOUNDARY_ALIGNMENT_AMBIGUITY`, `TERMINAL_SNAP_ONLY`, `VALIDATOR_DATA_INSUFFICIENT`, `REQUIRES_OFFICIAL_SOURCE`, `NOT_REVIEWED`.
   - `evidenceSourceName`: Name of external authoritative source (e.g., GSI Japan / Official Operator Navigation Charts).
   - `evidenceSourceUrl`: Must be a valid `https://` URL.
   - `evidenceLicense`: Open data terms / license.
   - `evidenceRetrievedAt`: ISO-8601 timestamp.
   - `evidenceNotes`: Detailed description (at least 30 characters).
   - `proposedAction`: Must be one of `NO_CHANGE_REQUIRED`, `SEEK_OFFICIAL_SOURCE`, `PROPOSE_MINIMAL_WAYPOINT_EDIT`, `REQUEST_SECOND_REVIEW`.

## Two-Person Approval Process
- A proposal for minimal waypoint edit requires two independent human reviewers and two separate valid sign-off files before any geometry edit proposal is unlocked.
- Product route geometries remain strictly `approximate-reference`.
