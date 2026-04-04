import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";
import { useRef, useState } from "react";
import type { SalesData } from "../backend.d";
import type { CategoryConfig } from "../hooks/useCategories";
import type { CustomCategoryValues } from "../hooks/useCustomData";
import { useSettings } from "../hooks/useSettings";

const BACKEND_KEYS = new Set([
  "overallSale",
  "withoutCoin",
  "studded",
  "plain",
  "plan",
]);

function calcPercent(target: number, achieved: number): number {
  if (target === 0) return 0;
  return Math.round((achieved / target) * 100);
}

interface Props {
  data: SalesData;
  isEditing: boolean;
  onChange: (data: SalesData) => void;
  categories: CategoryConfig[];
  onRename: (key: string, newLabel: string) => void;
  onDelete: (key: string) => void;
  customData: CustomCategoryValues;
  onCustomChange: (data: CustomCategoryValues) => void;
}

export function ProgressBar({ percent }: { percent: number }) {
  const capped = Math.min(percent, 100);

  return (
    <div
      className="relative h-6 w-full rounded overflow-hidden"
      style={{ background: "oklch(0.92 0.005 240)" }}
      aria-label={`${percent}% achieved`}
    >
      {capped > 0 && (
        <div
          className="h-full flex items-center justify-center transition-all duration-500"
          style={{
            width: `${capped}%`,
            minWidth: capped > 0 ? "2.5rem" : "0",
            background: "oklch(var(--navy))",
          }}
        >
          <span className="text-white text-xs font-semibold px-1 truncate">
            {percent}%
          </span>
        </div>
      )}
      {capped === 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-medium">
          0%
        </span>
      )}
    </div>
  );
}

interface InlineRenameProps {
  currentLabel: string;
  onConfirm: (newLabel: string) => void;
  onCancel: () => void;
}

