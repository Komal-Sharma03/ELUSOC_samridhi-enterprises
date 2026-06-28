import React from "react";
import PropTypes from "prop-types";

const ProductSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-pulse"
        >
          {/* Image placeholder */}
          <div className="w-full h-44 bg-gray-200" />
          
          <div className="p-3 sm:p-4 flex-1">
            {/* Title & Badge */}
            <div className="flex items-start justify-between mb-2">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>

            {/* Sub-details */}
            <div className="space-y-3 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-5 bg-gray-200 rounded w-1/5" />
              </div>

              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>

          {/* Button placeholder */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 mt-auto">
            <div className="h-9 bg-gray-200 rounded-lg w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

ProductSkeleton.propTypes = {
  count: PropTypes.number,
};

export default ProductSkeleton;
