"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  FaShoppingCart,
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaFilter,
  FaCalendar,
} from "react-icons/fa";
import QueryWrapper from "@/components/shared/QueryWrapper";
import { showToast } from "@/utils/toast";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusTranslations = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default function Orders() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // جلب الطلبات
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/orders/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب الطلبات");
      return response.json();
    },
  });

  // تصفية الطلبات
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.OrderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.Status === statusFilter;

    const orderDate = new Date(order.OrderDate);
    const matchesDate =
      (!dateFilter.startDate || orderDate >= new Date(dateFilter.startDate)) &&
      (!dateFilter.endDate || orderDate <= new Date(dateFilter.endDate));

    return matchesSearch && matchesStatus && matchesDate;
  });

  // إحصائيات الطلبات
  const orderStats = {
    total: orders.length,
    pending: orders.filter((order) => order.Status === "pending").length,
    processing: orders.filter((order) => order.Status === "processing").length,
    completed: orders.filter((order) => order.Status === "completed").length,
    cancelled: orders.filter((order) => order.Status === "cancelled").length,
  };

  // حساب إجمالي المبيعات
  const totalSales = filteredOrders.reduce((sum, order) => {
    if (order.Status !== "cancelled") {
      return sum + order.TotalAmount;
    }
    return sum;
  }, 0);

  return (
    <QueryWrapper loading={isLoading}>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaShoppingCart className="text-blue-600 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة الطلبات
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FaFilter />
                <span>تصفية</span>
              </button>
            </div>
          </div>

          {/* إحصائيات الطلبات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">إجمالي الطلبات</div>
              <div className="text-2xl font-bold text-gray-900">
                {orderStats.total}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-600">قيد الانتظار</div>
              <div className="text-2xl font-bold text-yellow-700">
                {orderStats.pending}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">قيد المعالجة</div>
              <div className="text-2xl font-bold text-blue-700">
                {orderStats.processing}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">مكتملة</div>
              <div className="text-2xl font-bold text-green-700">
                {orderStats.completed}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600">ملغية</div>
              <div className="text-2xl font-bold text-red-700">
                {orderStats.cancelled}
              </div>
            </div>
          </div>

          {/* قسم التصفية */}
          {isFilterOpen && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البحث
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="البحث في الطلبات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="processing">قيد المعالجة</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التاريخ
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) =>
                        setDateFilter({
                          ...dateFilter,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) =>
                        setDateFilter({
                          ...dateFilter,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ملخص النتائج */}
          <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
            <div>عدد النتائج: {filteredOrders.length}</div>
            <div>إجمالي المبيعات: {totalSales.toLocaleString("ar-LY")} د.ل</div>
          </div>
        </div>

        {/* جدول الطلبات */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المبلغ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.OrderId}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/orders/${order.OrderId}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.OrderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.CustomerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.CustomerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.TotalAmount.toLocaleString("ar-LY")} د.ل
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.OrderDate).toLocaleDateString("ar-LY")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.OrderDate).toLocaleTimeString("ar-LY")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[order.Status]
                        }`}
                      >
                        {statusTranslations[order.Status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/orders/${order.OrderId}`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="عرض التفاصيل"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </QueryWrapper>
  );
}
