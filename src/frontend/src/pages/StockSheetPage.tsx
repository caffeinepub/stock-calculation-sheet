import { useState, useEffect, useMemo, useRef } from 'react';
import { useStockSheet, useSnapshotDates } from '../hooks/useStockSheet';
import { getDefaultSheetState } from '../utils/defaultSheetState';
import { formatNumber } from '../utils/numberFormat';
import { getTodayDateKey, formatDateKey, parseDateKey } from '../utils/dateKey';
import { exportToExcel } from '../utils/exportToExcel';
import EditableSheetTable, { EditableSheetTableHandle } from '../components/EditableSheetTable';
import FinalCalculation from '../components/FinalCalculation';
import SectionCard from '../components/SectionCard';
import UserMenu from '../components/UserMenu';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Save, Loader2, Printer, Calendar, Download } from 'lucide-react';
import type { StockSheetRow } from '../types/stockSheet';

export default function StockSheetPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const { data: loadedSheet, isLoading, isFetched, saveSheet, isSaving, saveError, isSuccess } = useStockSheet(selectedDate);
  const { data: savedDates } = useSnapshotDates();

  const [openingStock, setOpeningStock] = useState<StockSheetRow[]>([]);
  const [purchase, setPurchase] = useState<StockSheetRow[]>([]);
  const [sales, setSales] = useState<StockSheetRow[]>([]);
  const [suspense, setSuspense] = useState<StockSheetRow[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Refs for each table to commit pending edits
  const openingStockRef = useRef<EditableSheetTableHandle>(null);
  const purchaseRef = useRef<EditableSheetTableHandle>(null);
  const salesRef = useRef<EditableSheetTableHandle>(null);
  const suspenseRef = useRef<EditableSheetTableHandle>(null);

  // Initialize state from loaded data or defaults
  useEffect(() => {
    if (loadedSheet) {
      setOpeningStock(loadedSheet.openingStock);
      setPurchase(loadedSheet.purchase);
      setSales(loadedSheet.sales);
      setSuspense(loadedSheet.suspense);
    } else if (isFetched) {
      const defaults = getDefaultSheetState();
      setOpeningStock(defaults.openingStock);
      setPurchase(defaults.purchase);
      setSales(defaults.sales);
      setSuspense(defaults.suspense);
    }
  }, [loadedSheet, isFetched]);

  // Show success message briefly after save
  useEffect(() => {
    if (isSuccess) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Calculate totals
  const totals = useMemo(() => {
    const openingTotal = openingStock.reduce((sum, row) => sum + row.quantity, 0);
    const purchaseTotal = purchase.reduce((sum, row) => sum + row.quantity, 0);
    const salesTotal = sales.reduce((sum, row) => sum + row.quantity, 0);
    const suspenseTotal = suspense.reduce((sum, row) => sum + row.quantity, 0);
    const closingStock = openingTotal + purchaseTotal - salesTotal - suspenseTotal;

    return {
      opening: openingTotal,
      purchase: purchaseTotal,
      sales: salesTotal,
      suspense: suspenseTotal,
      closing: closingStock,
    };
  }, [openingStock, purchase, sales, suspense]);

  const handleSave = () => {
    // Commit any pending edits in all tables before saving
    openingStockRef.current?.commitPendingEdits();
    purchaseRef.current?.commitPendingEdits();
    salesRef.current?.commitPendingEdits();
    suspenseRef.current?.commitPendingEdits();

    // Use setTimeout to ensure state updates from commitPendingEdits are applied
    setTimeout(() => {
      saveSheet({
        openingStock,
        purchase,
        sales,
        suspense,
      });
    }, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const selectedDateObj = parseDateKey(selectedDate);
    const formattedDate = selectedDateObj 
      ? selectedDateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\//g, '-')
      : selectedDate;

    exportToExcel(
      {
        openingStock,
        purchase,
        sales,
        suspense,
      },
      totals,
      formattedDate
    );
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const selectedDateObj = parseDateKey(selectedDate);
  const formattedDate = selectedDateObj 
    ? selectedDateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : selectedDate;

  if (isLoading && !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 print:hidden">
        <div className="container mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Stock Calculation Sheet</h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <UserMenu />
            </div>
          </div>
          
          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="date-selector" className="text-sm font-medium">
              Select Date:
            </label>
            <Input
              id="date-selector"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              disabled={isLoading}
              className="w-auto"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {savedDates && savedDates.length > 0 && (
              <span className="text-sm text-muted-foreground">
                ({savedDates.length} saved date{savedDates.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="container mx-auto px-4 pb-3">
            <div className="text-sm text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950 px-3 py-2 rounded-md">
              Successfully saved!
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {saveError && (
          <div className="container mx-auto px-4 pb-3">
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              Failed to save: {saveError instanceof Error ? saveError.message : String(saveError)}
            </div>
          </div>
        )}
      </header>

      {/* Print-only header */}
      <div className="hidden print:block print-header">
        <h1 className="text-xl font-bold text-center">Stock Calculation Sheet</h1>
        <p className="text-center text-xs mt-1">
          {formattedDate}
        </p>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Wrapper for print grid layout */}
        <div className="print-content-wrapper">
          <div className="print-sections-grid">
            {/* Opening Stock Section */}
            <div className="print-section-item">
              <SectionCard
                title="Opening Stock"
                total={formatNumber(totals.opening)}
                totalLabel="Total Opening Stock"
              >
                <EditableSheetTable
                  ref={openingStockRef}
                  rows={openingStock}
                  onChange={setOpeningStock}
                  columns={[
                    { key: 'name', label: 'Item Name', type: 'text' },
                    { key: 'quantity', label: 'Weight / Quantity', type: 'number' },
                  ]}
                />
              </SectionCard>
            </div>

            {/* Purchase Section */}
            <div className="print-section-item">
              <SectionCard
                title="Purchase"
                total={formatNumber(totals.purchase)}
                totalLabel="Total Purchase"
              >
                <EditableSheetTable
                  ref={purchaseRef}
                  rows={purchase}
                  onChange={setPurchase}
                  columns={[
                    { key: 'name', label: 'Party Name', type: 'text' },
                    { key: 'quantity', label: 'Quantity', type: 'number' },
                  ]}
                />
              </SectionCard>
            </div>

            {/* Sales Section */}
            <div className="print-section-item">
              <SectionCard
                title="Sales"
                total={formatNumber(totals.sales)}
                totalLabel="Total Sales"
              >
                <EditableSheetTable
                  ref={salesRef}
                  rows={sales}
                  onChange={setSales}
                  columns={[
                    { key: 'name', label: 'Party Name', type: 'text' },
                    { key: 'quantity', label: 'Quantity', type: 'number' },
                  ]}
                />
              </SectionCard>
            </div>

            {/* Suspense Section */}
            <div className="print-section-item">
              <SectionCard
                title="Suspense"
                total={formatNumber(totals.suspense)}
                totalLabel="Total Suspense"
              >
                <EditableSheetTable
                  ref={suspenseRef}
                  rows={suspense}
                  onChange={setSuspense}
                  columns={[
                    { key: 'name', label: 'Party Name', type: 'text' },
                    { key: 'quantity', label: 'Quantity', type: 'number' },
                  ]}
                />
              </SectionCard>
            </div>
          </div>

          {/* Final Calculation */}
          <div className="print-final-calc">
            <FinalCalculation totals={totals} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto print:hidden">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
