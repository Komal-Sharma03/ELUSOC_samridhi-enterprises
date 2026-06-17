// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  AlertTriangle,
  Building2,
  Car,
  Wrench,
  ClipboardList,
  CreditCard,
  BarChart3,
  PackageSearch,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  adminGetDashboardAnalytics,
} from "@/store/order/orderSlice";

// Indian-rupee formatter shared by the revenue card.
const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

// Quick links to the other admin modules. Existing product-management pages are
// linked here so the dashboard is the single entry point for all admin work.
const quickLinks = [
  { to: "/admin/orders", label: "Manage Orders", icon: ClipboardList },
  { to: "/admin/analytics", label: "Sales Analytics", icon: BarChart3 },
  { to: "/admin/brands", label: "Bike Brands", icon: Building2 },
  { to: "/admin/bikes", label: "Bike Models", icon: Car },
  { to: "/admin/parts", label: "Bike Parts", icon: Wrench },
  { to: "/admin/inventory", label: "Inventory", icon: PackageSearch },
  { to: "/admin/payment-settings", label: "Payment Settings", icon: CreditCard },
];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(adminGetDashboardAnalytics());
  }, [dispatch]);

  // Cards are derived from the live analytics payload — never hardcoded. While
  // the request is in flight (or on first load) values fall back to 0 so the
  // layout stays stable instead of flashing undefined.
  const cards = [
    {
      title: "Total Revenue",
      value: formatINR(analytics?.totalRevenue),
      icon: <IndianRupee className="w-8 h-8 text-white" />,
      color: "bg-emerald-500",
    },
    {
      title: "Total Orders",
      value: analytics?.totalOrders ?? 0,
      icon: <ShoppingCart className="w-8 h-8 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Total Customers",
      value: analytics?.totalCustomers ?? 0,
      icon: <Users className="w-8 h-8 text-white" />,
      color: "bg-purple-500",
    },
    {
      title: "Low Stock Items",
      value: analytics?.lowStockCount ?? 0,
      icon: <AlertTriangle className="w-8 h-8 text-white" />,
      color: "bg-amber-500",
    },
  ];

  // Lifecycle breakdown shown as small pills beneath the summary cards.
  const statusEntries = analytics?.ordersByStatus
    ? Object.entries(analytics.ordersByStatus)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-blue-900 mb-8 text-center"
      >
        Admin Dashboard
      </motion.h2>

      {/* Summary cards — real data from the analytics endpoint */}
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
              <span className="text-lg font-medium">{card.title}</span>
              <div className="bg-white/20 p-2 rounded-full">{card.icon}</div>
            </div>
            <div className="text-3xl font-bold">
              {loading && !analytics ? "…" : card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order status breakdown */}
      {statusEntries.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Orders by Status
          </h3>
          <div className="flex flex-wrap gap-3">
            {statusEntries.map(([status, count]) => (
              <span
                key={status}
                className="px-4 py-2 rounded-full bg-white shadow text-sm font-medium text-gray-700 border border-gray-200"
              >
                {status}:{" "}
                <span className="font-bold text-blue-900">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Out-of-stock alert */}
      {analytics?.outOfStockCount > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">
            {analytics.outOfStockCount} product
            {analytics.outOfStockCount === 1 ? " is" : "s are"} out of stock and
            need restocking.
          </span>
        </div>
      )}

      {/* Quick navigation to all admin modules */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Management
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <Icon className="w-6 h-6 text-blue-700" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
