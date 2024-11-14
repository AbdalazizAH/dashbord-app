"use client";
import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaMoneyBill,
} from "react-icons/fa";

export default function InvoiceStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaFileInvoiceDollar className="text-blue-600 text-xl" />
          </div>
          <p className="text-sm text-gray-500">إجمالي الفواتير</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaMoneyBillWave className="text-green-600 text-xl" />
          </div>
          <p className="text-sm text-gray-500">الفواتير المدفوعة</p>
        </div>
        <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <FaMoneyBill className="text-red-600 text-xl" />
          </div>
          <p className="text-sm text-gray-500">الفواتير غير المدفوعة</p>
        </div>
        <p className="text-2xl font-bold text-red-600">{stats.unpaid}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaCheckCircle className="text-blue-600 text-xl" />
          </div>
          <p className="text-sm text-gray-500">الفواتير المكتملة</p>
        </div>
        <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <FaTimesCircle className="text-yellow-600 text-xl" />
          </div>
          <p className="text-sm text-gray-500">الفواتير غير المكتملة</p>
        </div>
        <p className="text-2xl font-bold text-yellow-600">{stats.incomplete}</p>
      </div>
    </div>
  );
}
