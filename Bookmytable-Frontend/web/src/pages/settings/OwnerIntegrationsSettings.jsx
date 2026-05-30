import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Blocks } from "lucide-react";

export default function OwnerIntegrationsSettings() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Connect your tools and services.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Blocks className="h-5 w-5" />
            Connected Apps
          </CardTitle>
          <CardDescription>
            Manage third-party integrations and webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            Integrations configuration will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
