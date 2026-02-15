import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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

export interface EditableSheetTableHandle {
  commitPendingEdits: () => void;
}

const EditableSheetTable = forwardRef<EditableSheetTableHandle, EditableSheetTableProps>(
  ({ rows, onChange, columns }, ref) => {
    // Track which cell is being edited and its raw string value
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string; value: string } | null>(null);
    
    // Track pending focus target after state update
    const [pendingFocus, setPendingFocus] = useState<{ rowIndex: number; field: string } | null>(null);
    
    // Create refs for all inputs
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    // Expose method to commit pending edits
    useImperativeHandle(ref, () => ({
      commitPendingEdits: () => {
        if (editingCell && editingCell.field === 'quantity') {
          const normalized = normalizeToThreeDecimals(editingCell.value);
          const newRows = [...rows];
          newRows[editingCell.rowIndex] = { ...newRows[editingCell.rowIndex], quantity: normalized };
          onChange(newRows);
          setEditingCell(null);
        }
      },
    }));

    // Effect to handle pending focus after render
    useEffect(() => {
      if (pendingFocus) {
        const key = `${pendingFocus.rowIndex}-${pendingFocus.field}`;
        const input = inputRefs.current.get(key);
        if (input) {
          input.focus();
          setPendingFocus(null);
        }
      }
    }, [pendingFocus, rows.length]);

    const setInputRef = (rowIndex: number, field: string, element: HTMLInputElement | null) => {
      const key = `${rowIndex}-${field}`;
      if (element) {
        inputRefs.current.set(key, element);
      } else {
        inputRefs.current.delete(key);
      }
    };

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
        const currentValue = rows[index].quantity;
        // If value is 0, start with empty string; otherwise use formatted value
        const initialValue = currentValue === 0 ? '' : formatNumber(currentValue);
        setEditingCell({ rowIndex: index, field, value: initialValue });
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number, field: keyof StockSheetRow) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        if (field === 'name') {
          // Move focus from Name to Quantity in the same row
          const quantityKey = `${index}-quantity`;
          const quantityInput = inputRefs.current.get(quantityKey);
          if (quantityInput) {
            quantityInput.focus();
          }
        } else if (field === 'quantity') {
          // Commit the quantity value
          handleCellBlur(index, field);
          
          // Move to next row's Name cell or add new row
          if (index === rows.length - 1) {
            // Last row: add new row and focus its Name cell
            const newRows = [...rows, { name: '', quantity: 0 }];
            onChange(newRows);
            setPendingFocus({ rowIndex: index + 1, field: 'name' });
          } else {
            // Not last row: focus next row's Name cell
            const nextNameKey = `${index + 1}-name`;
            const nextNameInput = inputRefs.current.get(nextNameKey);
            if (nextNameInput) {
              nextNameInput.focus();
            }
          }
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
        // If not editing and value is 0, show empty string (placeholder will show)
        if (row.quantity === 0) {
          return '';
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
                      ref={(el) => setInputRef(index, col.key, el)}
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
);

EditableSheetTable.displayName = 'EditableSheetTable';

export default EditableSheetTable;
