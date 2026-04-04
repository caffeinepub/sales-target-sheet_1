import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import type { SalesData, SalesKey } from "../backend.d";
import { useActor } from "./useActor";
import { UserContext } from "./useUser";

// Calendar month names (index 0 = January)
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Financial year months in order: April(4) ... March(3)
export const FY_MONTH_ORDER = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

/**
 * Given a calendar month (1–12) and calendar year, return the financial year
 * start year. FY starts in April. So April 2025 – March 2026 = FY 2025-26.
 */
export function getFYStartYear(month: number, year: number): number {
  return month >= 4 ? year : year - 1;
}

/**
 * Label for a financial year, e.g. getFYLabel(2025) => "FY 2025-26"
 */
export function getFYLabel(fyStartYear: number): string {
  return `FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`;
}

/**
 * Returns the current financial year start year
 */
export function currentFYStartYear(): number {
  const now = new Date();
  return getFYStartYear(now.getMonth() + 1, now.getFullYear());
}

export const emptySalesData = (): SalesData => ({
  overallSale: { target: 0, achieved: 0 },
  withoutCoin: { target: 0, achieved: 0 },
  studded: { target: 0, achieved: 0 },
  plain: { target: 0, achieved: 0 },
  plan: { target: 0, achieved: 0 },
  value: { target: 0, achieved: 0 },
});

export function useSalesMonth(month: number, year: number) {
  const { actor, isFetching } = useActor();
  const { mobile } = useContext(UserContext);
  const key: SalesKey = { month: BigInt(month), year: BigInt(year) };

  return useQuery<SalesData>({
    queryKey: ["salesMonth", mobile, month, year],
    queryFn: async () => {
      if (!actor || !mobile) return emptySalesData();
      try {
        return await actor.getMonth(mobile, key);
      } catch {
        return emptySalesData();
      }
    },
    enabled: !!actor && !isFetching && !!mobile,
  });
}

export function useAllMonthsSorted() {
  const { actor, isFetching } = useActor();
  const { mobile } = useContext(UserContext);

  return useQuery<Array<[SalesKey, SalesData]>>({
    queryKey: ["allMonthsSorted", mobile],
    queryFn: async () => {
      if (!actor || !mobile) return [];
      try {
        return await actor.getAllMonthsSorted(mobile);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!mobile,
  });
}

export function useSaveMonth() {
  const { actor } = useActor();
  const { mobile } = useContext(UserContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      month,
      year,
      data,
    }: {
      month: number;
      year: number;
      data: SalesData;
    }) => {
      if (!actor) throw new Error("No actor available");
      if (!mobile) throw new Error("No user mobile");
      const key: SalesKey = { month: BigInt(month), year: BigInt(year) };
      await actor.saveMonth(mobile, key, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["salesMonth", mobile, variables.month, variables.year],
      });
      queryClient.invalidateQueries({
        queryKey: ["allMonthsSorted", mobile],
      });
    },
  });
}
