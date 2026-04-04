import { useCallback, useEffect, useState } from "react";

export interface CategoryConfig {
  key: string;
  label: string;
  visible: boolean;
}

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { key: "overallSale", label: "Overall Sale", visible: true },
  { key: "withoutCoin", label: "W/O Coin", visible: true },
  { key: "studded", label: "Studded", visible: true },
  { key: "plain", label: "Plain", visible: true },
];

const DEFAULT_KEYS = new Set(DEFAULT_CATEGORIES.map((c) => c.key));

function storageKey(mobile: string): string {
  return `sales_categories_${mobile}`;
}

function loadFromStorage(mobile: string): CategoryConfig[] {
  try {
    const raw = localStorage.getItem(storageKey(mobile));
    if (!raw) return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
    const parsed = JSON.parse(raw) as CategoryConfig[];
    const keyMap = new Map(parsed.map((c) => [c.key, c]));
    // Merge defaults (preserving customizations)
    const merged = DEFAULT_CATEGORIES.map((def) => {
      const stored = keyMap.get(def.key);
      if (stored)
        return { ...def, label: stored.label, visible: stored.visible };
      return { ...def };
    });
    // Append any custom categories (keys not in defaults)
    for (const cat of parsed) {
      if (!DEFAULT_KEYS.has(cat.key)) {
        merged.push({ ...cat });
      }
    }
    return merged;
  } catch {
    return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  }
}

function saveToStorage(mobile: string, categories: CategoryConfig[]): void {
  try {
    localStorage.setItem(storageKey(mobile), JSON.stringify(categories));
  } catch {
    // ignore storage errors
  }
}

function nextCustomKey(categories: CategoryConfig[]): string {
  let max = 0;
  for (const cat of categories) {
    const match = cat.key.match(/^custom_(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `custom_${max + 1}`;
}

export function useCategories(mobile: string) {
  const [categories, setCategories] = useState<CategoryConfig[]>(() =>
    loadFromStorage(mobile),
  );

  // Re-initialize when mobile changes
  useEffect(() => {
    setCategories(loadFromStorage(mobile));
  }, [mobile]);

  useEffect(() => {
    saveToStorage(mobile, categories);
  }, [mobile, categories]);

  const addCategory = useCallback((label: string) => {
    setCategories((prev) => {
      const key = nextCustomKey(prev);
      return [
        ...prev,
        { key, label: label.trim() || "New Category", visible: true },
      ];
    });
  }, []);

  const renameCategory = useCallback((key: string, newLabel: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.key === key ? { ...c, label: newLabel.trim() || c.label } : c,
      ),
    );
  }, []);

  const deleteCategory = useCallback((key: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: false } : c)),
    );
  }, []);

  const restoreCategory = useCallback((key: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: true } : c)),
    );
  }, []);

  const resetCategories = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES.map((c) => ({ ...c })));
  }, []);

  const visibleCategories = categories.filter((c) => c.visible);
  const hiddenCategories = categories.filter((c) => !c.visible);

  return {
    categories,
    visibleCategories,
    hiddenCategories,
    addCategory,
    renameCategory,
    deleteCategory,
    restoreCategory,
    resetCategories,
  };
}
