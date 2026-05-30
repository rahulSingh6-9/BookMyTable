import { useState, useMemo } from "react";
import { useBranch } from "@/context/BranchContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  ChevronsUpDown, 
  Search, 
  Settings, 
  ChevronRight,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";

export const BranchSwitcher = ({ className, collapsed = false }) => {
  const { memberships, activeBranch, activeBranchId, switchBranch } = useBranch();
  const [open, setOpen] = useState(false);
   console.log(activeBranch);

  const activeMembership = useMemo(() => 
    memberships.find(m => m.branch._id === activeBranchId),
    [memberships, activeBranchId]
  );

  if (memberships.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto border-border/60 hover:bg-muted/50 transition-all rounded-xl shadow-sm",
            collapsed ? "justify-center p-1 w-8 h-8" : "justify-between p-2 flex-1 min-w-0",
            className
          )}
        >
          <div className="flex items-center gap-3 min-w-0 w-full justify-center">
            <Avatar className={cn("rounded-lg border border-border/50 shrink-0", collapsed ? "h-6 w-6" : "h-9 w-9")}>
              <AvatarImage src={activeBranch?.logo} alt={activeBranch?.branchName} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                <Store className={cn(collapsed ? "h-3 w-3" : "h-5 w-5")} />
              </AvatarFallback>
            </Avatar>
            
            {!collapsed && (
              <div className="flex flex-col items-start text-left min-w-0">
                <span className="text-sm font-bold text-foreground truncate w-full">
                  {activeBranch?.branchName}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize font-medium">
                  {activeMembership?.role?.replace("_", " ") || "Member"}
                </span>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[280px] p-0 rounded-2xl overflow-hidden border-border/80 shadow-2xl" 
        align="start"
        side="right"
        sideOffset={12}
      >
        <Command className="bg-popover">
          <CommandInput 
            placeholder="Search for a branch..." 
            className="h-11 text-sm"
          />
          
          <div className="p-2 pb-0">
            <p className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Your accessible branches
            </p>
          </div>

          <CommandList className="max-h-[300px] p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No branch found.
            </CommandEmpty>
            <CommandGroup>
              {memberships.map((m) => {
                const isActive = activeBranchId === m.branch._id;
                return (
                  <CommandItem
                    key={m.branch._id}
                    value={m.branch.branchName}
                    onSelect={() => {
                      switchBranch(m.branch._id);
                      setOpen(false);
                    }}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Avatar className="h-8 w-8 rounded-lg border shrink-0 border-border/50">
                      <AvatarImage src={m.branch.logo} alt={m.branch.branchName} />
                      <AvatarFallback className={cn(
                        "rounded-lg text-xs font-bold",
                        isActive ? "bg-background text-foreground shadow-sm" : "bg-primary/10 text-primary group-hover:bg-background group-hover:text-foreground group-hover:shadow-sm"
                      )}>
                        {m.branch?.branchName?.charAt(0) || "B"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold truncate">
                        {m.branch?.branchName || "Unnamed Branch"}
                      </span>
                      <span className={cn(
                        "text-[10px] capitalize font-medium opacity-90",
                        isActive ? "text-muted-foreground" : "text-muted-foreground"
                      )}>
                        {m.role?.replace("_", " ") || "Member"}
                      </span>
                    </div>

                    {isActive && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          <div className="border-t border-border mt-1 p-1">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer text-sm font-semibold group">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center">
                    <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                 </div>
                 <span className="text-foreground">Manage Branches</span>
               </div>
               <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
