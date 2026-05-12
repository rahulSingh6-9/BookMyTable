import { useBranch } from "@/context/BranchContext";

/**
 * UI Component for conditional rendering based on permissions
 */
export const HasPermission = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useBranch();

  if (hasPermission(permission)) {
    return children;
  }

  return fallback;
};
