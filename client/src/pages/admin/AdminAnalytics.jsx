// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Package,
  UserPlus,
  ClipboardList,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";
import { adminGetSalesAnalytics } from "@/store/order/orderSlice";
import Loader from "../../extras/Loader";

// Indian-rupee formatter shared across the revenue figures on this page.
const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

// Compact INR for axis labels (e.g. ₹1.2L, ₹45K) so the y-axis stays readable.
const formatCompactINR = (n) => {
  if (!n) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusColor = (status) => {
  switch (status) {
    case "Success":
    case "Confirmed":
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Pending":
    case "Pending Verification":
    case "Processing":
    case "Shipped":
      return "bg-yellow-100 text-yellow-800";
    case "Failed":
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// ----------------------------------------------------------------------------
// Lightweight, dependency-free charts built with inline SVG. They use a
// viewBox with preserveAspectRatio so they scale fluidly to their container
// width on every screen size without a charting library or media queries.
// ----------------------------------------------------------------------------

// Grouped bar chart for monthly revenue. Each bar's height is scaled to the
// largest revenue value in the window; an all-zero dataset renders a flat
// baseline instead of dividing by zero.
const RevenueBarChart = ({ data }) => {
  const W = 760;
  const H = 260;
  const padX = 44;
  const padY = 24;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const barGap = chartW / data.length;
  const barWidth = Math.min(barGap * 0.6, 46);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto"
      role="img"
      aria-label="Monthly revenue bar chart"
    >
      {/* horizontal grid lines + y labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padY + chartH - chartH * t;
        return (
          <g key={t}>
            <line
              x1={padX}
              y1={y}
              x2={W - padX}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={padX - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9ca3af"
            >
              {formatCompactINR(Math.round(maxRevenue * t))}
            </text>
          </g>
        );
      })}

      {/* bars + x labels */}
      {data.map((d, i) => {
        const barH = (d.revenue / maxRevenue) * chartH;
        const x = padX + i * barGap + (barGap - barWidth) / 2;
        const y = padY + chartH - barH;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, 0)}
              rx="4"
              fill="#3b82f6"
            >
              <title>{`${d.label}: ${formatINR(d.revenue)} (${d.orders} orders)`}</title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Line chart for customer growth. Builds a single polyline across the window
// with a soft filled area beneath it; dots mark each month.
const GrowthLineChart = ({ data }) => {
  const W = 760;
  const H = 240;
  const padX = 40;
  const padY = 24;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;
  const maxVal = Math.max(...data.map((d) => d.newCustomers), 1);
  const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padY + chartH - (d.newCustomers / maxVal) * chartH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath =
    `${linePath} L ${points[points.length - 1].x} ${padY + chartH}` +
    ` L ${points[0].x} ${padY + chartH} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto"
      role="img"
      aria-label="Customer growth line chart"
    >
      {[0, 0.5, 1].map((t) => {
        const y = padY + chartH - chartH * t;
        return (
          <g key={t}>
            <line
              x1={padX}
              y1={y}
              x2={W - padX}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={padX - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#9ca3af"
            >
              {Math.round(maxVal * t)}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="#a78bfa" opacity="0.18" />
      <path
        d={linePath}
        fill="none"
        stroke="#7c3aed"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#7c3aed">
            <title>{`${p.label}: ${p.newCustomers} new customers`}</title>
          </circle>
          <text
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Horizontal bars for the top products, ranked by units sold. Horizontal makes
// long product names readable without rotation.
const TopProductsChart = ({ data }) => {
  const maxUnits = Math.max(...data.map((d) => d.unitsSold), 1);
  return (
    <div className="space-y-3">
      {data.map((p) => (
        <div key={p._id || p.name} className="flex items-center gap-3">
          <div className="w-32 sm:w-40 shrink-0 truncate text-sm text-gray-700" title={p.name}>
            {p.name}
          </div>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-end pr-2"
              style={{ width: `${Math.max((p.unitsSold / maxUnits) * 100, 6)}%` }}
            >
              <span className="text-xs font-semibold text-white">
                {p.unitsSold}
              </span>
            </div>
          </div>
          <div className="w-20 shrink-0 text-right text-xs text-gray-500">
            {formatINR(p.revenue)}
          </div>
        </div>
      ))}
    </div>
  );
};

// Reusable section wrapper so every chart card shares the same chrome.
const ChartCard = ({ title, icon: Icon, children, isEmpty, emptyText }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
    <div className="flex items-center gap-2 mb-5">
      <div className="bg-blue-50 p-2 rounded-lg">
        <Icon className="w-5 h-5 text-blue-700" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    {isEmpty ? (
      <div className="py-10 text-center text-gray-400 text-sm">{emptyText}</div>
    ) : (
      children
    )}
  </div>
);

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { salesAnalytics, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(adminGetSalesAnalytics());
  }, [dispatch]);

  // First load — nothing cached yet — show the loader.
  if (loading && !salesAnalytics) {
    return <Loader />;
  }

  const monthlySales = salesAnalytics?.monthlySales || [];
  const topProducts = salesAnalytics?.topProducts || [];
  const customerGrowth = salesAnalytics?.customerGrowth || [];
  const recentOrders = salesAnalytics?.recentOrders || [];

  // A month-series counts as "empty" only when every value is zero, so a brand
  // new store with no paid orders shows a friendly message, not a flat chart.
  const hasRevenue = monthlySales.some((m) => m.revenue > 0);
  const hasGrowth = customerGrowth.some((m) => m.newCustomers > 0);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl sm:text-3xl font-bold text-blue-900"
        >
          Sales Analytics
        </motion.h2>
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Sales Trends */}
        <ChartCard
          title="Monthly Sales Trends"
          icon={TrendingUp}
          isEmpty={!hasRevenue}
          emptyText="No paid orders yet — revenue trends will appear here once sales come in."
        >
          <RevenueBarChart data={monthlySales} />
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <ChartCard
            title="Top Selling Products"
            icon={Package}
            isEmpty={topProducts.length === 0}
            emptyText="No products have been sold yet."
          >
            <TopProductsChart data={topProducts} />
          </ChartCard>

          {/* Customer Growth */}
          <ChartCard
            title="Customer Growth"
            icon={UserPlus}
            isEmpty={!hasGrowth}
            emptyText="No customer sign-ups in this period yet."
          >
            <GrowthLineChart data={customerGrowth} />
          </ChartCard>
        </div>

        {/* Recent Orders */}
        <ChartCard
          title="Recent Orders"
          icon={ClipboardList}
          isEmpty={recentOrders.length === 0}
          emptyText="No orders have been placed yet."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="py-3 pr-4 font-medium">Customer</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Payment</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium text-gray-800">
                        {o.customerName}
                      </div>
                      {o.customerEmail && (
                        <div className="text-xs text-gray-400">
                          {o.customerEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">
                      <span className="inline-flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {new Intl.NumberFormat("en-IN").format(o.itemsTotal || 0)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                      {o.paymentMethod}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(
                          o.orderStatus
                        )}`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalytics;