function InlineRename({
  currentLabel,
  onConfirm,
  onCancel,
}: InlineRenameProps) {
  const [value, setValue] = useState(currentLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
    else onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-7 text-sm w-28 px-2"
        data-ocid="targets.rename.input"
      />
      <button
        type="button"
        onClick={handleConfirm}
        className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors"
        aria-label="Confirm rename"
        data-ocid="targets.rename.confirm_button"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 rounded text-muted-foreground hover:bg-secondary transition-colors"
        aria-label="Cancel rename"
        data-ocid="targets.rename.cancel_button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function TargetsTable({
  data,
  isEditing,
  onChange,
  categories,
  onRename,
  onDelete: _onDelete,
  customData,
  onCustomChange,
}: Props) {
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const { currencySymbol } = useSettings();

  const handleChange = (
    key: string,
    field: "target" | "achieved",
    rawValue: string,
  ) => {
    const parsed = Number.parseFloat(rawValue);
    const numVal =
      Number.isNaN(parsed) || rawValue === ""
        ? 0
        : Math.max(0, Math.round(parsed * 100) / 100);
    if (BACKEND_KEYS.has(key)) {
      onChange({
        ...data,
        [key]: {
          ...(
            data as unknown as Record<
              string,
              { target: number; achieved: number }
            >
          )[key],
          [field]: numVal,
        },
      });
    } else {
      onCustomChange({
        ...customData,
        [key]: {
          ...(customData[key] ?? { target: 0, achieved: 0 }),
          [field]: numVal,
        },
      });
    }
  };

  const handleRenameConfirm = (key: string, newLabel: string) => {
    onRename(key, newLabel);
    setRenamingKey(null);
  };

  // Totals (only visible categories, combining backend + custom)
  const totalTarget = categories.reduce((acc, c) => {
    const row = BACKEND_KEYS.has(c.key)
      ? ((
          data as unknown as Record<
            string,
            { target: number; achieved: number }
          >
        )[c.key] ?? { target: 0, achieved: 0 })
      : (customData[c.key] ?? { target: 0, achieved: 0 });
    return acc + row.target;
  }, 0);

  const totalAchieved = categories.reduce((acc, c) => {
    const row = BACKEND_KEYS.has(c.key)
      ? ((
          data as unknown as Record<
            string,
            { target: number; achieved: number }
          >
        )[c.key] ?? { target: 0, achieved: 0 })
      : (customData[c.key] ?? { target: 0, achieved: 0 });
    return acc + row.achieved;
  }, 0);

  const totalRemaining = totalTarget - totalAchieved;
  const totalPercent =
    totalTarget === 0 ? 0 : Math.round((totalAchieved / totalTarget) * 100);

  const showActionsCol = !isEditing;

  return (
    <div className="overflow-x-auto" data-ocid="targets.table">
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
            {showActionsCol && (
              <th className="px-4 py-3 w-12" aria-label="Actions" />
            )}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, idx) => {
            const row = BACKEND_KEYS.has(cat.key)
              ? ((
                  data as unknown as Record<
                    string,
                    { target: number; achieved: number }
                  >
                )[cat.key] ?? { target: 0, achieved: 0 })
              : (customData[cat.key] ?? { target: 0, achieved: 0 });
            const remaining = row.target - row.achieved;
            const pct = calcPercent(row.target, row.achieved);
            const rowNum = idx + 1;
            const isRenaming = renamingKey === cat.key;

            return (
              <tr
                key={cat.key}
                className="border-t border-border hover:bg-secondary/40 transition-colors group"
                data-ocid={`targets.item.${rowNum}`}
              >
                {/* Category */}
                <td className="px-4 py-3 font-medium text-foreground">
                  {isRenaming && !isEditing ? (
                    <InlineRename
                      currentLabel={cat.label}
                      onConfirm={(newLabel) =>
                        handleRenameConfirm(cat.key, newLabel)
                      }
                      onCancel={() => setRenamingKey(null)}
                    />
                  ) : (
                    cat.label
                  )}
                </td>

                {/* Target */}
                <td className="px-4 py-2 text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      defaultValue={row.target.toFixed(2)}
                      onChange={(e) =>
                        handleChange(cat.key, "target", e.target.value)
                      }
                      className="text-right h-8 w-full max-w-[110px] ml-auto"
                      data-ocid={`targets.${cat.key}.target.input`}
                    />
                  ) : (
                    <span className="text-foreground font-medium">
                      {currencySymbol}
                      {row.target.toFixed(2)}
                    </span>
                  )}
                </td>

                {/* Achieved */}
                <td className="px-4 py-2 text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      defaultValue={row.achieved.toFixed(2)}
                      onChange={(e) =>
                        handleChange(cat.key, "achieved", e.target.value)
                      }
                      className="text-right h-8 w-full max-w-[110px] ml-auto"
                      data-ocid={`targets.${cat.key}.achieved.input`}
                    />
                  ) : (
                    <span className="text-foreground font-medium">
                      {currencySymbol}
                      {row.achieved.toFixed(2)}
                    </span>
                  )}
                </td>

                {/* Remaining */}
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-medium ${
                      remaining < 0
                        ? "text-destructive"
                        : remaining === 0
                          ? "text-teal"
                          : "text-foreground/70"
                    }`}
                  >
                    {remaining < 0 ? "+" : ""}
                    {currencySymbol}
                    {Math.abs(remaining).toFixed(2)}
                    {remaining < 0 ? " over" : ""}
                  </span>
                </td>

                {/* % Achievement */}
                <td className="px-4 py-3">
                  <ProgressBar percent={pct} />
                </td>

                {/* Rename action only (no delete) */}
                {showActionsCol && (
                  <td className="px-4 py-3">
                    {!isRenaming && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => setRenamingKey(cat.key)}
                          aria-label={`Rename ${cat.label}`}
                          data-ocid={`targets.item.${rowNum}.edit_button`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}

          {/* TOTALS row */}
          <tr
            className="border-t-2 border-border"
            style={{ background: "oklch(0.94 0.008 240)" }}
            data-ocid="targets.totals.row"
          >
            <td className="px-4 py-3 font-bold text-foreground">TOTALS</td>
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
                className={`${
                  totalRemaining < 0
                    ? "text-destructive"
                    : totalRemaining === 0
                      ? "text-teal"
                      : "text-foreground/70"
                }`}
              >
                {totalRemaining < 0 ? "+" : ""}
                {currencySymbol}
                {Math.abs(totalRemaining).toFixed(2)}
                {totalRemaining < 0 ? " over" : ""}
              </span>
            </td>
            <td className="px-4 py-3">
              <ProgressBar percent={totalPercent} />
            </td>
            {showActionsCol && <td />}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
