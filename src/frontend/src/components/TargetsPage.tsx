import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SalesData } from "../backend.d";
import { useCategories } from "../hooks/useCategories";
import type { CustomCategoryValues } from "../hooks/useCustomData";
import { getCustomData, saveCustomData } from "../hooks/useCustomData";
import {
  FY_MONTH_ORDER,
  MONTHS,
  currentFYStartYear,
  emptySalesData,
  getFYLabel,
  useSalesMonth,
  useSaveMonth,
} from "../hooks/useQueries";
import { useUser } from "../hooks/useUser";
import TargetsTable from "./TargetsTable";

interface Props {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

const curFY = currentFYStartYear();
const FY_OPTIONS = Array.from({ length: 5 }, (_, i) => curFY - 2 + i);

function getFYMonthOptions(fyStart: number) {
  return FY_MONTH_ORDER.map((month) => {
    const year = month >= 4 ? fyStart : fyStart + 1;
    return { month, year, label: `${MONTHS[month - 1]} ${year}` };
  });
}

const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5", "r6"];

export default function TargetsPage({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: Props) {
  const { mobile } = useUser();
  const userMobile = mobile ?? "";

  const { data, isLoading } = useSalesMonth(selectedMonth, selectedYear);
  const saveMonth = useSaveMonth();

  const { visibleCategories, renameCategory, deleteCategory } =
    useCategories(userMobile);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SalesData | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [customEditData, setCustomEditData] =
    useState<CustomCategoryValues | null>(null);

  const activeFYStart = selectedMonth >= 4 ? selectedYear : selectedYear - 1;
  const [displayFYStart, setDisplayFYStart] = useState(activeFYStart);

  const currentKey = `${selectedMonth}-${selectedYear}`;
  const inEditForCurrentKey = isEditing && editKey === currentKey;

  const handleFYChange = (fyStart: number) => {
    setDisplayFYStart(fyStart);
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
    setCustomEditData(null);
    onMonthChange(4);
    onYearChange(fyStart);
  };

  const handleMonthYearSelect = (month: number, year: number) => {
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
    setCustomEditData(null);
    onMonthChange(month);
    onYearChange(year);
  };

  const handleEditStart = () => {
    setEditData(structuredClone(data ?? emptySalesData()));
    setCustomEditData(getCustomData(userMobile, selectedMonth, selectedYear));
    setIsEditing(true);
    setEditKey(currentKey);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
    setCustomEditData(null);
  };

  const handleSave = async () => {
    if (!editData) return;
    try {
      await saveMonth.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
        data: editData,
      });
      // Also save custom data to localStorage
      saveCustomData(
        userMobile,
        selectedMonth,
        selectedYear,
        customEditData ?? {},
      );
      toast.success("Targets saved successfully");
      setIsEditing(false);
      setEditData(null);
      setEditKey(null);
      setCustomEditData(null);
    } catch (err) {
      toast.error("Failed to save. Please try again.");
      console.error(err);
    }
  };

  const displayData =
    inEditForCurrentKey && editData ? editData : (data ?? emptySalesData());

  const displayCustomData =
    inEditForCurrentKey && customEditData
      ? customEditData
      : getCustomData(userMobile, selectedMonth, selectedYear);

  const monthOptions = getFYMonthOptions(displayFYStart);
  const selectedOptionKey = `${selectedMonth}-${selectedYear}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-5xl mx-auto"
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Targets Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {MONTHS[selectedMonth - 1]} {selectedYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* FY selector */}
          <Select
            value={String(displayFYStart)}
            onValueChange={(v) => handleFYChange(Number(v))}
          >
            <SelectTrigger
              className="w-36 bg-card border border-border"
              data-ocid="targets.fy.select"
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

          {/* Month selector (FY-ordered) */}
          <Select
            value={selectedOptionKey}
            onValueChange={(v) => {
              const [m, y] = v.split("-").map(Number);
              handleMonthYearSelect(m, y);
            }}
          >
            <SelectTrigger
              className="w-44 bg-card border border-border"
              data-ocid="targets.month.select"
            >
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

          {/* Edit / Save / Cancel */}
          {!inEditForCurrentKey ? (
            <Button
              onClick={handleEditStart}
              data-ocid="targets.edit_button"
              className="text-white"
              style={{ background: "oklch(var(--teal))" }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Targets
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={saveMonth.isPending}
                data-ocid="targets.save_button"
                className="text-white"
                style={{ background: "oklch(var(--teal))" }}
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
                data-ocid="targets.cancel_button"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Targets card */}
      <Card
        className="shadow-card border border-border"
        data-ocid="targets.card"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground">
            {MONTHS[selectedMonth - 1]} {selectedYear} — Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="p-6 space-y-3"
              data-ocid="targets.loading_state"
              aria-live="polite"
              aria-busy="true"
            >
              {SKELETON_ROWS.map((id) => (
                <Skeleton key={id} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : (
            <TargetsTable
              data={displayData}
              isEditing={inEditForCurrentKey}
              onChange={setEditData}
              categories={visibleCategories}
              onRename={renameCategory}
              onDelete={deleteCategory}
              customData={displayCustomData}
              onCustomChange={setCustomEditData}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
