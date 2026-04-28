import { motion } from "framer-motion";
import { Users, Store, CalendarCheck, DollarSign } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const bookingData = [
  { name: 'Mon', bookings: 120 },
  { name: 'Tue', bookings: 132 },
  { name: 'Wed', bookings: 101 },
  { name: 'Thu', bookings: 150 },
  { name: 'Fri', bookings: 190 },
  { name: 'Sat', bookings: 250 },
  { name: 'Sun', bookings: 210 },
];

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 5890 },
  { name: 'Sat', revenue: 9390 },
  { name: 'Sun', revenue: 7490 },
];

const recentActivity = [
  { id: 1, text: "New restaurant 'The Spice Lounge' joined.", time: "10 mins ago" },
  { id: 2, text: "Table booked for 4 at 'Pasta Palace'.", time: "25 mins ago" },
  { id: 3, text: "Payment of $450 received from 'Steakhouse'.", time: "1 hour ago" },
  { id: 4, text: "New review posted for 'Vegan Bites'.", time: "2 hours ago" },
  { id: 5, text: "System maintenance scheduled.", time: "3 hours ago" },
];

export default function AdminPanel() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in pb-10">
      <PageHeader 
        title="Dashboard Overview" 
        description="Here is your platform's summary and key insights." 
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Total Users" value="15,234" trend="up" trendValue={12} icon={Users} />
        <StatCard title="Total Restaurants" value="342" trend="up" trendValue={8} icon={Store} />
        <StatCard title="Total Bookings" value="14,247" trend="up" trendValue={18} icon={CalendarCheck} />
        <StatCard title="Revenue" value="$248,200" trend="up" trendValue={15} icon={DollarSign} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border/40 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bookingData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dx={-10} />
                    <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.1}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)'}} />
                    <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: 'hsl(var(--primary))'}} activeDot={{r: 6, strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border/40 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dx={-10} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.2}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)'}} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="rounded-2xl border-border/40 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.text}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
