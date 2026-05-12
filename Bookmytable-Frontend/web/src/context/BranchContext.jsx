import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getMyMemberships } from "../services/membership.service";
import { ROLE_PERMISSIONS } from "../config/roles";
import { useAuth } from "./AuthContext";
import apiClient from "../lib/api";

const BranchContext = createContext();

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within BranchProvider");
  }
  return context;
};

export const BranchProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(() => {
    const stored = localStorage.getItem("activeBranchId");
    if (stored && stored !== "undefined" && stored !== "null") {
      apiClient.defaults.headers.common["x-branch-id"] = stored;
      return stored;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch memberships when logged in
  useEffect(() => {
    const fetchMemberships = async () => {
      if (!isLoggedIn) {
        setMemberships([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log("[BranchContext] Fetching memberships for user:", user?.id || user?._id);
        const response = await getMyMemberships();
        const data = response.data.data; // Array of memberships
        console.log("[BranchContext] Memberships fetched:", data.length);
        setMemberships(data);

        // Auto-select first branch if none selected OR if current selected is invalid
        const isValidSelection = data.some(m => m.branch?._id === activeBranchId);
        console.log("[BranchContext] Current activeBranchId:", activeBranchId, "isValid:", isValidSelection);
        
        if (data.length > 0 && (!activeBranchId || !isValidSelection)) {
          console.log("[BranchContext] Auto-selecting first branch:", data[0].branch._id);
          switchBranch(data[0].branch._id);
        }
      } catch (error) {
        console.error("[BranchContext] Failed to fetch memberships:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberships();
  }, [isLoggedIn]);

  // 2. Derive active context
  const activeMembership = useMemo(() => {
    return memberships.find((m) => m.branch?._id === activeBranchId);
  }, [memberships, activeBranchId]);

  const activeRole = activeMembership?.role || null;

  const permissions = useMemo(() => {
    return activeMembership?.permissions || [];
  }, [activeMembership]);

  // 3. Helpers
  const switchBranch = (branchId) => {
    if (!branchId || branchId === "undefined") return;
    
    setActiveBranchId(branchId);
    localStorage.setItem("activeBranchId", branchId);
    
    // 🔥 Inject into API client headers for all future requests
    apiClient.defaults.headers.common["x-branch-id"] = branchId;
  };

  const hasPermission = (permission) => {
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const value = {
    memberships,
    activeBranch: activeMembership?.branch || null,
    activeBranchId,
    activeMembership,
    activeRole,
    permissions,
    isLoading,
    switchBranch,
    hasPermission,
    refreshMemberships: async () => {
       const response = await getMyMemberships();
       setMemberships(response.data.data);
    }
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};
