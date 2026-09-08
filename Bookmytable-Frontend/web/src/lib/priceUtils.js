/**
 * =========================================================
 * PRICE RESOLUTION UTILITY
 * =========================================================
 * Resolves the effective price for a table based on
 * the new Single Source of Truth: dining_area_pricing
 *
 *   floor + diningAreaType + sectionType -> Price
 *
 * Returns: { price: Number, source: 'dining_area_pricing' | 'none' }
 */

/**
 * @param {Object} table - The table business object (with floor, type, section)
 * @param {Array} pricingConfigs - Array of pricing configurations from backend
 * @returns {{ price: number, source: string }}
 */
export function resolveTablePrice(table, pricingConfigs = []) {
  if (!table || !pricingConfigs || pricingConfigs.length === 0) {
    return { price: 0, source: 'none' };
  }

  // Find exact match
  const match = pricingConfigs.find(p => 
    p.floor === table.floor && 
    p.diningAreaType === table.type && 
    p.sectionType === table.section
  );

  if (match && match.price != null && match.price >= 0) {
    return { price: match.price, source: 'dining_area_pricing' };
  }

  return { price: 0, source: 'none' };
}

/**
 * Human-readable label for a price source
 * @param {string} source
 * @returns {string}
 */
export function getPriceSourceLabel(source) {
  switch (source) {
    case 'dining_area_pricing': return 'Configured Pricing';
    case 'override':            return 'Custom Override (Legacy)';
    case 'section':             return 'From Section (Legacy)';
    case 'dining_area':         return 'From Area (Legacy)';
    default:                    return 'Not Set';
  }
}

/**
 * CSS class for the price source badge
 * @param {string} source
 * @returns {string}
 */
export function getPriceSourceBadgeClass(source) {
  switch (source) {
    case 'dining_area_pricing': return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
    case 'override':            return 'bg-purple-500/10 text-purple-700 border-purple-300';
    case 'section':             return 'bg-blue-500/10 text-blue-700 border-blue-300';
    case 'dining_area':         return 'bg-amber-500/10 text-amber-700 border-amber-300';
    default:                    return 'bg-muted text-muted-foreground border-border';
  }
}
