/**
 * stockStatus.js — Single source of truth for inventory threshold constants
 * and stock-status derivation across all client views.
 *
 * Background
 * ----------
 * Previously, stock thresholds and status strings were scattered across
 * AdminPartPage.jsx, ComparePage.jsx, SingleProduct.jsx, and the backend
 * analyticsController.js (LOW_STOCK_THRESHOLD = 5). A threshold change
 * required editing multiple files and risked inconsistent results.
 *
 * This module centralises the canonical rules so every view reads from one
 * place. The backend is the authoritative source for thresholds (5 = low-stock
 * boundary, 0 = out-of-stock boundary); those values are mirrored here so the
 * frontend never silently diverges.
 */

// ---------------------------------------------------------------------------
// Threshold constants  (mirrors analyticsController.js: LOW_STOCK_THRESHOLD)
// ---------------------------------------------------------------------------

/** Stock at or below this level is "Low Stock" (> 0 units but ≤ LOW_STOCK). */
export const LOW_STOCK_THRESHOLD = 5;

/** Stock at or above this level is considered fully "In Stock" (admin views). */
export const IN_STOCK_THRESHOLD = 15;

// ---------------------------------------------------------------------------
// Label constants — change once, reflected everywhere
// ---------------------------------------------------------------------------

export const STOCK_LABELS = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

// ---------------------------------------------------------------------------
// Core derivation
// ---------------------------------------------------------------------------

/**
 * Returns the canonical admin-facing stock status for a given stock count.
 *
 * Rules (matching the backend analyticsController):
 *   stock <= 0          → "Out of Stock"
 *   0 < stock <= 5      → "Low Stock"
 *   stock > 5           → "In Stock"
 *
 * @param {number} stock - Current unit count from the Part document.
 * @returns {{ label: string, isOutOfStock: boolean, isLowStock: boolean, isInStock: boolean }}
 */
export const getStockStatus = (stock) => {
  const n = Number(stock) || 0;
  if (n <= 0) {
    return {
      label: STOCK_LABELS.OUT_OF_STOCK,
      isOutOfStock: true,
      isLowStock: false,
      isInStock: false,
    };
  }
  if (n <= LOW_STOCK_THRESHOLD) {
    return {
      label: STOCK_LABELS.LOW_STOCK,
      isOutOfStock: false,
      isLowStock: true,
      isInStock: false,
    };
  }
  return {
    label: STOCK_LABELS.IN_STOCK,
    isOutOfStock: false,
    isLowStock: false,
    isInStock: true,
  };
};

// ---------------------------------------------------------------------------
// Tailwind badge helper (admin views — pill colours)
// ---------------------------------------------------------------------------

/**
 * Returns a Tailwind class string for a coloured status badge appropriate for
 * the admin panel (matches InventoryPage's statusPill colours).
 *
 * @param {number} stock
 * @returns {{ label: string, badgeCls: string }}
 */
export const getStockBadge = (stock) => {
  const status = getStockStatus(stock);
  let badgeCls;
  if (status.isOutOfStock) {
    badgeCls = "bg-red-100 text-red-800";
  } else if (status.isLowStock) {
    badgeCls = "bg-yellow-100 text-yellow-800";
  } else {
    badgeCls = "bg-green-100 text-green-800";
  }
  return { label: status.label, badgeCls };
};

// ---------------------------------------------------------------------------
// Compare-page helper (text colour only — matches existing ComparePage style)
// ---------------------------------------------------------------------------

/**
 * Returns the label and Tailwind text-colour class for the compare table.
 * Matches the existing `stockLabel` function that was previously inlined in
 * ComparePage.jsx.
 *
 * @param {number} stock
 * @returns {{ text: string, cls: string }}
 */
export const getCompareBadge = (stock) => {
  const status = getStockStatus(stock);
  let cls;
  if (status.isOutOfStock) {
    cls = "text-red-700";
  } else if (status.isLowStock) {
    cls = "text-yellow-700";
  } else {
    cls = "text-green-700";
  }
  return { text: status.label, cls };
};

// ---------------------------------------------------------------------------
// Customer-facing product-page helper (distinct UX copy, same thresholds)
// ---------------------------------------------------------------------------

/**
 * Customer-facing stock display for the single-product page.
 * Uses the same numeric thresholds as the admin view but with warmer
 * customer-facing copy ("Only few left!" rather than "Low Stock").
 *
 * @param {number} stock
 * @returns {{ text: string, color: string, bg: string }}
 */
export const getCustomerStockStatus = (stock) => {
  const n = Number(stock) || 0;
  if (n <= 0) {
    return { text: "Out of Stock", color: "text-red-500", bg: "bg-red-50" };
  }
  if (n <= LOW_STOCK_THRESHOLD) {
    return { text: "Only few left!", color: "text-orange-500", bg: "bg-orange-50" };
  }
  if (n <= IN_STOCK_THRESHOLD) {
    return { text: "Limited Stock", color: "text-yellow-600", bg: "bg-yellow-50" };
  }
  return { text: "In Stock", color: "text-emerald-500", bg: "bg-emerald-50" };
};
