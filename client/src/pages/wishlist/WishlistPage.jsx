import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlistError,
} from "../../store/wishlist/wishlistSlice";
import { addToCart } from "../../store/cart/cartSlice";
import Loader from "../../extras/Loader";

const stockBadge = (stock) => {
  if (stock > 15) return { label: "In Stock", cls: "bg-green-100 text-green-800" };
  if (stock >= 5) return { label: "Low Stock", cls: "bg-yellow-100 text-yellow-800" };
  if (stock > 0) return { label: "Few Left", cls: "bg-orange-100 text-orange-800" };
  return { label: "Out of Stock", cls: "bg-red-100 text-red-800" };
};

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlist, loading, error } = useSelector((state) => state.wishlist);
  const items = wishlist?.items || [];

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearWishlistError());
    }
  }, [error, dispatch]);

  const handleRemove = (partId) => {
    dispatch(removeFromWishlist(partId))
      .unwrap()
      .then(() => toast.success("Removed from wishlist"))
      .catch(() => {});
  };

  const handleAddToCart = (part) => {
    if (!part || part.stock <= 0) return;
    dispatch(addToCart({ partId: part._id, quantity: 1 }))
      .unwrap()
      .then(() => toast.success("Added to cart"))
      .catch((msg) => toast.error(msg || "Could not add to cart"));
  };

  if (loading && items.length === 0) return <Loader />;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-10">
          <Heart className="w-12 h-12 mx-auto text-blue-400 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Save products you love and find them here anytime.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 mb-10"
          >
            Browse Products
          </Link>

          <div className="w-full">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Explore Popular Categories
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Lighting Products", "Filters & Horn", "Gaskets", "Rear View Mirror", "Switches / Locks"].map((cat) => (
                <Link
                  key={cat}
                  to={`/products?search=${encodeURIComponent(cat)}`}
                  className="px-4 py-2 bg-white/60 hover:bg-white text-gray-700 hover:text-blue-600 rounded-full border border-gray-200 shadow-sm hover:shadow transition-all duration-200 text-sm font-medium"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">
          My Wishlist
        </h1>
        <p className="text-gray-500 mb-10">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ part }) =>
            part ? (
              <motion.div
                key={part._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden flex flex-col"
              >
                <Link to={`/products/${part._id}`} className="block">
                  <img
                    src={part.images?.[0]?.url || "https://via.placeholder.com/150"}
                    alt={part.name}
                    loading="lazy"
                    className="w-full h-48 object-cover bg-gray-50"
                  />
                </Link>
                <div className="p-5 flex-1 flex flex-col">
                  <Link to={`/products/${part._id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 capitalize mb-2 hover:text-blue-600 transition">
                      {part.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{Number(part.price).toLocaleString()}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        stockBadge(part.stock).cls
                      }`}
                    >
                      {stockBadge(part.stock).label}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(part)}
                      disabled={part.stock <= 0}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title={part.stock <= 0 ? "Out of stock" : "Add to cart"}
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(part._id)}
                      className="inline-flex items-center justify-center p-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-all"
                      aria-label="Remove from wishlist"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
