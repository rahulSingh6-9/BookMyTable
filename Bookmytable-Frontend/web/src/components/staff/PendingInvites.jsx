import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, Clock, ShieldAlert } from "lucide-react";

export function PendingInvites({ invites }) {
  if (!invites || invites.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-border/40">
      <div className="flex items-center gap-2 px-1">
        <Clock className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-foreground">Pending Invitations</h3>
        <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 px-1.5 h-4 text-[9px] uppercase font-bold">
          {invites.length} Waiting
        </Badge>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50/20 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50/40 hover:bg-amber-50/40 border-amber-100">
              <TableHead className="text-amber-800/70 font-bold text-[10px] uppercase tracking-wider">Email Address</TableHead>
              <TableHead className="text-amber-800/70 font-bold text-[10px] uppercase tracking-wider">Assigned Role</TableHead>
              <TableHead className="text-amber-800/70 font-bold text-[10px] uppercase tracking-wider">Sent At</TableHead>
              <TableHead className="text-amber-800/70 font-bold text-[10px] uppercase tracking-wider text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite._id} className="hover:bg-amber-100/30 border-amber-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2 text-amber-900/80 font-medium text-sm">
                    <Mail className="w-3.5 h-3.5 opacity-50" />
                    {invite.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[10px] font-bold bg-white border-amber-200 text-amber-700 h-5 px-2">
                    {invite.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-amber-800/60 text-xs">
                  {format(new Date(invite.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant={invite.status === 'expired' ? 'destructive' : 'secondary'} 
                    className={`capitalize text-[9px] px-1.5 h-4 font-bold ${invite.status === 'pending' ? 'bg-amber-200/50 text-amber-700 border-amber-300' : ''}`}
                  >
                    {invite.status === 'pending' ? 'Pending Acceptance' : invite.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-[10px] text-muted-foreground italic pl-1 flex items-center gap-1.5">
        <ShieldAlert className="w-3 h-3" />
        Note: Invitations expire after 48 hours for security.
      </p>
    </div>
  );
}
