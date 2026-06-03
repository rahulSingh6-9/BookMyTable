import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useBrand } from "./BrandContext";
import apiClient from "../lib/api";

const BranchContext = createContext();

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within BranchProvider");
  }
  return context;
};

const slugify = (text) => {
  if (!text) return "branch";
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const BranchProvider = ({ children }) => {
  const { activeBrand, isLoading: brandLoading } = useBrand();

  const [activeBranchSlug, setActiveBranchSlug] = useState(() => {
    const stored = localStorage.getItem("activeBranchSlug");
    return stored && stored !== "undefined" && stored !== "null" ? stored : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Derive available branches from the active brand
  const branches = useMemo(() => {
    if (!activeBrand) return [];
    
    return activeBrand.memberships.map(m => {
      const slug = m.branch.slug || slugify(m.branch.branchName);
      return {
        ...m,
        slug // attach the slug to the membership object for easy lookup
      };
    });
  }, [activeBrand]);

  const activeMembership = useMemo(() => {
    return branches.find((b) => b.slug === activeBranchSlug) || null;
  }, [branches, activeBranchSlug]);

  const activeBranch = activeMembership?.branch || null;
  const activeBranchId = activeBranch?._id || null;
  const activeRole = activeMembership?.role || null;
  const permissions = useMemo(() => activeMembership?.permissions || [], [activeMembership]);

  // Sync Axios headers and localStorage when active branch changes
  useEffect(() => {
    if (activeBranchId) {
      apiClient.defaults.headers.common["x-branch-id"] = activeBranchId;
      localStorage.setItem("activeBranchId", activeBranchId); // internal backward compat
    } else {
      delete apiClient.defaults.headers.common["x-branch-id"];
      localStorage.removeItem("activeBranchId");
    }
  }, [activeBranchId]);

  useEffect(() => {
    setIsLoading(brandLoading);
  }, [brandLoading]);

  const switchBranch = (slug) => {
    if (slug === null) {
      setActiveBranchSlug(null);
      localStorage.removeItem("activeBranchSlug");
      return;
    }
    if (!slug || slug === "undefined") return;
    setActiveBranchSlug(slug);
    localStorage.setItem("activeBranchSlug", slug);
  };

  const hasPermission = (permission) => {
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const value = {
    branches,
    activeBranch,
    activeBranchSlug,
    activeBranchId,
    activeMembership,
    activeRole,
    permissions,
    isLoading,
    switchBranch,
    hasPermission
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};
