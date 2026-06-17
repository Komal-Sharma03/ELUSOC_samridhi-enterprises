// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  LifeBuoy,
  Send,
  Inbox,
  Clock,
  Filter,
} from "lucide-react";
import {
  adminGetTickets,
  adminGetTicket,
  adminUpdateStatus,
  adminReply,
  clearCurrentTicket,
  clearSupportError,
} from "@/store/order/supportSlice";
import Loader from "../../extras/Loader";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const CATEGORIES = ["Order", "Payment", "Product", "Shipping", "Account", "Other"];

const statusStyle = (status) => {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-700";
    case "In Progress":
      return "bg-amber-100 text-amber-700";
    case "Resolved":
      return "bg-emerald-100 text-emerald-700";
    case "Closed":
      return "bg-gray-200 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminSupportTickets = () => {
  const dispatch = useDispatch();
  const { tickets, current, loading, actionLoading, error } = useSelector(
    (s) => s.support
  );

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [view, setView] = useState("list"); // "list" | "detail"
  const [reply, setReply] = useState("");
  const threadEndRef = useRef(null);

  useEffect(() => {
    dispatch(
      adminGetTickets({ status: statusFilter, category: categoryFilter })
    );
  }, [dispatch, statusFilter, categoryFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSupportError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (view === "detail" && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [current, view]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "Open").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const resolved = tickets.filter(
      (t) => t.status === "Resolved" || t.status === "Closed"
    ).length;
    return { total: tickets.length, open, inProgress, resolved };
  }, [tickets]);

  const openTicket = (id) => {
    dispatch(adminGetTicket(id));
    setView("detail");
  };

  const backToList = () => {
    dispatch(clearCurrentTicket());
    setView("list");
    dispatch(adminGetTickets({ status: statusFilter, category: categoryFilter }));
  };

  const handleStatusChange = async (status) => {
    const res = await dispatch(adminUpdateStatus({ id: current._id, status }));
    if (adminUpdateStatus.fulfilled.match(res)) toast.success(`Marked ${status}`);
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    const res = await dispatch(adminReply({ id: current._id, body: reply }));
    if (adminReply.fulfilled.match(res)) setReply("");
  };

  if (loading && view === "list" && tickets.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="bg-blue-500 p-3 rounded-2xl">
            <LifeBuoy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600">
              Manage and respond to customer support requests
            </p>
          </div>
        </motion.div>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total", value: stats.total },
                { label: "Open", value: stats.open },
                { label: "In Progress", value: stats.inProgress },
                { label: "Resolved", value: stats.resolved },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 p-5"
                >
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                <Filter className="w-4 h-4" /> Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Ticket list */}
            {tickets.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 p-12 text-center text-gray-500">
                <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No tickets match the current filters.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => openTicket(t._id)}
                    className="w-full text-left bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {t.subject}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {t.user?.name || "Customer"} · {t.category} ·{" "}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(t.lastActivityAt)}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── DETAIL VIEW ── */}
        {view === "detail" && current && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={backToList}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to tickets
            </button>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {current.subject}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {current.user?.name || "Customer"}
                      {current.user?.email ? ` · ${current.user.email}` : ""} ·{" "}
                      {current.category} · {current.priority} priority
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(
                      current.status
                    )}`}
                  >
                    {current.status}
                  </span>
                </div>

                {/* Status controls */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-sm text-gray-500">Set status:</span>
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={actionLoading || current.status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-100 ${
                        current.status === s
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread */}
              <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
                {current.messages.map((m, idx) => (
                  <div
                    key={m._id || idx}
                    className={`flex ${
                      m.sender === "ADMIN" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        m.sender === "ADMIN"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-xs font-medium opacity-80 mb-0.5">
                        {m.sender === "ADMIN"
                          ? m.senderName || "Support Team"
                          : m.senderName || "Customer"}
                      </p>
                      <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                      <p className="text-[10px] opacity-70 mt-1 text-right">
                        {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={threadEndRef} />
              </div>

              {/* Reply box */}
              <div className="px-6 py-4 border-t flex items-end gap-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Type your reply to the customer…"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />
                <button
                  onClick={handleReply}
                  disabled={actionLoading || !reply.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportTickets;
