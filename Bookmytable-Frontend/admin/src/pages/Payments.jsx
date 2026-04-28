import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/shared/DataTable";
import { DollarSign, CreditCard, Activity, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Payments() {
  const dummyTransactions = [
    { id: "TXN-8291", restaurant: "Pasta Palace", amount: "$450.00", commission: "$45.00", date: "Oct 15, 2023", status: "Completed" },
    { id: "TXN-8292", restaurant: "Steakhouse 99", amount: "$890.00", commission: "$89.00", date: "Oct 15, 2023", status: "Completed" },
    { id: "TXN-8293", restaurant: "Vegan Bites", amount: "$120.00", commission: "$12.00", date: "Oct 14, 2023", status: "Pending" },
    { id: "TXN-8294", restaurant: "Sushi Master", amount: "$560.00", commission: "$56.00", date: "Oct 13, 2023", status: "Processing" },
    { id: "TXN-8295", restaurant: "The Spice Lounge", amount: "$230.00", commission: "$23.00", date: "Oct 12, 2023", status: "Failed" },
  ];

  const columns = [
    { header: "Transaction ID", accessorKey: "id", cell: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { header: "Restaurant", accessorKey: "restaurant", cell: (row) => <span className="font-medium text-foreground">{row.restaurant}</span> },
    { header: "Amount", accessorKey: "amount" },
    { header: "Commission Earned", accessorKey: "commission", cell: (row) => <span className="text-emerald-600 font-medium">{row.commission}</span> },
    { header: "Date", accessorKey: "date" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const variants = {
          "Completed": "default",
          "Pending": "secondary",
          "Processing": "outline",
          "Failed": "destructive"
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in pb-10">
      <PageHeader 
        title="Payments & Revenue" 
        description="Monitor system revenue, real-time transactions, and commission tracking." 
      />

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        <StatCard title="Total Revenue (All Time)" value="$3.2M" trend="up" trendValue={18} icon={DollarSign} />
        <StatCard title="Total Commission" value="$320K" trend="up" trendValue={24} icon={Activity} />
        <StatCard title="Processing Volume" value="$42,500" icon={CreditCard} />
        <StatCard title="Avg. Transaction" value="$185" trend="up" trendValue={4} icon={ArrowUpRight} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="rounded-2xl border-border/40 shadow-sm bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Commission Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/40 border border-border/40 rounded-xl overflow-hidden">
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-muted/10">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Standard Rate</span>
                <span className="text-4xl font-bold text-primary">10%</span>
                <span className="text-xs text-muted-foreground mt-2">Per successful booking</span>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-muted/10">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">This Month YTD</span>
                <span className="text-4xl font-bold text-foreground">$12,450</span>
                <span className="text-xs text-emerald-500 font-medium mt-2">+15% vs last month</span>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-muted/10">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Pending Payouts</span>
                <span className="text-4xl font-bold text-amber-500">$3,200</span>
                <span className="text-xs text-muted-foreground mt-2">To be cleared in 3-5 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
        <DataTable 
          columns={columns} 
          data={dummyTransactions} 
          filterOptions={[
            { label: 'Completed', value: 'Completed' }, 
            { label: 'Pending', value: 'Pending' },
            { label: 'Failed', value: 'Failed' }
          ]}
        />
      </motion.div>
    </div>
  );
}
