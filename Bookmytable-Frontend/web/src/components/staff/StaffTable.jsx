import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, UserX, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const roleColors = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  manager: "bg-blue-100 text-blue-700 border-blue-200",
  waiter: "bg-emerald-100 text-emerald-700 border-emerald-200",
  receptionist: "bg-amber-100 text-amber-700 border-amber-200",
};

export function StaffTable({ staff, onEdit, onDeactivate, canManageStaff, canEditPermissions }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[250px]">Name / Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(staff || []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            (staff || []).map((member) => (
              <TableRow key={member._id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{member.name || "N/A"}</span>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize font-medium ${roleColors[member.role] || ""}`}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-wrap gap-1 cursor-help max-w-[200px]">
                          {(member.permissions || []).slice(0, 2).map((p) => (
                            <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                              {p.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {(member.permissions || []).length > 2 && (
                            <span className="text-[10px] text-muted-foreground">+{(member.permissions || []).length - 2} more</span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="p-3 rounded-xl shadow-xl border-border/40 bg-card">
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold border-b pb-1 mb-1">All Permissions</p>
                          {(member.permissions || []).map(p => (
                            <div key={p} className="text-[10px] capitalize text-muted-foreground">• {p.replace(/_/g, ' ')}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={member.status === 'active' ? 'success' : 'secondary'} 
                    className={`capitalize text-[10px] ${member.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}`}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {(canManageStaff || canEditPermissions) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/50">
                        <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onEdit(member)} 
                          className="cursor-pointer"
                          disabled={!canEditPermissions}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeactivate(member)} 
                          className={`cursor-pointer ${member.status === 'active' ? 'text-destructive focus:text-destructive' : 'text-emerald-600 focus:text-emerald-600'}`}
                          disabled={!canManageStaff}
                        >
                          {member.status === 'active' ? (
                            <><UserX className="mr-2 h-4 w-4" /> Deactivate Staff</>
                          ) : (
                            <><UserCheck className="mr-2 h-4 w-4" /> Activate Staff</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
