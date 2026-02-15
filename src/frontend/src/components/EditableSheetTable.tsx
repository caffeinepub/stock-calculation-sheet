import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { formatNumber, isValidIntermediateInput, normalizeToThreeDecimals } from '../utils/numberFormat';
import type { StockSheetRow, TableColumn } from '../types/stockSheet';

interface EditableSheetTableProps {
  rows: StockSheetRow[];
  onChange: (rows: StockSheetRow[]) => void;
  columns: TableColumn[];
}

export default function EditableSheetTable({ rows, onChange, columns }: EditableSheetTableProps) {
  // Track which cell is being edited and its raw string value
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string; value: string } | null>(null);

  const handleCellChange = (index: number, field: keyof StockSheetRow, value: string) => {
    if (field === 'quantity') {
      // For quantity fields, validate intermediate input
      if (isValidIntermediateInput(value)) {
        setEditingCell({ rowIndex: index, field, value });
      }
    } else {
      // For text fields, update immediately
      const newRows = [...rows];
      newRows[index] = { ...newRows[index], [field]: value };
      onChange(newRows);
    }
  };

  const handleCellBlur = (index: number, field: keyof StockSheetRow) => {
    if (field === 'quantity' && editingCell && editingCell.rowIndex === index) {
      // Normalize and commit the value
      const normalized = normalizeToThreeDecimals(editingCell.value);
      const newRows = [...rows];
      newRows[index] = { ...newRows[index], quantity: normalized };
      onChange(newRows);
      setEditingCell(null);
    }
  };

  const handleCellFocus = (index: number, field: keyof StockSheetRow) => {
    if (field === 'quantity') {
      // Initialize editing state with current formatted value
      setEditingCell({ rowIndex: index, field, value: formatNumber(rows[index].quantity) });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: keyof StockSheetRow) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellBlur(index, field);
      // Move focus to next row or add new row
      if (index === rows.length - 1) {
        handleAddRow();
      }
    }
  };

  const handleAddRow = () => {
    onChange([...rows, { name: '', quantity: 0 }]);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length > 1) {
      onChange(rows.filter((_, i) => i !== index));
      // Clear editing state if deleting the edited row
      if (editingCell && editingCell.rowIndex === index) {
        setEditingCell(null);
      }
    }
  };

  const getCellValue = (row: StockSheetRow, col: TableColumn, rowIndex: number): string => {
    if (col.type === 'number') {
      // If this cell is being edited, show the raw editing value
      if (editingCell && editingCell.rowIndex === rowIndex && editingCell.field === col.key) {
        return editingCell.value;
      }
      // Otherwise show formatted value
      return formatNumber(row.quantity);
    }
    return row.name;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className="bg-muted/50">
                {col.label}
              </TableHead>
            ))}
            <TableHead className="bg-muted/50 w-[80px] print:hidden">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((col) => (
                <TableCell key={col.key} className="p-2">
                  <Input
                    type="text"
                    value={getCellValue(row, col, index)}
                    onChange={(e) => handleCellChange(index, col.key as keyof StockSheetRow, e.target.value)}
                    onBlur={() => handleCellBlur(index, col.key as keyof StockSheetRow)}
                    onFocus={() => handleCellFocus(index, col.key as keyof StockSheetRow)}
                    onKeyDown={(e) => handleKeyDown(e, index, col.key as keyof StockSheetRow)}
                    className="h-9 border-border/50 print:border-0 print:bg-transparent print:p-0"
                    placeholder={col.type === 'number' ? '0.000' : ''}
                  />
                </TableCell>
              ))}
              <TableCell className="p-2 print:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRow(index)}
                  disabled={rows.length === 1}
                  className="h-9 w-9 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="p-3 border-t print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
      </div>
    </div>
  );
}
