import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function ReportsAbuse() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in">
      <PageHeader
        title="Reports & Abuse"
        description="Monitor and manage user reports, abuse flags, and content violations."
      />

      <div className="grid gap-6">
        <Card className="rounded-2xl border-border/40 shadow-sm bg-card/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Active Reports</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              The platform is currently free of pending abuse reports or content violations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
