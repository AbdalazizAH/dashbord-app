"use client";
import { FaEdit, FaTrash, FaImage } from "react-icons/fa";
import Image from "next/image";

export default function ProductGrid({ products, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {products.map((product, index) => {
        const mainImage =
          product.images?.find((img) => img.IsMainImage) || product.images?.[0];

        return (
          <div
            key={product.ProductID}
            className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer ${
              !product.IsActive ? "opacity-75 hover:opacity-90" : ""
            }`}
            onClick={() => onEdit(product)}
          >
            <div className="relative h-56 bg-gray-50">
              {mainImage ? (
                <Image
                  src={mainImage.ImageURL}
                  alt={mainImage.AltText || product.ProductName}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority={index < 4}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <FaImage size={48} />
                </div>
              )}
              <div className="absolute top-3 right-3">
                {!product.IsActive ? (
                  <span className="bg-red-100/90 backdrop-blur-sm text-red-800 text-xs font-medium px-3 py-1.5 rounded-full border border-red-200">
                    غير نشط
                  </span>
                ) : (
                  <span className="bg-green-100/90 backdrop-blur-sm text-green-800 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
                    نشط
                  </span>
                )}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                {product.ProductName}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 text-justify truncate">
                {product.Description || "لا يوجد وصف"}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-blue-600 font-bold text-lg">
                  {product.SellPrice?.toLocaleString("ar-LY")} د.ل
                </span>
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {product.CategoryName}
                </span>
              </div>

              <div
                className="flex gap-3 pt-4 border-t border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2.5 rounded-lg transition-colors font-medium"
                >
                  <FaEdit />
                  تعديل
                </button>
                <button
                  onClick={() => onDelete(product.ProductID)}
                  className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2.5 rounded-lg transition-colors font-medium"
                >
                  <FaTrash />
                  حذف
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
