"use client";
import { FaEdit, FaTrash, FaImage } from "react-icons/fa";
import Image from "next/image";

export default function ProductGrid({ products, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => {
        const mainImage =
          product.images?.find((img) => img.IsMainImage) || product.images?.[0];

        return (
          <div
            key={product.ProductID}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="relative h-48 bg-gray-100">
              {mainImage ? (
                <Image
                  src={mainImage.ImageURL}
                  alt={mainImage.AltText || product.ProductName}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={index < 4}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <FaImage size={40} />
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.ProductName}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.Description}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-blue-600 font-bold">
                  {product.SellPrice?.toLocaleString("ar-SA")} ر.س
                </span>
                <span className="text-sm text-gray-500">
                  {product.CategoryName}
                </span>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                >
                  <FaEdit />
                  تعديل
                </button>
                <button
                  onClick={() => onDelete(product.ProductID)}
                  className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
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
