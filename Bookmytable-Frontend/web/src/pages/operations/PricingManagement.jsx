import React, { useState } from "react";
import { useBranch } from "@/context/BranchContext";
import { usePricingConfig, useUpdatePricingConfig, useDeletePricingConfig } from "@/hooks/usePricing";
import { PasswordValidationModal } from "@/components/common/PasswordValidationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TABLE_TYPES } from "@/lib/mockData";
import { FLOOR_OPTIONS, SECTION_OPTIONS } from "@/lib/tableConstants";
import { Loader2, Plus, Save, Settings, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function PricingManagement() {
  const { activeBranchId } = useBranch();
  const { data: pricingConfigs = [], isLoading } = usePricingConfig(activeBranchId);
  const { mutate: updatePricing, isPending: isUpdating } = useUpdatePricingConfig(activeBranchId);
  const { mutate: deletePricing, isPending: isDeleting } = useDeletePricingConfig(activeBranchId);

  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordAction, setPasswordAction] = useState(null); // 'UPDATE' or 'DELETE'
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [form, setForm] = useState({
    floor: "",
    diningAreaType: "",
    sectionType: "",
    price: ""
  });

  const handlePriceSave = (configData) => {
    if (!configData.floor || !configData.diningAreaType || !configData.sectionType || configData.price === "") {
      toast.error("Please fill in all fields");
      return;
    }
    setPendingUpdate(configData);
    setPasswordAction('UPDATE');
    setPasswordModalOpen(true);
  };

  const handlePriceDelete = (pricingId) => {
    setPendingDelete(pricingId);
    setPasswordAction('DELETE');
    setPasswordModalOpen(true);
  };

  const handlePriceEdit = (configData) => {
    setForm({
      floor: configData.floor,
      diningAreaType: configData.diningAreaType,
      sectionType: configData.sectionType,
      price: configData.price
    });
  };

  const handlePasswordSuccess = (password) => {
    if (passwordAction === 'UPDATE' && pendingUpdate) {
      updatePricing(
        { ...pendingUpdate, password },
        {
          onSuccess: () => {
            setForm({ floor: "", diningAreaType: "", sectionType: "", price: "" });
            setPendingUpdate(null);
            setPasswordAction(null);
          }
        }
      );
    } else if (passwordAction === 'DELETE' && pendingDelete) {
      deletePricing(
        { pricingId: pendingDelete, password },
        {
          onSuccess: () => {
            setPendingDelete(null);
            setPasswordAction(null);
          }
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dining Area Pricing</h1>
          <p className="text-muted-foreground mt-2">
            Configure strict pricing rules per floor, dining area, and section.
          </p>
        </div>
        <Settings className="w-8 h-8 text-primary/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Add New Pricing */}
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add / Update Pricing
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Floor</Label>
                <Select value={form.floor} onValueChange={(val) => setForm({ ...form, floor: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOOR_OPTIONS.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dining Area Type</Label>
                <Select value={form.diningAreaType} onValueChange={(val) => setForm({ ...form, diningAreaType: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    {TABLE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={form.sectionType} onValueChange={(val) => setForm({ ...form, sectionType: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 500" 
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={() => handlePriceSave(form)}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Pricing Rule
            </Button>
          </div>
        </div>

        {/* Right Col: Existing Pricing List */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-muted/20 border-b">
            <h2 className="text-lg font-bold">Active Pricing Rules</h2>
          </div>
          <div className="p-0 overflow-y-auto max-h-[500px]">
            {pricingConfigs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No pricing rules configured yet.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-xs uppercase font-semibold text-muted-foreground sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-3">Floor</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Section</th>
                    <th className="px-6 py-3 text-right">Price</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pricingConfigs.map((config) => (
                    <tr key={config._id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium capitalize">{config.floor.replace('_', ' ')}</td>
                      <td className="px-6 py-4">{TABLE_TYPES.find(t => t.value === config.diningAreaType)?.label || config.diningAreaType}</td>
                      <td className="px-6 py-4 capitalize">{config.sectionType.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{config.price}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handlePriceEdit(config)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={() => handlePriceDelete(config._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <PasswordValidationModal 
        open={isPasswordModalOpen} 
        onOpenChange={setPasswordModalOpen}
        onSuccess={handlePasswordSuccess}
        actionDescription={
          passwordAction === 'DELETE'
            ? "Please enter your password to delete this pricing rule. This action cannot be undone."
            : "Please enter your password to save changes to the pricing rules. This action requires administrative verification."
        }
      />
    </div>
  );
}
