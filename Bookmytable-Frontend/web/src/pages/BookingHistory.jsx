import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BookingTable } from "@/components/dashboard/BookingTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { getUserBookings } from "@/services/booking.service";

export default function BookingHistory() {
  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ["user-bookings-history"],
    queryFn: getUserBookings,
  });

  const bookings = bookingsRes?.data?.data || [];

  const upcomingList = useMemo(() => bookings.filter(b => b.status === "confirmed"), [bookings]);
  const completedList = useMemo(() => bookings.filter(b => b.status === "completed"), [bookings]);
  const cancelledList = useMemo(() => bookings.filter(b => ["cancelled", "expired", "payment_failed"].includes(b.status)), [bookings]);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Booking History</h1>
          <p className="mb-6 text-muted-foreground">View and manage your past and upcoming reservations</p>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  All <Badge variant="secondary" className="ml-1.5 text-xs">{bookings.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming <Badge variant="secondary" className="ml-1.5 text-xs">{upcomingList.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed <Badge variant="secondary" className="ml-1.5 text-xs">{completedList.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled <Badge variant="secondary" className="ml-1.5 text-xs">{cancelledList.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all"><BookingTable bookings={bookings} /></TabsContent>
              <TabsContent value="upcoming"><BookingTable bookings={upcomingList} /></TabsContent>
              <TabsContent value="completed"><BookingTable bookings={completedList} /></TabsContent>
              <TabsContent value="cancelled"><BookingTable bookings={cancelledList} /></TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </div>
  );
}
