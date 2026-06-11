import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// Revenue is only counted for orders whose payment has actually succeeded, so
// COD orders awaiting delivery and online orders pending verification do not
// inflate the totals. Centralised here so every metric uses the same rule.
const PAID_MATCH = { paymentStatus: "Success" };

// Stock at or below this level is treated as "low" on the dashboard. Kept as a
// named constant so the dashboard, inventory module, and alerts stay in sync.
const LOW_STOCK_THRESHOLD = 5;

// GET /api/orders/admin/analytics  (auth, admin)
// Returns the at-a-glance numbers for the dashboard overview. Each figure is
// computed from real order / user / part records — never hardcoded. The work is
// split into a small number of aggregation queries that run together so the
// endpoint stays fast even as the collections grow.
export const adminGetDashboardAnalytics = catchAsyncErrors(
  async (req, res, next) => {
    const [
      revenueAgg,
      totalOrders,
      totalCustomers,
      statusAgg,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      // Total revenue + paid-order count in a single pass over paid orders.
      Order.aggregate([
        { $match: PAID_MATCH },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$itemsTotal" },
            paidOrders: { $sum: 1 },
          },
        },
      ]),
      // Every order regardless of payment state (operational volume).
      Order.countDocuments({}),
      // Customers = registered users with the default USER role.
      User.countDocuments({ role: "USER" }),
      // Order count grouped by lifecycle status, for the status breakdown.
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
      // Parts running low (but not yet out).
      Part.countDocuments({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
      // Parts completely out of stock.
      Part.countDocuments({ stock: { $lte: 0 } }),
    ]);

    const revenue = revenueAgg[0]?.revenue || 0;
    const paidOrders = revenueAgg[0]?.paidOrders || 0;

    // Convert the status aggregation into a plain object so the frontend can
    // read e.g. ordersByStatus.Confirmed without scanning an array.
    const ordersByStatus = statusAgg.reduce((acc, { _id, count }) => {
      if (_id) acc[_id] = count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue: revenue,
        totalOrders,
        paidOrders,
        totalCustomers,
        lowStockCount,
        outOfStockCount,
        ordersByStatus,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
    });
  }
);

// GET /api/orders/admin/inventory  (auth, admin)
// Returns parts with their current stock levels, sorted lowest-first so the
// items needing attention surface at the top. Each row is tagged with a simple
// status the UI can colour-code without re-deriving the threshold logic.
export const adminGetInventoryOverview = catchAsyncErrors(
  async (req, res, next) => {
    const parts = await Part.find({})
      .select("name price stock category")
      .sort({ stock: 1 });

    const inventory = parts.map((p) => {
      let status = "In Stock";
      if (p.stock <= 0) status = "Out of Stock";
      else if (p.stock <= LOW_STOCK_THRESHOLD) status = "Low Stock";
      return {
        _id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        status,
      };
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      inventory,
    });
  }
);
