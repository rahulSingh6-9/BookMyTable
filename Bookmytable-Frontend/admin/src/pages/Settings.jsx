import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animation-fade-in pb-10">
      <PageHeader 
        title="Platform Settings" 
        description="Configure application preferences, fees, and feature toggles." 
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="rounded-2xl border-border/40 shadow-sm bg-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">General Settings</CardTitle>
              <CardDescription>Basic configuration for the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="BookMyTable" className="bg-background/50 rounded-lg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@bookmytable.com" className="bg-background/50 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger className="bg-background/50 rounded-lg">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission">Global Commission Rate (%)</Label>
                <div className="flex items-center gap-4">
                  <Input id="commission" type="number" defaultValue="10" className="w-32 bg-background/50 rounded-lg" />
                  <span className="text-sm text-muted-foreground">Applies to all new restaurants automatically.</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 px-6 py-4">
              <Button className="rounded-lg ml-auto px-6">Save Changes</Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/40 shadow-sm bg-card flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium text-foreground">User Reviews</Label>
                  <p className="text-sm text-muted-foreground">Allow users to review.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium text-foreground">Auto-Approve Restaurants</Label>
                  <p className="text-sm text-muted-foreground">Skip manual moderation.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium text-foreground">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Disable public access.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium text-foreground">Beta Features</Label>
                  <p className="text-sm text-muted-foreground">Enable experimental UI.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
