import { useEffect, useMemo } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { format, subDays, parseISO, isValid } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Users,
  DollarSign,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranch } from "@/context/BranchContext";
import { useTables } from "@/hooks/useTables";
import { getRestaurantBookings } from "@/services/booking.service";
import {
  socket,
  joinRestaurantRoom,
  leaveRestaurantRoom,
} from "@/services/socket";

// ─── Helpers ────────────────────────────────────────────────────────────────

const today = format(new Date(), "yyyy-MM-dd");
const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const pct = (a, b) => {
  if (!b || b === 0) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 100);
};

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const STATUS_COLORS = {
  confirmed: "#22c55e",
  completed: "#6b7280",
  pending: "#f59e0b",
  payment_pending: "#f59e0b",
  cancelled: "#ef4444",
  expired: "#6b7280",
  no_show: "#f97316",
  payment_failed: "#ef4444",
};

const STATUS_LABELS = {
  confirmed: "Confirmed",
  completed: "Completed",
  pending: "Pending",
  payment_pending: "Payment Pending",
  cancelled: "Cancelled",
  expired: "Expired",
  no_show: "No Show",
  payment_failed: "Payment Failed",
};

const TABLE_STATUS_DOT = {
  available: "#22c55e",
  reserved: "#ef4444",
  occupied: "#ef4444",
  maintenance: "#f59e0b",
  inactive: "#9ca3af",
};

