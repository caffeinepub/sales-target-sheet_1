import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SalesData, SalesKey } from "../backend.d";
import { useActor } from "./useActor";

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

export const emptySalesData = (): SalesData => ({
  overallSale: { target: 0n, achieved: 0n },
  withoutCoin: { target: 0n, achieved: 0n },
  studded: { target: 0n, achieved: 0n },
  plain: { target: 0n, achieved: 0n },
  plan: { target: 0n, achieved: 0n },
});

export function useSalesMonth(month: number, year: number) {
  const { actor, isFetching } = useActor();
  const key: SalesKey = { month: BigInt(month), year: BigInt(year) };

  return useQuery<SalesData>({
    queryKey: ["salesMonth", month, year],
    queryFn: async () => {
      if (!actor) return emptySalesData();
      try {
        return await actor.getMonth(key);
      } catch {
        return emptySalesData();
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveMonth() {
  const { actor } = useActor();
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
      const key: SalesKey = { month: BigInt(month), year: BigInt(year) };
      await actor.saveMonth(key, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["salesMonth", variables.month, variables.year],
      });
    },
  });
}
