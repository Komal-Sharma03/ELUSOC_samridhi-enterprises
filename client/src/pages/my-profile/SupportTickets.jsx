// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  LifeBuoy,
  Plus,
  ArrowLeft,
  Send,
  MessageSquare,
  Inbox,
  Clock,
} from "lucide-react";
import {
  getMyTickets,
  getMyTicket,
  createTicket,
  addMessage,
  clearCurrentTicket,
  clearSupportError,
} from "@/store/order/supportSlice";
import Loader from "../../extras/Loader";

const CATEGORIES = ["Order", "Payment", "Product", "Shipping", "Account", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

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

const HELP_TOPICS = [
  {
    q: "How do I track my order?",
    a: "Go to My Orders from the account menu to see the current status of every order you've placed.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are typically processed within 1–2 business days. You'll receive updates as your order moves through fulfilment.",
  },
  {
    q: "How do I get a refund?",
    a: "Open a ticket under the Payment category with your order ID and our team will assist you.",
  },
];

const SupportTickets = () => {
  const dispatch = useDispatch();
  const { tickets, current, loading, actionLoading, error } = useSelector(
    (s) => s.support
  );

  // view: "list" | "new" | "detail"
  const [view, setView] = useState("list");
  const [form, setForm] = useState({
    subject: "",
    category: "Other",
    priority: "Medium",
    message: "",
  });
  const [reply, setReply] = useState("");
  const threadEndRef = useRef(null);

  useEffect(() => {
    dispatch(getMyTickets());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSupportError());
    }
  }, [error, dispatch]);

  // Scroll to the newest message when a thread is open/updated.
  useEffect(() => {
    if (view === "detail" && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [current, view]);

  const openTicket = (id) => {
    dispatch(getMyTicket(id));
    setView("detail");
  };

  const backToList = () => {
    dispatch(clearCurrentTicket());
    setView("list");
    dispatch(getMyTickets());
  };

  const handleCreate = async () => {
    if (!form.subject.trim()) return toast.error("Please enter a subject");
    if (!form.message.trim()) return toast.error("Please describe your issue");
    const res = await dispatch(createTicket(form));
    if (createTicket.fulfilled.match(res)) {
      toast.success("Ticket created");
      setForm({ subject: "", category: "Other", priority: "Medium", message: "" });
      setView("detail");
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    const res = await dispatch(addMessage({ id: current._id, body: reply }));
    if (addMessage.fulfilled.match(res)) setReply("");
  };

  if (loading && view === "list" && tickets.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-2xl">
              <LifeBuoy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help &amp; Support</h1>
              <p className="text-gray-600">Get help and track your support requests</p>
            </div>
          </div>
          {view === "list" && (
            <button
              onClick={() => setView("new")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> New Ticket
            </button>
          )}
          {view !== "list" && (
            <button
              onClick={backToList}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" /> Back to tickets
            </button>
          )}
        </motion.div>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <>
            {/* Help center */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Frequently asked questions
              </h2>
              <div className="space-y-4">
                {HELP_TOPICS.map((t) => (
                  <div key={t.q}>
                    <p className="font-medium text-gray-800">{t.q}</p>
                    <p className="text-sm text-gray-600 mt-1">{t.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* My tickets */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your tickets</h2>
            {tickets.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 p-12 text-center text-gray-500">
                <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                You have no support tickets yet.
                <div className="mt-4">
                  <button
                    onClick={() => setView("new")}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" /> Create a ticket
                  </button>
                </div>
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
                          {t.category} ·{" "}
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
                    <p className="text-sm text-gray-500 mt-2 inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t.messages?.length || 0}{" "}
                      {t.messages?.length === 1 ? "message" : "messages"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── NEW TICKET VIEW ── */}
        {view === "new" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Open a new ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  maxLength={150}
                  placeholder="Brief summary of your issue"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe your issue
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  placeholder="Tell us what's going on…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setView("list")}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                >
                  {actionLoading ? "Submitting…" : "Submit Ticket"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DETAIL / THREAD VIEW ── */}
        {view === "detail" && current && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow border border-white/20 overflow-hidden"
          >
            <div className="px-6 py-4 border-b flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{current.subject}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
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

            {/* Thread */}
            <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto">
              {current.messages.map((m, idx) => (
                <div
                  key={m._id || idx}
                  className={`flex ${
                    m.sender === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      m.sender === "USER"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-xs font-medium opacity-80 mb-0.5">
                      {m.sender === "USER" ? "You" : m.senderName || "Support Team"}
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
            {current.status === "Closed" ? (
              <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-500 text-center">
                This ticket is closed. Open a new ticket if you still need help.
              </div>
            ) : (
              <div className="px-6 py-4 border-t flex items-end gap-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Type your reply…"
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
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
