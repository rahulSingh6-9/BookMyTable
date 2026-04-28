import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/lib/data";
import { Badge } from "@/components/ui/badge";



export default function UploadMenu() {
  const [items] = useState(menuItems);

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
              <p className="text-muted-foreground">Add, edit, and organize your restaurant menu</p>
            </div>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-card">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-card-foreground">{item.name}</h3>
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="font-semibold text-foreground">${item.price}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
