import { motion } from "framer-motion";
import { BookingTable } from "@/components/dashboard/BookingTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingHistory() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Booking History</h1>
          <p className="mb-6 text-muted-foreground">View and manage your past and upcoming reservations</p>

          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All <Badge variant="secondary" className="ml-1.5 text-xs">5</Badge></TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="all"><BookingTable /></TabsContent>
            <TabsContent value="upcoming"><BookingTable /></TabsContent>
            <TabsContent value="completed"><BookingTable /></TabsContent>
            <TabsContent value="cancelled"><BookingTable /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
