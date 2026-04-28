import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorMessage({ title = "Something went wrong", message = "Please try again later.", onRetry }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">Try Again</Button>
      )}
    </div>
  );
}
