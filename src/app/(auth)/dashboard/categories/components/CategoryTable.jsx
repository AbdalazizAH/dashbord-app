"use client";
import { FaLayerGroup, FaEdit, FaTrash } from "react-icons/fa";

export default function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم الصنف
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الوصف
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عدد المنتجات
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاريخ الإنشاء
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  لا توجد أصناف متطابقة مع البحث
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.CategoryID}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    <div className="flex items-center">
                      <FaLayerGroup className="text-blue-600 ml-2" />
                      {category.CategoryName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {category.Description || "لا يوجد وصف"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {category.ProductCount} منتج
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {new Date(category.created_date).toLocaleDateString(
                      "ar-SA",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                        title="تعديل"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(category.CategoryID)}
                        className={`text-red-600 hover:text-red-800 transition-colors duration-150 ${
                          category.ProductCount > 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title={
                          category.ProductCount > 0
                            ? "لا يمكن حذف صنف يحتوي على منتجات"
                            : "حذف"
                        }
                        disabled={category.ProductCount > 0}
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