const SECTION_COLORS = [
  "hsl(var(--primary))",
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, delta, loading, prefix }) {
  const isUp = delta > 0;
  const isDown = delta < 0;

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {label}
              </span>
              <span className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground">
              {prefix}
              {value}
            </span>
            <div className="flex items-center gap-1 text-xs">
              {isUp ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : isDown ? (
                <TrendingDown className="w-3 h-3 text-destructive" />
              ) : (
                <Minus className="w-3 h-3 text-muted-foreground" />
              )}
              <span
                className={
                  isUp
                    ? "text-green-500"
                    : isDown
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {delta > 0 ? "+" : ""}
                {delta}% vs yesterday
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingRow({ booking, index }) {
  const name =
    booking.userId?.name ||
    booking.userId?.email?.split("@")[0] ||
    "Guest";
  const status = booking.status || "pending";
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start justify-between gap-2 py-3 border-b border-border last:border-0"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {booking.time} · {booking.guests} guests
          {booking.tableName ? ` · ${booking.tableName}` : ""}
        </p>
      </div>
      <Badge
        variant="outline"
        style={{
          borderColor: STATUS_COLORS[status] + "66",
          color: STATUS_COLORS[status],
          backgroundColor: STATUS_COLORS[status] + "15",
          fontSize: "0.65rem",
          padding: "2px 6px",
          whiteSpace: "nowrap",
        }}
      >
        {STATUS_LABELS[status] || status}
      </Badge>
    </motion.div>
  );
}

function TableDot({ status }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: TABLE_STATUS_DOT[status] || "#9ca3af" }}
    />
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} bookings</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  const { activeBranchId, activeBranch } = useBranch();
  const queryClient = useQueryClient();
  const branchName = activeBranch?.branchName || "Your Restaurant";

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const {
    data: todayBookingsRaw,
    isLoading: loadingToday,
  } = useQuery({
    queryKey: ["bookings", activeBranchId, "today"],
    queryFn: () => getRestaurantBookings(activeBranchId, { date: today }),
    enabled: !!activeBranchId,
    staleTime: 30_000,
  });

  const {
    data: yesterdayBookingsRaw,
    isLoading: loadingYesterday,
  } = useQuery({
    queryKey: ["bookings", activeBranchId, "yesterday"],
    queryFn: () => getRestaurantBookings(activeBranchId, { date: yesterday }),
    enabled: !!activeBranchId,
    staleTime: 60_000,
  });

  const {
    data: weekBookingsRaw,
    isLoading: loadingWeek,
  } = useQuery({
    queryKey: ["bookings", activeBranchId, "week"],
    queryFn: () => getRestaurantBookings(activeBranchId, {}),
    enabled: !!activeBranchId,
    staleTime: 60_000,
  });

  const { tables = [], isLoading: loadingTables } = useTables(activeBranchId);

  // ── Socket real-time updates ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeBranchId) return;
    joinRestaurantRoom(activeBranchId);

    const invalidate = () => {
      queryClient.invalidateQueries(["bookings", activeBranchId]);
    };

    socket.on("table:availability_changed", invalidate);
    socket.on("booking:confirmed", invalidate);
    socket.on("booking:created", invalidate);
    socket.on("booking:cancelled", invalidate);

    return () => {
      leaveRestaurantRoom(activeBranchId);
      socket.off("table:availability_changed", invalidate);
      socket.off("booking:confirmed", invalidate);
      socket.off("booking:created", invalidate);
      socket.off("booking:cancelled", invalidate);
    };
  }, [activeBranchId, queryClient]);

  // ── Computed Values ────────────────────────────────────────────────────────
  const normalizeBookings = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.data?.data)) return raw.data.data;
    if (Array.isArray(raw.bookings)) return raw.bookings;
    if (Array.isArray(raw.data?.bookings)) return raw.data.bookings;
    return [];
  };

  const todayBookings = useMemo(() => normalizeBookings(todayBookingsRaw), [todayBookingsRaw]);
  const yesterdayBookings = useMemo(() => normalizeBookings(yesterdayBookingsRaw), [yesterdayBookingsRaw]);
  const weekBookings = useMemo(() => normalizeBookings(weekBookingsRaw), [weekBookingsRaw]);

  // KPIs today
  const totalBookingsToday = todayBookings.length;
  const totalGuestsToday = todayBookings.reduce((s, b) => s + (b.guests || 0), 0);
  const revenueToday = todayBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + (b.grandTotal || 0), 0);

  // KPIs yesterday
  const totalBookingsYesterday = yesterdayBookings.length;
  const totalGuestsYesterday = yesterdayBookings.reduce((s, b) => s + (b.guests || 0), 0);
  const revenueYesterday = yesterdayBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + (b.grandTotal || 0), 0);

  // Table occupancy
  const totalTables = tables.length;
  const occupiedTables = tables.filter(
    (t) => t.status === "occupied" || t.status === "reserved"
  ).length;
  const occupancyPct = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  // Last 7 days bar chart
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      const label = format(subDays(new Date(), i), "EEE");
      const count = weekBookings.filter((b) => b.date === d).length;
      days.push({ day: label, bookings: count });
    }
    return days;
  }, [weekBookings]);

  // Bookings by section (donut)
  const bySection = useMemo(() => {
    const map = {};
    todayBookings.forEach((b) => {
      const key = b.sectionLabel || b.floorLabel || "Other";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [todayBookings]);

  // Peak hours
  const peakHours = useMemo(() => {
    const map = {};
    todayBookings.forEach((b) => {
      if (!b.time) return;
      const hr = b.time.split(":")[0];
      const label = `${hr}:00`;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hour, bookings]) => ({ hour, bookings }));
  }, [todayBookings]);

  // Tables grouped by floor
  const tablesByFloor = useMemo(() => {
    const map = {};
    tables.forEach((t) => {
      const fl = t.floorLabel || "Floor 1";
      if (!map[fl]) map[fl] = [];
      map[fl].push(t);
    });
    return map;
  }, [tables]);

  // Recent bookings (last 5 today sorted by time desc)
  const recentBookings = useMemo(() => {
    return [...todayBookings]
      .sort((a, b) => (b.time || "").localeCompare(a.time || ""))
      .slice(0, 8);
  }, [todayBookings]);

  const kpiLoading = loadingToday || loadingYesterday;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {branchName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Main layout: left (70%) + sidebar (30%) */}
      <div className="flex gap-6 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              icon={CalendarDays}
              label="Total Bookings"
              value={totalBookingsToday}
              delta={pct(totalBookingsToday, totalBookingsYesterday)}
              loading={kpiLoading}
            />
            <KPICard
              icon={Users}
              label="Total Guests"
              value={totalGuestsToday}
              delta={pct(totalGuestsToday, totalGuestsYesterday)}
              loading={kpiLoading}
            />
            <KPICard
              icon={DollarSign}
              label="Revenue Today"
              value={fmt(revenueToday)}
              delta={pct(revenueToday, revenueYesterday)}
              loading={kpiLoading}
            />
            <KPICard
              icon={LayoutGrid}
              label="Table Occupancy"
              value={`${occupancyPct}%`}
              delta={0}
              loading={loadingTables}
            />
          </div>

          {/* Row 2: Bookings Overview + By Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Bar chart — last 7 days */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Bookings Overview
                </CardTitle>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingWeek ? (
                  <Skeleton className="h-48 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={last7Days}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="bookings"
                        name="Bookings"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Donut chart — by section */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  By Section
                </CardTitle>
                <p className="text-xs text-muted-foreground">Today's bookings</p>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingToday ? (
                  <Skeleton className="h-48 w-full" />
                ) : bySection.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                    No bookings yet today
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={bySection}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        {bySection.map((_, i) => (
                          <Cell
                            key={i}
                            fill={SECTION_COLORS[i % SECTION_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        iconSize={8}
                        wrapperStyle={{ fontSize: "10px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Table Status + Peak Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Table Status Grid */}
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Table Status
                </CardTitle>
                <p className="text-xs text-muted-foreground">Live floor view</p>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingTables ? (
                  <Skeleton className="h-40 w-full" />
                ) : tables.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4">
                    No tables configured.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(tablesByFloor).map(([floor, floorTables]) => (
                      <div key={floor}>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {floor}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {floorTables.map((t) => (
                            <div
                              key={t._id || t.tableCode}
                              className="flex items-center gap-1.5 border border-border rounded-md px-2 py-1 bg-muted/30 text-xs"
                              title={`${t.tableCode} · ${t.status}`}
                            >
                              <TableDot status={t.status} />
                              <span className="text-foreground font-medium">
                                {t.tableCode}
                              </span>
                              <span className="text-muted-foreground">
                                ({t.capacity})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 pt-1 border-t border-border">
                      {[
                        { color: "#22c55e", label: "Available" },
                        { color: "#ef4444", label: "Reserved/Occupied" },
                        { color: "#f59e0b", label: "Maintenance" },
                        { color: "#9ca3af", label: "Inactive" },
                      ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: color }}
                          />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Peak Hours
                </CardTitle>
                <p className="text-xs text-muted-foreground">Today's distribution</p>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingToday ? (
                  <Skeleton className="h-40 w-full" />
                ) : peakHours.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
                    No data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={peakHours}
                      margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="bookings"
                        name="Bookings"
                        fill="#22c55e"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Recent Bookings
              </CardTitle>
              <p className="text-xs text-muted-foreground">Today · Latest first</p>
            </CardHeader>
            <CardContent className="pt-0">
              {loadingToday ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No bookings today yet.
                </p>
              ) : (
                <div>
                  {recentBookings.map((b, i) => (
                    <BookingRow key={b._id || i} booking={b} index={i} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
