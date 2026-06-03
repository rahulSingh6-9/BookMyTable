import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getMyMemberships } from "../services/membership.service";
import { useAuth } from "./AuthContext";

const BrandContext = createContext();

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within BrandProvider");
  }
  return context;
};

const slugify = (text) => {
  if (!text) return "independent";
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const BrandProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [memberships, setMemberships] = useState([]);
  
  const [activeBrandSlug, setActiveBrandSlug] = useState(() => {
    const stored = localStorage.getItem("activeBrandSlug");
    return stored && stored !== "undefined" && stored !== "null" ? stored : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      if (!isLoggedIn) {
        setMemberships([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getMyMemberships();
        const data = response.data.data || [];
        setMemberships(data);
      } catch (error) {
        console.error("[BrandContext] Failed to fetch memberships:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberships();
  }, [isLoggedIn]);

  // Derive brands (contexts) from raw memberships
  const brands = useMemo(() => {
    const map = new Map();
    memberships.forEach(m => {
      if (!m.branch) return;
      
      const isBrand = !!m.brand;
      const brandId = isBrand ? m.brand._id : `independent_${m.branch._id}`;
      const name = isBrand ? (m.brand.name || m.brand.brandName) : (m.branch.restaurantName || m.branch.branchName || "Independent Restaurant");
      const slug = isBrand ? (m.brand.slug || slugify(name)) : `independent-${m.branch.slug || slugify(name)}`;
      
      if (!map.has(slug)) {
        map.set(slug, {
          id: brandId,
          slug: slug,
          name: name,
          logo: isBrand ? m.brand.logo : m.branch.logo,
          isBrand: isBrand,
          memberships: [] // Store memberships belonging to this brand
        });
      }
      map.get(slug).memberships.push(m);
    });
    return Array.from(map.values());
  }, [memberships]);

  const activeBrand = useMemo(() => {
    return brands.find(b => b.slug === activeBrandSlug) || null;
  }, [brands, activeBrandSlug]);

  // Get all unique roles the user holds across all memberships in the active brand
  const brandRoles = useMemo(() => {
    if (!activeBrand) return [];
    const roles = new Set(activeBrand.memberships.map(m => m.role));
    return Array.from(roles);
  }, [activeBrand]);

  const hasBrandRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (brandRoles.includes("admin") || brandRoles.includes("super_admin")) return true; // Global bypass if needed
    return allowedRoles.some(role => brandRoles.includes(role));
  };

  const switchBrand = (slug) => {
    if (!slug || slug === "undefined") return;
    setActiveBrandSlug(slug);
    localStorage.setItem("activeBrandSlug", slug);
  };

  const value = {
    memberships,
    brands,
    activeBrand,
    activeBrandSlug,
    brandRoles,
    hasBrandRole,
    isLoading,
    switchBrand,
    refreshMemberships: async () => {
      const response = await getMyMemberships();
      setMemberships(response.data.data || []);
    }
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};
