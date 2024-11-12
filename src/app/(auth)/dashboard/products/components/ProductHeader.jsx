"use client";
import { FaBox, FaPlus, FaSearch, FaTable, FaThLarge } from "react-icons/fa";

export default function ProductHeader({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  onAddNew,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FaBox className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600"
              }`}
              title="عرض شبكي"
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600"
              }`}
              title="عرض جدول"
            >
              <FaTable />
            </button>
          </div>
          <button
            onClick={onAddNew}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <FaPlus />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المنتجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}
