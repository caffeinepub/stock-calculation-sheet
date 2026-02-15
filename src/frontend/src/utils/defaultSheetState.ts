import type { StockSheet } from '../types/stockSheet';

export function getDefaultSheetState(): StockSheet {
  return {
    openingStock: Array.from({ length: 7 }, (_, i) => ({
      name: `Item ${i + 1}`,
      quantity: 10,
    })),
    purchase: Array.from({ length: 10 }, (_, i) => ({
      name: `Party ${i + 1}`,
      quantity: 1,
    })),
    sales: Array.from({ length: 10 }, (_, i) => ({
      name: `Party ${i + 1}`,
      quantity: 1,
    })),
    suspense: Array.from({ length: 10 }, (_, i) => ({
      name: `Party ${i + 1}`,
      quantity: 1,
    })),
  };
}
