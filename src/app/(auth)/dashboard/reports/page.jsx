"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaChartLine,
  FaFileDownload,
  FaCalendar,
  FaBox,
  FaMoneyBill,
  FaShoppingCart,
  FaUsers,
  FaLayerGroup,
} from "react-icons/fa";
import { showToast } from "@/utils/toast";
import QueryWrapper from "@/components/shared/QueryWrapper";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// تسجيل مكونات ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // جلب إحصائيات المبيعات
  const { data: salesStats, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-stats", dateRange],
    queryFn: async () => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/reports/sales?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب إحصائيات المبيعات");
      return response.json();
    },
  });

  // جلب إحصائيات المخزون
  const { data: inventoryStats, isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/reports/inventory",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب إحصائيات المخزون");
      return response.json();
    },
  });

  // جلب إحصائيات الموردين
  const { data: supplierStats, isLoading: suppliersLoading } = useQuery({
    queryKey: ["supplier-stats"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/reports/suppliers",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب إحصائيات الموردين");
      return response.json();
    },
  });

  // تقرير الأرباح
  const { data: profitStats } = useQuery({
    queryKey: ["profit-stats", dateRange],
    queryFn: async () => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/reports/profits?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب إحصائيات الأرباح");
      return response.json();
    },
  });

  // تقرير المدفوعات
  const { data: paymentStats } = useQuery({
    queryKey: ["payment-stats", dateRange],
    queryFn: async () => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/reports/payments?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب إحصائيات المدفوعات");
      return response.json();
    },
  });

  // تقرير حركة المخزون
  const { data: stockMovement } = useQuery({
    queryKey: ["stock-movement", dateRange],
    queryFn: async () => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/reports/stock-movement?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب حركة المخزون");
      return response.json();
    },
  });

  // تصدير التقرير
  const handleExport = async (reportType) => {
    const toastId = showToast.loading("جاري تصدير التقرير...");
    try {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/reports/export/${reportType}?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في تصدير التقرير");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      showToast.dismiss(toastId);
      showToast.success("تم تصدير التقرير بنجاح");
    } catch (error) {
      showToast.dismiss(toastId);
      showToast.error(error.message);
    }
  };

  return (
    <QueryWrapper
      loading={salesLoading || inventoryLoading || suppliersLoading}
    >
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaChartLine className="text-blue-600 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-600">من:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="border rounded-lg p-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-600">إلى:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="border rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesStats?.totalSales?.toLocaleString("ar-LY")} د.ل
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaMoneyBill className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">عدد المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventoryStats?.totalProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaBox className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">عدد الفواتير</p>
                <p className="text-2xl font-bold text-gray-900">
                  {salesStats?.totalInvoices || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaShoppingCart className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">عدد الموردين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {supplierStats?.totalSuppliers || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaUsers className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* الرسوم البانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* مخطط المبيعات */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              المبيعات الشهرية
            </h2>
            <Line
              data={{
                labels:
                  salesStats?.monthlySales?.map((item) => item.month) || [],
                datasets: [
                  {
                    label: "المبيعات",
                    data:
                      salesStats?.monthlySales?.map((item) => item.total) || [],
                    borderColor: "rgb(59, 130, 246)",
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>

          {/* مخطط المنتجات الأكثر مبيعاً */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              المنتجات الأكثر مبيعاً
            </h2>
            <Bar
              data={{
                labels: salesStats?.topProducts?.map((item) => item.name) || [],
                datasets: [
                  {
                    label: "المبيعات",
                    data:
                      salesStats?.topProducts?.map((item) => item.sales) || [],
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>

          {/* توزيع المخزون حسب الأصناف */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              توزيع المخزون حسب الأصناف
            </h2>
            <Pie
              data={{
                labels:
                  inventoryStats?.categoryDistribution?.map(
                    (item) => item.category
                  ) || [],
                datasets: [
                  {
                    data:
                      inventoryStats?.categoryDistribution?.map(
                        (item) => item.count
                      ) || [],
                    backgroundColor: [
                      "#3B82F6",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>

          {/* المنتجات منخفضة المخزون */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                المنتجات منخفضة المخزون
              </h2>
              <button
                onClick={() => handleExport("low-stock")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <FaFileDownload />
                تصدير
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المنتج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المخزون الحالي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحد الأدنى
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryStats?.lowStock?.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.currentStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.minStock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* تقرير الأرباح */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>تحليل الأرباح</span>
              <button
                onClick={() => handleExport("profits")}
                className="text-blue-600 hover:text-blue-700"
              >
                <FaFileDownload />
              </button>
            </h2>
            <Line
              data={{
                labels:
                  profitStats?.monthlyProfits?.map((item) => item.month) || [],
                datasets: [
                  {
                    label: "الأرباح",
                    data:
                      profitStats?.monthlyProfits?.map((item) => item.profit) ||
                      [],
                    borderColor: "rgb(34, 197, 94)",
                    tension: 0.1,
                  },
                  {
                    label: "التكاليف",
                    data:
                      profitStats?.monthlyProfits?.map((item) => item.cost) ||
                      [],
                    borderColor: "rgb(239, 68, 68)",
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>

          {/* تقرير المدفوعات */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>تحليل المدفوعات</span>
              <button
                onClick={() => handleExport("payments")}
                className="text-blue-600 hover:text-blue-700"
              >
                <FaFileDownload />
              </button>
            </h2>
            <Pie
              data={{
                labels: ["مدفوع", "غير مدفوع", "مدفوع جزئياً"],
                datasets: [
                  {
                    data: [
                      paymentStats?.paid || 0,
                      paymentStats?.unpaid || 0,
                      paymentStats?.partiallyPaid || 0,
                    ],
                    backgroundColor: [
                      "rgb(34, 197, 94)",
                      "rgb(239, 68, 68)",
                      "rgb(234, 179, 8)",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>

          {/* تقرير حركة المخزون */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>حركة المخزون</span>
              <button
                onClick={() => handleExport("stock-movement")}
                className="text-blue-600 hover:text-blue-700"
              >
                <FaFileDownload />
              </button>
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المنتج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الوارد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الصادر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الرصيد
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockMovement?.movements?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        +{item.incoming}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -{item.outgoing}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* تقرير أداء الموردين */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>أداء الموردين</span>
              <button
                onClick={() => handleExport("supplier-performance")}
                className="text-blue-600 hover:text-blue-700"
              >
                <FaFileDownload />
              </button>
            </h2>
            <Bar
              data={{
                labels:
                  supplierStats?.performance?.map(
                    (item) => item.supplierName
                  ) || [],
                datasets: [
                  {
                    label: "قيمة المشتريات",
                    data:
                      supplierStats?.performance?.map(
                        (item) => item.totalPurchases
                      ) || [],
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* تقارير إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleExport("tax-report")}
            className="flex items-center justify-center gap-2 p-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <FaFileDownload />
            التقرير الضريبي
          </button>
          <button
            onClick={() => handleExport("product-movement")}
            className="flex items-center justify-center gap-2 p-4 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <FaFileDownload />
            حركة المنتجات
          </button>
          <button
            onClick={() => handleExport("financial-summary")}
            className="flex items-center justify-center gap-2 p-4 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <FaFileDownload />
            الملخص المالي
          </button>
        </div>

        {/* أزرار تصدير التقارير */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            تصدير التقارير
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleExport("sales")}
              className="flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FaFileDownload />
              تقرير المبيعات
            </button>
            <button
              onClick={() => handleExport("inventory")}
              className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FaFileDownload />
              تقرير المخزون
            </button>
            <button
              onClick={() => handleExport("suppliers")}
              className="flex items-center justify-center gap-2 p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FaFileDownload />
              تقرير الموردين
            </button>
          </div>
        </div>
      </div>
    </QueryWrapper>
  );
}
