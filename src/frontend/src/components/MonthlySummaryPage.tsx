import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import type { SalesData } from "../backend.d";
import { useCategories } from "../hooks/useCategories";
import type { CustomCategoryValues } from "../hooks/useCustomData";
import { getCustomData } from "../hooks/useCustomData";
import {
  FY_MONTH_ORDER,
  MONTHS,
  currentFYStartYear,
  getFYLabel,
  useAllMonthsSorted,
} from "../hooks/useQueries";
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

interface Props {
  selectedFYStart: number;
  onFYStartChange: (fyStart: number) => void;
}

const curFY = currentFYStartYear();
const FY_OPTIONS = Array.from({ length: 5 }, (_, i) => curFY - 2 + i);

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

const SKELETON_ROWS = Array.from({ length: 12 }, (_, i) => i);

export default function MonthlySummaryPage({
  selectedFYStart,
  onFYStartChange,
}: Props) {
  const { mobile } = useUser();
  const userMobile = mobile ?? "";

  const { data: allData, isLoading } = useAllMonthsSorted();
  const { visibleCategories } = useCategories(userMobile);
  const { currencySymbol } = useSettings();

  const monthMap = new Map<string, { target: number; achieved: number }>();
  if (allData) {
    for (const [key, salesData] of allData) {
      const m = Number(key.month);
      const y = Number(key.year);
      const fyStart = m >= 4 ? y : y - 1;
      if (fyStart === selectedFYStart) {
        const customData = getCustomData(userMobile, m, y);
        monthMap.set(
          `${m}-${y}`,
          sumVisibleCategories(salesData, customData, visibleCategories),
        );
      }
    }
  }

  const rows = FY_MONTH_ORDER.map((month) => {
    const year = month >= 4 ? selectedFYStart : selectedFYStart + 1;
    const entry = monthMap.get(`${month}-${year}`);
    return {
      monthName: MONTHS[month - 1],
      month,
      year,
      target: entry?.target ?? null,
      achieved: entry?.achieved ?? null,
    };
  });

  let grandTarget = 0;
  let grandAchieved = 0;
  for (const [, v] of monthMap) {
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
      data-ocid="monthly_summary.section"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Monthly Summary
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {getFYLabel(selectedFYStart)} (Apr {selectedFYStart} – Mar{" "}
            {selectedFYStart + 1})
          </p>
        </div>

        <Select
          value={String(selectedFYStart)}
          onValueChange={(v) => onFYStartChange(Number(v))}
        >
          <SelectTrigger
            className="w-36 bg-card border border-border"
            data-ocid="monthly_summary.fy.select"
          >
            <SelectValue placeholder="FY" />
          </SelectTrigger>
          <SelectContent>
            {FY_OPTIONS.map((fy) => (
              <SelectItem key={fy} value={String(fy)}>
                {getFYLabel(fy)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border shadow-card overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[640px] text-sm"
            data-ocid="monthly_summary.table"
          >
            <thead>
              <tr style={{ background: "oklch(0.96 0.005 240)" }}>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 w-40">
                  Month
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
              {isLoading
                ? SKELETON_ROWS.map((i) => (
                    <tr key={i} className="border-t border-border">
                      <td colSpan={5} className="px-4 py-2">
                        <Skeleton className="h-8 w-full rounded" />
                      </td>
                    </tr>
                  ))
                : rows.map((row, idx) => {
                    const hasData = row.target !== null;
                    const target = row.target ?? 0;
                    const achieved = row.achieved ?? 0;
                    const remaining = target - achieved;
                    const pct =
                      target === 0 ? 0 : Math.round((achieved / target) * 100);

                    return (
                      <tr
                        key={`${row.month}-${row.year}`}
                        className="border-t border-border hover:bg-secondary/40 transition-colors"
                        data-ocid={`monthly_summary.item.${idx + 1}`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row.monthName}{" "}
                          <span className="text-xs text-muted-foreground">
                            {row.year}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground font-medium">
                          {hasData ? (
                            `${currencySymbol}${target.toFixed(2)}`
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground font-medium">
                          {hasData ? (
                            `${currencySymbol}${achieved.toFixed(2)}`
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {hasData ? (
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
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {hasData ? (
                            <ProgressBar percent={pct} />
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              No data
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

              {!isLoading && (
                <tr
                  className="border-t-2 border-border"
                  style={{ background: "oklch(0.94 0.008 240)" }}
                  data-ocid="monthly_summary.totals.row"
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
