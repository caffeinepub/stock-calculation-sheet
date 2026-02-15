import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatNumber } from '../utils/numberFormat';

interface FinalCalculationProps {
  totals: {
    opening: number;
    purchase: number;
    sales: number;
    suspense: number;
    closing: number;
  };
}

export default function FinalCalculation({ totals }: FinalCalculationProps) {
  return (
    <Card>
      <CardHeader className="bg-accent/30">
        <CardTitle className="text-lg font-semibold text-foreground">
          Final Calculation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium text-foreground">Opening Stock:</span>
            <span className="font-mono text-foreground">{formatNumber(totals.opening)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium text-foreground">Purchase:</span>
            <span className="font-mono text-foreground">{formatNumber(totals.purchase)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium text-foreground">Sales:</span>
            <span className="font-mono text-foreground">{formatNumber(totals.sales)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium text-foreground">Suspense:</span>
            <span className="font-mono text-foreground">{formatNumber(totals.suspense)}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-accent/20 px-4 -mx-4 rounded-md mt-4">
            <span className="font-semibold text-lg text-foreground">Closing Stock:</span>
            <span className="font-mono font-semibold text-lg text-foreground">
              {formatNumber(totals.closing)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
