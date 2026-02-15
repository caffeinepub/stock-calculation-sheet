import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SectionCardProps {
  title: string;
  total: string;
  totalLabel: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, total, totalLabel, children }: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="bg-accent/30">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {children}
        <div className="border-t bg-muted/30 px-4 py-3 flex justify-between items-center font-medium">
          <span className="text-foreground">{totalLabel}</span>
          <span className="text-foreground font-semibold">{total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
