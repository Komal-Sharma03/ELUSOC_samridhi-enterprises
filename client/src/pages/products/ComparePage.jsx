// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCompareBadge } from "@/utils/stockStatus";
import {
  Scale,
  ArrowLeft,
  Trash2,
  X,
  Share2,
  ShoppingCart,
} from "lucide-react";
import {
  removeFromCompare,
  clearCompare,
} from "@/store/product/compareSlice";

const ComparePage = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.compare);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleShare = async () => {
    const names = items.map((p) => p.name).join(" vs ");
    const shareData = {
      title: "Product Comparison — Samridhi Enterprises",
      text: `Compare: ${names}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Comparison link copied to clipboard");
      }
    } catch {
      // User dismissed the share sheet, or clipboard was blocked — no-op.
    }
  };

  // The spec rows rendered for every product column. Each `value` is a function
  // of the part so the table stays in one place and is easy to extend.
  const SPEC_ROWS = [
    {
      label: "Price",
      render: (p) => (
        <span className="text-lg font-bold text-gray-900">
          ₹{Number(p.price).toLocaleString()}
        </span>
      ),
    },
    {
      label: "Product ID",
      render: (p) => <span className="font-mono text-sm">{p.product_id}</span>,
    },
    {
      label: "Category",
      render: (p) => <span className="capitalize">{p.category || "—"}</span>,
    },
    {
      label: "Availability",
      render: (p) => {
        const s = getCompareBadge(p.stock);
        return <span className={`font-medium ${s.cls}`}>{s.text}</span>;
      },
    },
    {
      label: "Units in stock",
      render: (p) => <span>{p.stock ?? "—"}</span>,
    },
    {
      label: "Rating",
      render: (p) => (
        <span>{p.ratings ? `${Number(p.ratings).toFixed(1)} / 5` : "No ratings"}</span>
      ),
    },
    {
      label: "Bestseller",
      render: (p) =>
        p.bestseller ? (
          <span className="text-blue-700 font-medium">Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        ),
    },
  ];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-10">
          <Scale className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            No products to compare
          </h2>
          <p className="text-gray-600 mb-8">
            Browse the catalogue and tap “Compare” on any product to add it here.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-2xl">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Compare Products
              </h1>
              <p className="text-gray-600">
                Comparing {items.length} product{items.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl transition"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => dispatch(clearCompare())}
              className="inline-flex items-center gap-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-medium px-4 py-2.5 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          </div>
        </motion.div>

        {/* Comparison table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="sticky left-0 bg-gray-50 z-10 text-left text-sm font-semibold text-gray-500 px-4 py-4 w-40">
                  Product
                </th>
                {items.map((p) => (
                  <th key={p._id} className="px-4 py-4 align-top min-w-[180px]">
                    <div className="relative flex flex-col items-center text-center">
                      <button
                        onClick={() => dispatch(removeFromCompare(p._id))}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link to={`/products/${p._id}`}>
                        <img
                          src={p.image || "https://via.placeholder.com/150"}
                          alt={p.name}
                          className="w-24 h-24 object-cover rounded-xl bg-gray-50 mb-2"
                        />
                      </Link>
                      <Link
                        to={`/products/${p._id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 capitalize"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPEC_ROWS.map((row, idx) => (
                <tr
                  key={row.label}
                  className={idx % 2 === 0 ? "bg-white/60" : "bg-gray-50/60"}
                >
                  <td className="sticky left-0 bg-inherit z-10 text-sm font-medium text-gray-600 px-4 py-3">
                    {row.label}
                  </td>
                  {items.map((p) => (
                    <td
                      key={p._id}
                      className="px-4 py-3 text-center text-sm text-gray-800"
                    >
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Action row */}
              <tr>
                <td className="sticky left-0 bg-white z-10 px-4 py-4" />
                {items.map((p) => (
                  <td key={p._id} className="px-4 py-4 text-center">
                    <Link
                      to={`/products/${p._id}`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                    >
                      <ShoppingCart className="w-4 h-4" /> View
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Continue browsing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
