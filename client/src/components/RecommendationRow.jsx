import React from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";


const RecommendationRow = ({ title, description, icon, products, onProductClick }) => {
  if (!products || products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12 bg-white rounded-3xl shadow-xl overflow-hidden"
    >
      <div className="p-8 lg:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          {icon}
          {title}
        </h2>
        <p className="text-gray-600 mb-8">{description}</p>

        {/* Horizontal Scrollable Grid */}
        <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-blue-200">
          {products.map((item) => (
            <Link
              key={item._id}
              to={`/products/${item._id}`}
              className="flex-shrink-0 w-56"
              onClick={() => {
                if (onProductClick) onProductClick(item._id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={item.images?.[0]?.url || "/images/placeholder.jpg"}
                    alt={item.name || "Product"}
                    loading="lazy"
                    className="w-full h-40 object-cover"
                  />
                  {item.bestseller && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Bestseller
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 capitalize min-h-[3rem]">
                    {item.name || "Unknown Product"}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      ₹{item.price?.toLocaleString() || "0"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.stock > 15
                          ? "bg-green-100 text-green-800"
                          : item.stock >= 5
                          ? "bg-yellow-100 text-yellow-800"
                          : item.stock > 0
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {item.category}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationRow;