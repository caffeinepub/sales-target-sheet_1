import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SalesData } from "../backend.d";
import {
  FY_MONTH_ORDER,
  MONTHS,
  currentFYStartYear,
  emptySalesData,
  getFYLabel,
  getFYStartYear,
  useAllMonthsSorted,
  useSalesMonth,
  useSaveMonth,
} from "../hooks/useQueries";
import { useSettings } from "../hooks/useSettings";
import { ProgressBar } from "./TargetsTable";

const curFY = currentFYStartYear();
const FY_OPTIONS = Array.from({ length: 5 }, (_, i) => curFY - 2 + i);

function getFYMonthOptions(fyStart: number) {
  return FY_MONTH_ORDER.map((month) => {
    const year = month >= 4 ? fyStart : fyStart + 1;
    return { month, year, label: `${MONTHS[month - 1]} ${year}` };
  });
}

// ─── Plan Monthly (edit/view) ──────────────────────────────────────────────────

function PlanMonthly() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [displayFYStart, setDisplayFYStart] = useState(
    getFYStartYear(now.getMonth() + 1, now.getFullYear()),
  );

  const { data, isLoading } = useSalesMonth(selectedMonth, selectedYear);
  const saveMonth = useSaveMonth();
  const { currencySymbol } = useSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SalesData | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);

  const currentKey = `${selectedMonth}-${selectedYear}`;
  const inEdit = isEditing && editKey === currentKey;

  const handleFYChange = (fyStart: number) => {
    setDisplayFYStart(fyStart);
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
    setSelectedMonth(4);
    setSelectedYear(fyStart);
  };

  const handleMonthYearSelect = (month: number, year: number) => {
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleEditStart = () => {
    setEditData(structuredClone(data ?? emptySalesData()));
    setIsEditing(true);
    setEditKey(currentKey);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
  };

  const handleSave = async () => {
    if (!editData) return;
    try {
      await saveMonth.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
        data: editData,
      });
      toast.success("GH/RGA & VALUE targets saved successfully");
      setIsEditing(false);
      setEditData(null);
      setEditKey(null);
    } catch (err) {
      toast.error("Failed to save. Please try again.");
      console.error(err);
    }
  };

  const displayData =
    inEdit && editData ? editData : (data ?? emptySalesData());
  const monthOptions = getFYMonthOptions(displayFYStart);
  const selectedOptionKey = `${selectedMonth}-${selectedYear}`;

  const planRow = displayData.plan;
  const valueRow = displayData.value;

  const planRemaining = planRow.target - planRow.achieved;
  const planPct =
    planRow.target === 0
      ? 0
      : Math.round((planRow.achieved / planRow.target) * 100);

  const valueRemaining = valueRow.target - valueRow.achieved;
  const valuePct =
    valueRow.target === 0
      ? 0
      : Math.round((valueRow.achieved / valueRow.target) * 100);

  const totalTarget = planRow.target + valueRow.target;
  const totalAchieved = planRow.achieved + valueRow.achieved;
  const totalRemaining = totalTarget - totalAchieved;
  const totalPct =
    totalTarget === 0 ? 0 : Math.round((totalAchieved / totalTarget) * 100);

  const handlePlanChange = (field: "target" | "achieved", rawValue: string) => {
    if (!editData) return;
    const parsed = Number.parseFloat(rawValue);
    const numVal =
      Number.isNaN(parsed) || rawValue === ""
        ? 0
        : Math.max(0, Math.round(parsed * 100) / 100);
    setEditData({
      ...editData,
      plan: {
        ...editData.plan,
        [field]: numVal,
      },
    });
  };

  const handleValueChange = (
    field: "target" | "achieved",
    rawValue: string,
  ) => {
    if (!editData) return;
    const parsed = Number.parseFloat(rawValue);
    const numVal =
      Number.isNaN(parsed) || rawValue === ""
        ? 0
        : Math.max(0, Math.round(parsed * 100) / 100);
    setEditData({
      ...editData,
      value: {
        ...editData.value,
        [field]: numVal,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            GH/RGA & VALUE — Monthly
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(displayFYStart)}
            onValueChange={(v) => handleFYChange(Number(v))}
          >
            <SelectTrigger className="w-36 bg-card border border-border">
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

          <Select
            value={selectedOptionKey}
            onValueChange={(v) => {
              const [m, y] = v.split("-").map(Number);
              handleMonthYearSelect(m, y);
            }}
          >
            <SelectTrigger className="w-44 bg-card border border-border">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem
                  key={`${opt.month}-${opt.year}`}
                  value={`${opt.month}-${opt.year}`}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!inEdit ? (
            <Button
              onClick={handleEditStart}
              className="text-white"
              style={{ background: "oklch(var(--teal))" }}
              data-ocid="plan.edit_button"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit GH/RGA & VALUE
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={saveMonth.isPending}
                className="text-white"
                style={{ background: "oklch(var(--teal))" }}
                data-ocid="plan.save_button"
              >
                {saveMonth.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saveMonth.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saveMonth.isPending}
                data-ocid="plan.cancel_button"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="shadow-card border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {MONTHS[selectedMonth - 1]} {selectedYear} — GH/RGA & VALUE Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr style={{ background: "oklch(0.96 0.005 240)" }}>
                    <th className="text-left px-4 py-3 font-semibold text-foreground/70 w-36">
                      Category
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                      Target
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                      Achieved
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
                  {/* GH/RGA row */}
                  <tr className="border-t border-border hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      GH/RGA
                    </td>
                    <td className="px-4 py-2 text-right">
                      {inEdit ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          defaultValue={planRow.target.toFixed(2)}
                          onChange={(e) =>
                            handlePlanChange("target", e.target.value)
                          }
                          className="text-right h-8 w-full max-w-[110px] ml-auto"
                          data-ocid="plan.input"
                        />
                      ) : (
                        <span className="text-foreground font-medium">
                          {currencySymbol}
                          {planRow.target.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {inEdit ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          defaultValue={planRow.achieved.toFixed(2)}
                          onChange={(e) =>
                            handlePlanChange("achieved", e.target.value)
                          }
                          className="text-right h-8 w-full max-w-[110px] ml-auto"
                          data-ocid="plan.input"
                        />
                      ) : (
                        <span className="text-foreground font-medium">
                          {currencySymbol}
                          {planRow.achieved.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          planRemaining < 0
                            ? "text-destructive"
                            : planRemaining === 0
                              ? "text-teal"
                              : "text-foreground/70"
                        }`}
                      >
                        {planRemaining < 0 ? "+" : ""}
                        {currencySymbol}
                        {Math.abs(planRemaining).toFixed(2)}
                        {planRemaining < 0 ? " over" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar percent={planPct} />
                    </td>
                  </tr>

                  {/* VALUE row */}
                  <tr className="border-t border-border hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      VALUE
                    </td>
                    <td className="px-4 py-2 text-right">
                      {inEdit ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          defaultValue={valueRow.target.toFixed(2)}
                          onChange={(e) =>
                            handleValueChange("target", e.target.value)
                          }
                          className="text-right h-8 w-full max-w-[110px] ml-auto"
                          data-ocid="plan.input"
                        />
                      ) : (
                        <span className="text-foreground font-medium">
                          {currencySymbol}
                          {valueRow.target.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {inEdit ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          defaultValue={valueRow.achieved.toFixed(2)}
                          onChange={(e) =>
                            handleValueChange("achieved", e.target.value)
                          }
                          className="text-right h-8 w-full max-w-[110px] ml-auto"
                          data-ocid="plan.input"
                        />
                      ) : (
                        <span className="text-foreground font-medium">
                          {currencySymbol}
                          {valueRow.achieved.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          valueRemaining < 0
                            ? "text-destructive"
                            : valueRemaining === 0
                              ? "text-teal"
                              : "text-foreground/70"
                        }`}
                      >
                        {valueRemaining < 0 ? "+" : ""}
                        {currencySymbol}
                        {Math.abs(valueRemaining).toFixed(2)}
                        {valueRemaining < 0 ? " over" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar percent={valuePct} />
                    </td>
                  </tr>

                  {/* TOTALS row */}
                  <tr
                    className="border-t-2 border-border"
                    style={{ background: "oklch(0.94 0.008 240)" }}
                  >
                    <td className="px-4 py-3 font-bold text-foreground">
                      TOTALS
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {currencySymbol}
                      {totalTarget.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {currencySymbol}
                      {totalAchieved.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span
                        className={
                          totalRemaining < 0
                            ? "text-destructive"
                            : totalRemaining === 0
                              ? "text-teal"
                              : "text-foreground/70"
                        }
                      >
                        {totalRemaining < 0 ? "+" : ""}
                        {currencySymbol}
                        {Math.abs(totalRemaining).toFixed(2)}
                        {totalRemaining < 0 ? " over" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar percent={totalPct} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Shared summary table renderer ──────────────────────────────────────────

interface SummaryTableProps {
  title: string;
  rows: Array<{
    monthName: string;
    month: number;
    year: number;
    target: number | null;
    achieved: number | null;
  }>;
  grandTarget: number;
  grandAchieved: number;
  isLoading: boolean;
  currencySymbol: string;
  ocidPrefix: string;
}

function MonthlySummaryTable({
  title,
  rows,
  grandTarget,
  grandAchieved,
  isLoading,
  currencySymbol,
  ocidPrefix,
}: SummaryTableProps) {
  const grandRemaining = grandTarget - grandAchieved;
  const grandPct =
    grandTarget === 0 ? 0 : Math.round((grandAchieved / grandTarget) * 100);
  const SKELETON_ROWS = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <div className="rounded-lg border border-border shadow-card overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr style={{ background: "oklch(0.96 0.005 240)" }}>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 w-40">
                  Month
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                  Target
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                  Achieved
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
                        data-ocid={`${ocidPrefix}.item.${idx + 1}`}
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
    </div>
  );
}

// ─── Plan Monthly Summary ────────────────────────────────────────────────────

function PlanMonthlySummary() {
  const [selectedFYStart, setSelectedFYStart] = useState(currentFYStartYear());
  const { data: allData, isLoading } = useAllMonthsSorted();
  const { currencySymbol } = useSettings();

  const planMap = new Map<string, { target: number; achieved: number }>();
  const valueMap = new Map<string, { target: number; achieved: number }>();

  if (allData) {
    for (const [key, salesData] of allData) {
      const m = Number(key.month);
      const y = Number(key.year);
      const fyStart = m >= 4 ? y : y - 1;
      if (fyStart === selectedFYStart) {
        planMap.set(`${m}-${y}`, {
          target: salesData.plan.target,
          achieved: salesData.plan.achieved,
        });
        valueMap.set(`${m}-${y}`, {
          target: salesData.value.target,
          achieved: salesData.value.achieved,
        });
      }
    }
  }

  const buildRows = (map: Map<string, { target: number; achieved: number }>) =>
    FY_MONTH_ORDER.map((month) => {
      const year = month >= 4 ? selectedFYStart : selectedFYStart + 1;
      const entry = map.get(`${month}-${year}`);
      return {
        monthName: MONTHS[month - 1],
        month,
        year,
        target: entry?.target ?? null,
        achieved: entry?.achieved ?? null,
      };
    });

  const buildTotals = (
    map: Map<string, { target: number; achieved: number }>,
  ) => {
    let t = 0;
    let a = 0;
    for (const [, v] of map) {
      t += v.target;
      a += v.achieved;
    }
    return { grandTarget: t, grandAchieved: a };
  };

  const planRows = buildRows(planMap);
  const valueRows = buildRows(valueMap);
  const planTotals = buildTotals(planMap);
  const valueTotals = buildTotals(valueMap);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            GH/RGA & VALUE — Monthly Summary
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {getFYLabel(selectedFYStart)} (Apr {selectedFYStart} – Mar{" "}
            {selectedFYStart + 1})
          </p>
        </div>
        <Select
          value={String(selectedFYStart)}
          onValueChange={(v) => setSelectedFYStart(Number(v))}
        >
          <SelectTrigger className="w-36 bg-card border border-border">
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

      <MonthlySummaryTable
        title="GH/RGA — Monthly Summary"
        rows={planRows}
        grandTarget={planTotals.grandTarget}
        grandAchieved={planTotals.grandAchieved}
        isLoading={isLoading}
        currencySymbol={currencySymbol}
        ocidPrefix="plan_monthly_summary"
      />

      <MonthlySummaryTable
        title="VALUE — Monthly Summary"
        rows={valueRows}
        grandTarget={valueTotals.grandTarget}
        grandAchieved={valueTotals.grandAchieved}
        isLoading={isLoading}
        currencySymbol={currencySymbol}
        ocidPrefix="value_monthly_summary"
      />
    </motion.div>
  );
}

// ─── Shared yearly summary table renderer ───────────────────────────────────

interface YearlySummaryTableProps {
  title: string;
  fyMap: Map<number, { target: number; achieved: number }>;
  isLoading: boolean;
  currencySymbol: string;
  ocidPrefix: string;
  emptyMessage: string;
}

function YearlySummaryTable({
  title,
  fyMap,
  isLoading,
  currencySymbol,
  ocidPrefix,
  emptyMessage,
}: YearlySummaryTableProps) {
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
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
      <div className="rounded-lg border border-border shadow-card overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr style={{ background: "oklch(0.96 0.005 240)" }}>
                <th className="text-left px-4 py-3 font-semibold text-foreground/70 w-36">
                  Financial Year
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                  Target
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground/70 w-32">
                  Achieved
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
                  >
                    {emptyMessage}
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
                      data-ocid={`${ocidPrefix}.item.${idx + 1}`}
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
    </div>
  );
}

// ─── Plan Yearly Summary ─────────────────────────────────────────────────

function PlanYearlySummary() {
  const { data: allData, isLoading } = useAllMonthsSorted();
  const { currencySymbol } = useSettings();

  const planFyMap = new Map<number, { target: number; achieved: number }>();
  const valueFyMap = new Map<number, { target: number; achieved: number }>();

  if (allData) {
    for (const [key, salesData] of allData) {
      const m = Number(key.month);
      const y = Number(key.year);
      const fyStart = m >= 4 ? y : y - 1;

      const existingPlan = planFyMap.get(fyStart) ?? { target: 0, achieved: 0 };
      planFyMap.set(fyStart, {
        target: existingPlan.target + salesData.plan.target,
        achieved: existingPlan.achieved + salesData.plan.achieved,
      });

      const existingValue = valueFyMap.get(fyStart) ?? {
        target: 0,
        achieved: 0,
      };
      valueFyMap.set(fyStart, {
        target: existingValue.target + salesData.value.target,
        achieved: existingValue.achieved + salesData.value.achieved,
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          GH/RGA & VALUE — Yearly Summary
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Performance aggregated by financial year (Apr – Mar)
        </p>
      </div>

      <YearlySummaryTable
        title="GH/RGA — Yearly Summary"
        fyMap={planFyMap}
        isLoading={isLoading}
        currencySymbol={currencySymbol}
        ocidPrefix="plan_yearly_summary"
        emptyMessage="No data available yet. Enter GH/RGA targets in the Monthly sub-tab."
      />

      <YearlySummaryTable
        title="VALUE — Yearly Summary"
        fyMap={valueFyMap}
        isLoading={isLoading}
        currencySymbol={currencySymbol}
        ocidPrefix="value_yearly_summary"
        emptyMessage="No data available yet. Enter VALUE targets in the Monthly sub-tab."
      />
    </motion.div>
  );
}

// ─── Main PlanPage export ───────────────────────────────────────────────

export default function PlanPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-5xl mx-auto"
      data-ocid="plan.section"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          GH/RGA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track GH/RGA and VALUE targets and achievements separately
        </p>
      </div>

      <Tabs defaultValue="monthly">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="monthly-summary">Monthly Summary</TabsTrigger>
          <TabsTrigger value="yearly-summary">Yearly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <PlanMonthly />
        </TabsContent>
        <TabsContent value="monthly-summary">
          <PlanMonthlySummary />
        </TabsContent>
        <TabsContent value="yearly-summary">
          <PlanYearlySummary />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
