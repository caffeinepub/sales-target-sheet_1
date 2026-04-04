# Sales Target Sheet

## Current State
The app has these main tabs:
- **Monthly** (TargetsPage) — per-month entry/view for sales categories
- **Monthly Summary** (MonthlySummaryPage) — FY-aggregated monthly totals
- **Yearly Summary** (YearlySummaryPage) — aggregated by financial year
- **Plan** (PlanPage) — GH/RGA & VALUE targets, with its own Monthly/Monthly Summary/Yearly sub-tabs
- **PRATIK SONI** — settings/admin page

## Requested Changes (Diff)

### Add
- A new top-level tab called **"Target"** in the main tab bar
- This tab contains nested sub-tabs: **Monthly**, **Monthly Summary**, **Yearly Summary**
- The sub-tabs reuse the existing TargetsPage, MonthlySummaryPage, and YearlySummaryPage components respectively
- A new wrapper component `TargetPageWrapper` to host these 3 sub-tabs (pattern mirrors PlanPage)

### Modify
- `App.tsx`: Add a new `<TabsTrigger value="target">Target</TabsTrigger>` and a corresponding `<TabsContent value="target">` that renders `<TargetPageWrapper />`
- `TargetPageWrapper` must manage selectedMonth/selectedYear/selectedFYStart state internally (same as App currently does for those tabs)

### Remove
- The three separate top-level tabs **Monthly**, **Monthly Summary**, **Yearly Summary** should be removed from the top-level tab bar (they move inside the new Target tab)

## Implementation Plan
1. Create `src/frontend/src/components/TargetPageWrapper.tsx`:
   - Internal state: selectedMonth, selectedYear, selectedFYStart
   - Renders shadcn Tabs with 3 triggers: monthly, monthly-summary, yearly-summary
   - TabsContent: TargetsPage, MonthlySummaryPage, YearlySummaryPage
   - Passes down props and sync handlers correctly (same logic as App.tsx currently does)
2. Update `App.tsx`:
   - Remove imports and tab entries for Monthly, Monthly Summary, Yearly Summary
   - Add import for TargetPageWrapper
   - Remove selectedMonth, selectedYear, selectedFYStart state and handlers from AppInner (they move into TargetPageWrapper)
   - Add `<TabsTrigger value="target">Target</TabsTrigger>`
   - Add `<TabsContent value="target"><TargetPageWrapper /></TabsContent>`
   - Set `defaultValue="target"` on main Tabs (or keep as monthly if preferred)
