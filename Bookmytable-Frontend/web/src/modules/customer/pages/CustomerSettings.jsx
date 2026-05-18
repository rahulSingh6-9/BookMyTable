import React from "react";
import { Outlet } from "react-router-dom";
import { Settings } from "lucide-react";

export default function CustomerSettings() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12">
      {/* Workspace Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary animate-[spin_4s_linear_infinite]" />
          Workspace Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Configure security credentials, verification channels, and access statuses.</p>
      </div>

      {/* Content Canvas for Nested Active Route */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-8 shadow-sm min-h-[420px]">
        <Outlet />
      </div>
    </div>
  );
}
