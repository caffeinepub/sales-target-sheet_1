import { Input } from "@/components/ui/input";
import type { SalesData } from "../backend.d";

interface CategoryRow {
  label: string;
  key: keyof SalesData;
  ocidPrefix: string;
}

const CATEGORIES: CategoryRow[] = [
  { label: "Overall Sale", key: "overallSale", ocidPrefix: "overall" },
  { label: "W/O Coin", key: "withoutCoin", ocidPrefix: "wo_coin" },
  { label: "Studded", key: "studded", ocidPrefix: "studded" },
  { label: "Plain", key: "plain", ocidPrefix: "plain" },
  { label: "Plan", key: "plan", ocidPrefix: "plan" },
];

function toNum(v: bigint): number {
  return Number(v);
}

function calcPercent(target: bigint, achieved: bigint): number {
  if (target === 0n) return 0;
  return Math.round((Number(achieved) / Number(target)) * 100);
}

interface Props {
  data: SalesData;
  isEditing: boolean;
  onChange: (data: SalesData) => void;
}

function ProgressBar({ percent }: { percent: number }) {
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

export default function TargetsTable({ data, isEditing, onChange }: Props) {
  const handleChange = (
    key: keyof SalesData,
    field: "target" | "achieved",
    rawValue: string,
  ) => {
    const numVal =
      rawValue === "" ? 0 : Math.max(0, Number.parseInt(rawValue, 10) || 0);
    onChange({
      ...data,
      [key]: {
        ...data[key],
        [field]: BigInt(numVal),
      },
    });
  };

  // Totals
  const totalTarget = CATEGORIES.reduce(
    (acc, c) => acc + toNum(data[c.key].target),
    0,
  );
  const totalAchieved = CATEGORIES.reduce(
    (acc, c) => acc + toNum(data[c.key].achieved),
    0,
  );
  const totalRemaining = totalTarget - totalAchieved;
  const totalPercent =
    totalTarget === 0 ? 0 : Math.round((totalAchieved / totalTarget) * 100);

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
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((cat, idx) => {
            const row = data[cat.key];
            const remaining = toNum(row.target) - toNum(row.achieved);
            const pct = calcPercent(row.target, row.achieved);
            const rowNum = idx + 1;

            return (
              <tr
                key={cat.key}
                className="border-t border-border hover:bg-secondary/40 transition-colors"
                data-ocid={`targets.item.${rowNum}`}
              >
                {/* Category */}
                <td className="px-4 py-3 font-medium text-foreground">
                  {cat.label}
                </td>

                {/* Target */}
                <td className="px-4 py-2 text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={toNum(row.target)}
                      onChange={(e) =>
                        handleChange(cat.key, "target", e.target.value)
                      }
                      className="text-right h-8 w-full max-w-[110px] ml-auto"
                      data-ocid={`targets.${cat.ocidPrefix}.target.input`}
                    />
                  ) : (
                    <span className="text-foreground font-medium">
                      {toNum(row.target).toLocaleString()}
                    </span>
                  )}
                </td>

                {/* Achieved */}
                <td className="px-4 py-2 text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={toNum(row.achieved)}
                      onChange={(e) =>
                        handleChange(cat.key, "achieved", e.target.value)
                      }
                      className="text-right h-8 w-full max-w-[110px] ml-auto"
                      data-ocid={`targets.${cat.ocidPrefix}.achieved.input`}
                    />
                  ) : (
                    <span className="text-foreground font-medium">
                      {toNum(row.achieved).toLocaleString()}
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
                    {Math.abs(remaining).toLocaleString()}
                    {remaining < 0 ? " over" : ""}
                  </span>
                </td>

                {/* % Achievement */}
                <td className="px-4 py-3">
                  <ProgressBar percent={pct} />
                </td>
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
              {totalTarget.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-right font-bold text-foreground">
              {totalAchieved.toLocaleString()}
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
                {Math.abs(totalRemaining).toLocaleString()}
                {totalRemaining < 0 ? " over" : ""}
              </span>
            </td>
            <td className="px-4 py-3">
              <ProgressBar percent={totalPercent} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
