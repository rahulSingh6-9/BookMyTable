import { motion } from "framer-motion";
import { CalendarDays, Users, DollarSign, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const growth = [
  { month: "Jan", users: 1200 }, { month: "Feb", users: 1800 }, { month: "Mar", users: 2400 },
  { month: "Apr", users: 3100 }, { month: "May", users: 4200 }, { month: "Jun", users: 5100 },
];

const topRestaurants = [
  { name: "Pasta Palace", bookings: 850 },
  { name: "Steakhouse 99", bookings: 710 },
  { name: "Vegan Bites", bookings: 640 },
  { name: "The Spice Lounge", bookings: 530 },
  { name: "Sushi Master", bookings: 490 },
];

const peakTimes = [
  { time: "11:00", volume: 20 },
  { time: "13:00", volume: 150 },
  { time: "15:00", volume: 40 },
  { time: "17:00", volume: 80 },
  { time: "19:00", volume: 280 },
  { time: "21:00", volume: 190 },
  { time: "23:00", volume: 30 },
];

export default function PlatformAnalytics() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in pb-10">
      <PageHeader 
        title="Platform Analytics" 
        description="Detailed insights into platform performance and user engagement." 
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Total Revenue" value="$248K" trend="up" trendValue={22} icon={DollarSign} />
        <StatCard title="Active Users" value="5,100" trend="up" trendValue={18} icon={Users} />
        <StatCard title="Bookings/mo" value="12.4K" trend="up" trendValue={15} icon={CalendarDays} />
        <StatCard title="Growth Rate" value="18%" trend="up" trendValue={3} icon={TrendingUp} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border/40 shadow-sm bg-card h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">User Growth Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dx={-10} />
                    <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.1}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)'}} />
                    <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: 'hsl(var(--primary))'}} activeDot={{r: 6, strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border/40 shadow-sm bg-card h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Restaurants (Bookings)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRestaurants} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--foreground)', fontSize: 13, fontWeight: 500}} dx={-10} />
                    <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.2}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)'}} />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={24} />
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
            <CardTitle className="text-lg font-semibold">Peak Booking Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={peakTimes}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)', fontSize: 12}} dx={-10} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)'}} />
                  <Area type="monotone" dataKey="volume" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
