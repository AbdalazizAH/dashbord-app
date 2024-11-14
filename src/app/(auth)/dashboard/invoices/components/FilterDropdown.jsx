"use client";
import { FaFilter } from "react-icons/fa";

export default function FilterDropdown({ filters, setFilters, suppliers }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-blue-600" />
        <h3 className="font-medium text-gray-900">تصفية الفواتير</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            حالة الدفع
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full p-2 border rounded-lg text-gray-900 bg-white"
          >
            <option value="all">جميع الفواتير</option>
            <option value="paid">الفواتير المدفوعة</option>
            <option value="unpaid">الفواتير غير المدفوعة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            حالة الإكمال
          </label>
          <select
            value={filters.completion}
            onChange={(e) =>
              setFilters({ ...filters, completion: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-gray-900 bg-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="completed">الفواتير المكتملة</option>
            <option value="incomplete">الفواتير غير المكتملة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المورد
          </label>
          <select
            value={filters.supplier}
            onChange={(e) =>
              setFilters({ ...filters, supplier: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-gray-900 bg-white"
          >
            <option value="all">جميع الموردين</option>
            {suppliers.map((supplier) => (
              <option key={supplier.SupplierID} value={supplier.SupplierID}>
                {supplier.SupplierName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
