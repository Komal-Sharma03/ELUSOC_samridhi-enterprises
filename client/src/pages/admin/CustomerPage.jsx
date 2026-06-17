// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { getAllUsers, updateUserRole } from "@/store/auth-slice/user";
import Loader from "../../extras/Loader";

// Status → colour-coded pill. The User model allows: Active, Warning, Suspended.
const statusPill = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border border-green-200";
    case "Warning":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "Suspended":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

// Role → colour-coded pill.
const rolePill = (role) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 border border-purple-200";
    case "MANAGER":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const PAGE_SIZES = [10, 25, 50];

const CustomerPage = () => {
  const dispatch = useDispatch();
  const { users, totalUsers, totalPages, loading, error, user: currentUser } =
    useSelector((state) => state.auth);

  // Tracks which user's role is currently being saved, to disable just that row.
  const [savingRoleFor, setSavingRoleFor] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounce the search input so we don't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    dispatch(getAllUsers({ page, limit, search: debouncedSearch }));
  }, [dispatch, page, limit, debouncedSearch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Summary statistics derived from the current result set.
  // The backend already filters by search so totals reflect the
  // full match count, not just the current page.
  const list = users || [];

  // Whether the logged-in admin can edit roles. The backend restricts the
  // role-update endpoint to ADMIN only (managers get 403), so we mirror that in
  // the UI and only render the editable dropdown for an ADMIN.
  const canEditRoles = currentUser?.role === "ADMIN";

  const ROLE_OPTIONS = ["USER", "MANAGER", "ADMIN"];

  const handleRoleChange = async (targetUser, newRole) => {
    if (newRole === targetUser.role) return;

    // Guard: an admin must not demote their own account, which could lock them
    // (and potentially everyone) out of role management.
    if (
      currentUser &&
      targetUser._id === currentUser._id &&
      newRole !== "ADMIN"
    ) {
      toast.error("You cannot change your own admin role.");
      return;
    }

    setSavingRoleFor(targetUser._id);
    const res = await dispatch(
      updateUserRole({ email: targetUser.email, role: newRole })
    );
    setSavingRoleFor(null);

    if (updateUserRole.fulfilled.match(res)) {
      toast.success(`${targetUser.name}'s role updated to ${newRole}`);
    } else {
      toast.error(
        res.payload?.message || res.payload?.error || "Failed to update role"
      );
    }
  };
  const activeCount = list.filter((u) => u.status === "Active").length;
  const warningCount = list.filter((u) => u.status === "Warning").length;
  const suspendedCount = list.filter((u) => u.status === "Suspended").length;

  const cards = [
    {
      title: "Total Customers",
      value: totalUsers ?? 0,
      icon: <Users className="w-7 h-7 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "Active",
      value: activeCount,
      icon: <UserCheck className="w-7 h-7 text-white" />,
      color: "bg-emerald-500",
    },
    {
      title: "Warning",
      value: warningCount,
      icon: <ShieldAlert className="w-7 h-7 text-white" />,
      color: "bg-amber-500",
    },
    {
      title: "Suspended",
      value: suspendedCount,
      icon: <UserX className="w-7 h-7 text-white" />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto mt-16">
      {/* Back to Dashboard — matches Sales Analytics and Inventory pages */}
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
        Customer Management
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
              {loading && list.length === 0 ? "…" : card.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + page-size controls */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      <p className="mt-4 text-sm text-gray-600">
        {totalUsers === 0
          ? "No customers found"
          : `Showing ${(page - 1) * limit + 1}–${Math.min(
              page * limit,
              totalUsers
            )} of ${totalUsers} customer${totalUsers !== 1 ? "s" : ""}`}
      </p>

      {/* Customer table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Registered
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar: show image if available, else initials */}
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {(user.name || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(user.lastLogin)}
                </td>
                <td className="px-4 py-3 text-center">
                  {canEditRoles ? (
                    <select
                      value={user.role}
                      disabled={savingRoleFor === user._id}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className={`text-xs font-medium rounded-lg border px-2 py-1 cursor-pointer focus:ring-2 focus:ring-blue-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${rolePill(
                        user.role
                      )}`}
                      aria-label={`Change role for ${user.name}`}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${rolePill(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusPill(
                      user.status
                    )}`}
                  >
                    {user.status || "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {list.length === 0 && !loading && (
          <div className="p-8 text-center text-sm text-gray-500">
            No customers to display.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => Math.abs(n - page) <= 2)
            .map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  n === page
                    ? "bg-blue-500 text-white border-blue-500 font-semibold"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
              >
                {n}
              </button>
            ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading && <Loader />}
    </div>
  );
};

export default CustomerPage;
