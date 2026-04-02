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
import { MONTHS, useSalesMonth, useSaveMonth } from "../hooks/useQueries";
import TargetsTable from "./TargetsTable";

interface Props {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5", "r6"];

export default function TargetsPage({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: Props) {
  const { data, isLoading } = useSalesMonth(selectedMonth, selectedYear);
  const saveMonth = useSaveMonth();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SalesData | null>(null);
  // Track which month/year we last entered edit mode for
  const [editKey, setEditKey] = useState<string | null>(null);

  // If month/year changed while in edit mode, exit edit mode
  const currentKey = `${selectedMonth}-${selectedYear}`;
  const inEditForCurrentKey = isEditing && editKey === currentKey;

  const handleMonthChange = (v: number) => {
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
    onMonthChange(v);
  };

  const handleYearChange = (v: number) => {
    setIsEditing(false);
    setEditData(null);
    setEditKey(null);
    onYearChange(v);
  };

  const handleEditStart = () => {
    if (data) {
      setEditData(structuredClone(data));
    }
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
      toast.success("Targets saved successfully");
      setIsEditing(false);
      setEditData(null);
      setEditKey(null);
    } catch (err) {
      toast.error("Failed to save. Please try again.");
      console.error(err);
    }
  };

  const displayData = inEditForCurrentKey && editData ? editData : data;

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
          {/* Month selector */}
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => handleMonthChange(Number(v))}
          >
            <SelectTrigger
              className="w-36 bg-card border border-border"
              data-ocid="targets.month.select"
            >
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year selector */}
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => handleYearChange(Number(v))}
          >
            <SelectTrigger
              className="w-24 bg-card border border-border"
              data-ocid="targets.year.select"
            >
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
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
              data={displayData!}
              isEditing={inEditForCurrentKey}
              onChange={setEditData}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
