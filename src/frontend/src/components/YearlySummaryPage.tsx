import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import type { SalesData } from "../backend.d";
import { useCategories } from "../hooks/useCategories";
import type { CustomCategoryValues } from "../hooks/useCustomData";
import { getCustomData } from "../hooks/useCustomData";
import { getFYLabel, useAllMonthsSorted } from "../hooks/useQueries";
import { useSettings } from "../hooks/useSettings";
import { useUser } from "../hooks/useUser";
import { ProgressBar } from "./TargetsTable";

const BACKEND_KEYS = new Set([
  "overallSale",
  "withoutCoin",
  "studded",
  "plain",
  "plan",
]);

function sumVisibleCategories(
  data: SalesData,
  customData: CustomCategoryValues,
  visibleCategories: Array<{ key: string }>,
) {
  let target = 0;
  let achieved = 0;
  for (const cat of visibleCategories) {
    if (BACKEND_KEYS.has(cat.key)) {
      const row = (
        data as unknown as Record<string, { target: number; achieved: number }>
      )[cat.key];
      target += row?.target ?? 0;
      achieved += row?.achieved ?? 0;
    } else {
      const row = customData[cat.key];
      target += row?.target ?? 0;
      achieved += row?.achieved ?? 0;
    }
  }
  return { target, achieved };
}

export default function YearlySummaryPage() {
  const { mobile } = useUser();
  const userMobile = mobile ?? "";

  const { data: allData, isLoading } = useAllMonthsSorted();
  const { visibleCategories } = useCategories(userMobile);
  const { currencySymbol } = useSettings();

  const fyMap = new Map<number, { target: number; achieved: number }>();
  if (allData) {
    for (const [key, salesData] of allData) {
      const m = Number(key.month);
      const y = Number(key.year);
      const fyStart = m >= 4 ? y : y - 1;
      const customData = getCustomData(userMobile, m, y);
      const sums = sumVisibleCategories(
        salesData,
        customData,
        visibleCategories,
      );
      const existing = fyMap.get(fyStart) ?? { target: 0, achieved: 0 };
      fyMap.set(fyStart, {
        target: existing.target + sums.target,
        achieved: existing.achieved + sums.achieved,
      });
    }
  }

  const fyStartYears = Array.from(fyMap.keys()).sort((a, b) => a - b);

  let grandTarget = 0;
  let grandAchieved = 0;
  for (const [, v] of fyMap) {
    grandTarget += v.target;
    grandAchieved += v.achieved;
  }
  const grandRemaining = grandTarget - grandAchieved;
  const grandPct =
    grandTarget === 0 ? 0 : Math.round((grandAchieved / grandTarget) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-5xl mx-auto"
      data-ocid="yearly_summary.section"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Yearly Summary
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregated performance by financial year (Apr – Mar)
        </p>
      </div>

      <div className="rounded-lg border border-border shadow-card overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[600px] text-sm"
            data-ocid="yearly_summary.table"
          >
            <thead>
              <tr style={{ background: "oklch(0.96 0.005 240)" }}>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 w-36">
                  Financial Year
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                  Total Target
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                  Total Achieved
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                  Remaining
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70">
                  % Achievement
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-t border-border">
                    <td colSpan={5} className="px-4 py-2">
                      <Skeleton className="h-8 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : fyStartYears.length === 0 ? (
                <tr className="border-t border-border">
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                    data-ocid="yearly_summary.empty_state"
                  >
                    No data available yet. Start by entering targets in the
                    Monthly tab.
                  </td>
                </tr>
              ) : (
                fyStartYears.map((fyStart, idx) => {
                  const entry = fyMap.get(fyStart)!;
                  const remaining = entry.target - entry.achieved;
                  const pct =
                    entry.target === 0
                      ? 0
                      : Math.round((entry.achieved / entry.target) * 100);

                  return (
                    <tr
                      key={fyStart}
                      className="border-t border-border hover:bg-secondary/40 transition-colors"
                      data-ocid={`yearly_summary.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {getFYLabel(fyStart)}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground font-medium">
                        {currencySymbol}
                        {entry.target.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground font-medium">
                        {currencySymbol}
                        {entry.achieved.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <span
                          className={
                            remaining < 0
                              ? "text-destructive"
                              : remaining === 0
                                ? "text-teal"
                                : "text-foreground/70"
                          }
                        >
                          {remaining < 0 ? "+" : ""}
                          {currencySymbol}
                          {Math.abs(remaining).toFixed(2)}
                          {remaining < 0 ? " over" : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ProgressBar percent={pct} />
                      </td>
                    </tr>
                  );
                })
              )}

              {!isLoading && fyStartYears.length > 0 && (
                <tr
                  className="border-t-2 border-border"
                  style={{ background: "oklch(0.94 0.008 240)" }}
                  data-ocid="yearly_summary.totals.row"
                >
                  <td className="px-4 py-3 font-bold text-foreground">
                    TOTALS
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {currencySymbol}
                    {grandTarget.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {currencySymbol}
                    {grandAchieved.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span
                      className={
                        grandRemaining < 0
                          ? "text-destructive"
                          : grandRemaining === 0
                            ? "text-teal"
                            : "text-foreground/70"
                      }
                    >
                      {grandRemaining < 0 ? "+" : ""}
                      {currencySymbol}
                      {Math.abs(grandRemaining).toFixed(2)}
                      {grandRemaining < 0 ? " over" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProgressBar percent={grandPct} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
