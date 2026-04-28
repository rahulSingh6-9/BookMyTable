import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";

export default function ManageBookings() {
  const dummyData = [
    { id: "BKG-001", user: "John Doe", restaurant: "Pasta Palace", date: "2023-10-15", time: "19:00", status: "Confirm" },
    { id: "BKG-002", user: "Jane Smith", restaurant: "Steakhouse 99", date: "2023-10-16", time: "20:00", status: "Pending" },
    { id: "BKG-003", user: "Alice Johnson", restaurant: "Vegan Bites", date: "2023-10-16", time: "12:30", status: "Cancelled" },
  ];

  const columns = [
    { header: "Booking ID", accessorKey: "id" },
    { header: "User", accessorKey: "user" },
    { header: "Restaurant", accessorKey: "restaurant" },
    { header: "Date", accessorKey: "date" },
    { header: "Time", accessorKey: "time" },
    { 
      header: "Status", 
      accessorKey: "status",
      cell: (row) => (
        <Badge variant={row.status === 'Confirm' ? 'default' : row.status === 'Pending' ? 'secondary' : 'destructive'}>
          {row.status}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animation-fade-in">
      <PageHeader title="Bookings Management" description="View and manage all table reservations across restaurants." />
      <DataTable columns={columns} data={dummyData} filterOptions={[{label: 'Confirm', value: 'Confirm'}, {label: 'Pending', value: 'Pending'}, {label: 'Cancelled', value: 'Cancelled'}]} />
    </div>
  );
}
