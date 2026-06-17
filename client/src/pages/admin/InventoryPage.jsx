// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Package,
  PackageCheck,
  AlertTriangle,
  PackageX,
  ArrowLeft,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminGetInventory, clearOrderError } from "@/store/order/orderSlice";
import Loader from "../../extras/Loader";

// Indian-rupee formatter shared by the stock-value figures on this page.
const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

// Maps the server-provided status string to a colour-coded pill. The backend
// (analyticsController.adminGetInventoryOverview) is the single source of truth
// for the status itself, so the UI never re-derives the threshold here.
const statusPill = (status) => {
  switch (status) {
    case "Out of Stock":
      return "bg-red-100 text-red-800 border border-red-200";
    case "Low Stock":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    default:
      return "bg-green-100 text-green-800 border border-green-200";
  }
};

const STATUS_FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock"];

const InventoryPage = () => {
  const dispatch = useDispatch();
  const { inventory, loading, error } = useSelector((state) => state.order);

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(adminGetInventory());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  // Summary statistics derived from the live inventory payload — never
  // hardcoded. Falls back to an empty array so the cards render 0 on first
  // load instead of crashing on undefined.
  const stats = useMemo(() => {
    const list = inventory || [];
    const inStock = list.filter((p) => p.status === "In Stock").length;
    const lowStock = list.filter((p) => p.status === "Low Stock").length;
    const outOfStock = list.filter((p) => p.status === "Out of Stock").length;
    const stockValue = list.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0
    );
    return {
      total: list.length,
      inStock,
      lowStock,
      outOfStock,
      stockValue,
    };
  }, [inventory]);

  // Apply the status filter and search term. The list arrives already sorted
  // lowest-stock-first from the server, so filtering preserves that order and
  // the items needing attention stay at the top.
  const filteredInventory = useMemo(() => {
    const list = inventory || [];
    const term = searchTerm.trim().toLowerCase();
    return list.filter((p) => {
      const matchesStatus =
        statusFilter === "All" ? true : p.status === statusFilter;
      const matchesSearch =
        term === ""
          ? true
          : (p.name || "").toLowerCase().includes(term) ||
            (p.category || "").toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [inventory, statusFilter, searchTerm]);

  const cards = [
    {
      title: "Total Products",
      value: stats.total,
      icon: <Package className="w-7 h-7 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "In Stock",
      value: stats.inStock,
      icon: <PackageCheck className="w-7 h-7 text-white" />,
      color: "bg-emerald-500",
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: <AlertTriangle className="w-7 h-7 text-white" />,
      color: "bg-amber-500",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: <PackageX className="w-7 h-7 text-white" />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto mt-16">
      {/* Back link to the dashboard, matching the Sales Analytics page. */}
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-blue-900 mb-8 text-center"
      >
        Inventory Monitoring
      </motion.h2>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl shadow-lg text-white ${card.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium">{card.title}</span>
              <div className="bg-white/20 p-2 rounded-full">{card.icon}</div>
            </div>
            <div className="text-3xl font-bold">
              {loading && (!inventory || inventory.length === 0)
                ? "…"
                : card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total stock value */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between shadow-sm">
        <span className="text-sm font-medium text-gray-600">
          Total Stock Value (price × quantity on hand)
        </span>
        <span className="text-xl font-bold text-blue-900">
          {formatINR(stats.stockValue)}
        </span>
      </div>

      {/* Alert banners */}
      {stats.outOfStock > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <PackageX className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">
            {stats.outOfStock} product
            {stats.outOfStock === 1 ? " is" : "s are"} out of stock and need
            immediate restocking.
          </span>
        </div>
      )}
      {stats.lowStock > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">
            {stats.lowStock} product
            {stats.lowStock === 1 ? " is" : "s are"} running low on stock.
          </span>
        </div>
      )}

      {/* Controls: search + status filter */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name or category…"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                statusFilter === s
                  ? "bg-blue-500 text-white border-blue-500 font-semibold"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="mt-4 text-sm text-gray-600">
        {filteredInventory.length === 0
          ? "No products match the current filter"
          : `Showing ${filteredInventory.length} of ${stats.total} product${
              stats.total !== 1 ? "s" : ""
            }`}
      </p>

      {/* Inventory table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInventory.map((part) => (
              <tr key={part._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                  {part.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {part.category}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {formatINR(part.price)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                  {part.stock}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusPill(
                      part.status
                    )}`}
                  >
                    {part.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInventory.length === 0 && !loading && (
          <div className="p-8 text-center text-sm text-gray-500">
            No products to display.
          </div>
        )}
      </div>

      {loading && <Loader />}
    </div>
  );
};

export default InventoryPage;
