export interface StockSheetRow {
  name: string;
  quantity: number;
}

export interface StockSheet {
  openingStock: StockSheetRow[];
  purchase: StockSheetRow[];
  sales: StockSheetRow[];
  suspense: StockSheetRow[];
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number';
}
