import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

export default function SupportIssues() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in">
      <PageHeader
        title="Support & Issues"
        description="Manage customer support tickets, complaints, and system issues."
      />

      <div className="grid gap-6">
        <Card className="rounded-2xl border-border/40 shadow-sm bg-card/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <LifeBuoy className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Support Tickets</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Your support queue is currently empty.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
