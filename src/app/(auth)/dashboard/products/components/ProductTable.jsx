"use client";
import { FaEdit, FaTrash, FaImage } from "react-icons/fa";
import Image from "next/image";

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصورة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم المنتج
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصنف
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                السعر
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const mainImage =
                product.images?.find((img) => img.IsMainImage) ||
                product.images?.[0];
              return (
                <tr
                  key={product.ProductID}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    !product.IsActive ? "bg-gray-50" : ""
                  }`}
                  onClick={() => onEdit(product)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-16 w-16">
                      {mainImage ? (
                        <Image
                          src={mainImage.ImageURL}
                          alt={mainImage.AltText || product.ProductName}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded">
                          <FaImage className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm font-medium text-gray-900 truncate max-w-[200px]"
                      title={product.ProductName}
                    >
                      {product.ProductName}
                    </div>
                    <div
                      className="text-sm text-gray-500 truncate max-w-[200px]"
                      title={product.Description || "لا يوجد وصف"}
                    >
                      {product.Description || "لا يوجد وصف"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div
                      className="truncate max-w-[150px]"
                      title={product.CategoryName}
                    >
                      {product.CategoryName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {product.SellPrice
                      ? `${product.SellPrice?.toLocaleString("ar-LY")} د.ل`
                      : "السعر غير محدد"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.IsActive ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
                        نشط
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1.5 rounded-full border border-red-200">
                        غير نشط
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.SKU}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div
                      className="flex gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                        title="تعديل"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(product.ProductID)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-150"
                        title="حذف"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
