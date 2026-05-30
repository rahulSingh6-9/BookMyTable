import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

export default function OwnerRolesAccessSettings() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles & Access</h1>
          <p className="text-muted-foreground">Manage roles and permissions for your team.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Access Control
          </CardTitle>
          <CardDescription>
            Configure what different roles can access in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            Roles and access management will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
