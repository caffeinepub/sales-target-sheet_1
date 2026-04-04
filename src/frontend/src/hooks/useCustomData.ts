import { useCallback } from "react";

export interface CustomCategoryValues {
  [key: string]: { target: number; achieved: number };
}

function storageKey(mobile: string, month: number, year: number): string {
  return `custom_category_data_${mobile}_${month}_${year}`;
}

export function getCustomData(
  mobile: string,
  month: number,
  year: number,
): CustomCategoryValues {
  try {
    const raw = localStorage.getItem(storageKey(mobile, month, year));
    if (!raw) return {};
    return JSON.parse(raw) as CustomCategoryValues;
  } catch {
    return {};
  }
}

export function saveCustomData(
  mobile: string,
  month: number,
  year: number,
  data: CustomCategoryValues,
): void {
  try {
    localStorage.setItem(storageKey(mobile, month, year), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function getAllCustomData(
  mobile: string,
): Array<{ month: number; year: number; data: CustomCategoryValues }> {
  const prefix = `custom_category_data_${mobile}_`;
  const results: Array<{
    month: number;
    year: number;
    data: CustomCategoryValues;
  }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;
    const rest = key.slice(prefix.length);
    const parts = rest.split("_");
    const month = Number(parts[0]);
    const year = Number(parts[1]);
    if (!Number.isNaN(month) && !Number.isNaN(year)) {
      results.push({ month, year, data: getCustomData(mobile, month, year) });
    }
  }
  return results;
}

export function useCustomData(mobile: string) {
  const getForMonth = useCallback(
    (month: number, year: number): CustomCategoryValues => {
      return getCustomData(mobile, month, year);
    },
    [mobile],
  );

  const saveForMonth = useCallback(
    (month: number, year: number, data: CustomCategoryValues): void => {
      saveCustomData(mobile, month, year, data);
    },
    [mobile],
  );

  return { getForMonth, saveForMonth };
}
