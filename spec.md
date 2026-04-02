# Sales Target Sheet

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A sales target tracking sheet for a single user
- 5 categories: Overall Sale, W/O Coin, Studded, Plain, Plan
- Per category: Target (manual input), Achieved (manual input), Remaining (auto = Target - Achieved), % Achievement (auto = Achieved / Target * 100)
- Monthly view: user can select month/year to set targets and log achievements
- Edit mode: user can edit Target and Achieved values inline
- Summary row showing totals across all categories
- Data persisted per month in the backend

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: Store monthly target records per category. Support get and upsert operations for a given month/year.
2. Frontend: Month/year selector at top. Table with 5 category rows + summary. Editable Target and Achieved fields. Auto-calculated Remaining and % columns. Save button to persist changes.
