"use client";
import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  FaChartLine,
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

  // استخدام useQueries لجلب جميع البيانات بشكل متوازي
  const results = useQueries({
    queries: [
      {
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
      },
      {
        queryKey: ["products"],
        queryFn: async () => {
          const response = await fetch(
            "https://backend-v1-psi.vercel.app/product/",
            {
              headers: { accept: "application/json" },
            }
          );
          if (!response.ok) throw new Error("فشل في جلب المنتجات");
          return response.json();
        },
      },
      {
        queryKey: ["suppliers"],
        queryFn: async () => {
          const response = await fetch(
            "https://backend-v1-psi.vercel.app/suppliers/",
            {
              headers: { accept: "application/json" },
            }
          );
          if (!response.ok) throw new Error("فشل في جلب الموردين");
          return response.json();
        },
      },
      {
        queryKey: ["invoices"],
        queryFn: async () => {
          const response = await fetch(
            "https://backend-v1-psi.vercel.app/invoices/",
            {
              headers: { accept: "application/json" },
            }
          );
          if (!response.ok) throw new Error("فشل في جلب الفواتير");
          return response.json();
        },
      },
    ],
  });

  // التحقق من حالة التحميل والأخطاء
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const error = results.find((result) => result.error)?.error;

  // استخراج البيانات
  const [
    { data: orders = [] },
    { data: products = [] },
    { data: suppliers = [] },
    { data: invoices = [] },
  ] = results;

  // إذا كان هناك خطأ، اعرض رسالة الخطأ
  if (isError) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>حدث خطأ أثناء جلب البيانات</p>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  // حساب الإحصائيات بعد جلب البيانات
  const stats = {
    totalSales:
      orders?.reduce((sum, order) => sum + (order.TotalAmount || 0), 0) || 0,
    totalProducts: products?.length || 0,
    totalInvoices: invoices?.length || 0,
    totalSuppliers: suppliers?.length || 0,
  };

  // حساب المبيعات الشهرية
  const monthlySales = orders?.reduce((acc, order) => {
    const month = new Date(order.OrderDate).toLocaleString("ar-LY", {
      month: "long",
    });
    acc[month] = (acc[month] || 0) + (order.TotalAmount || 0);
    return acc;
  }, {});

  // حساب المنتجات الأكثر مبيعاً
  const topProducts = products?.slice(0, 5).map((product) => ({
    name: product.ProductName,
    sales: product.SellPrice || 0,
  }));

  // حساب توزيع المخزون حسب الأصناف
  const categoryDistribution = products?.reduce((acc, product) => {
    const category = product.CategoryName || "غير مصنف";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // حساب المنتات منخفضة المخزون
  const lowStock =
    products
      ?.filter((product) => product.Quantity < 10)
      .map((product) => ({
        productId: product.ProductID,
        productName: product.ProductName,
        currentStock: product.Quantity,
        minStock: 10,
      })) || [];

  // حساب حالة المدفوعات من الفواتير المتوفرة
  const paymentStats = {
    paid: invoices?.filter((inv) => inv.Status === "Paid").length || 0,
    unpaid: invoices?.filter((inv) => inv.Status === "Unpaid").length || 0,
    partiallyPaid:
      invoices?.filter((inv) => inv.Status === "Partially Paid").length || 0,
  };

  // تحليل الطلبات حسب الحالة
  const orderStatusAnalysis = orders?.reduce((acc, order) => {
    acc[order.Status] = (acc[order.Status] || 0) + 1;
    return acc;
  }, {});

  // تحليل المبيعات حسب الأيام
  const dailySalesAnalysis = orders?.reduce((acc, order) => {
    const day = new Date(order.OrderDate).toLocaleDateString("ar-LY", {
      weekday: "long",
    });
    acc[day] = {
      count: (acc[day]?.count || 0) + 1,
      total: (acc[day]?.total || 0) + (order.TotalAmount || 0),
    };
    return acc;
  }, {});

  // تحليل أداء الموردين
  const supplierPerformance = suppliers
    ?.map((supplier) => {
      const supplierInvoices = invoices?.filter(
        (inv) => inv.SupplierID === supplier.SupplierID
      );
      return {
        supplierName: supplier.SupplierName,
        totalInvoices: supplierInvoices?.length || 0,
        totalAmount:
          supplierInvoices?.reduce(
            (sum, inv) => sum + (inv.TotalAmount || 0),
            0
          ) || 0,
        paidAmount:
          supplierInvoices?.reduce((sum, inv) => sum + (inv.Paid || 0), 0) || 0,
      };
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  // تحليل المخزون
  const inventoryAnalysis = {
    lowStock: products?.filter((p) => p.Quantity < 10)?.length || 0,
    outOfStock: products?.filter((p) => p.Quantity === 0)?.length || 0,
    totalValue:
      products?.reduce(
        (sum, p) => sum + (p.Quantity || 0) * (p.SellPrice || 0),
        0
      ) || 0,
    averageValue:
      products?.reduce((sum, p) => sum + (p.SellPrice || 0), 0) /
      (products?.length || 1),
  };

  return (
    <QueryWrapper loading={isLoading}>
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
                  {stats.totalSales.toLocaleString("ar-LY")} د.ل
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
                  {stats.totalProducts}
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
                  {stats.totalInvoices}
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
                  {stats.totalSuppliers}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaUsers className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* مخطط المبيعات */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              المبيعات الشهرية
            </h2>
            <Line
              data={{
                labels: Object.keys(monthlySales),
                datasets: [
                  {
                    label: "المبيعات",
                    data: Object.values(monthlySales),
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
              المنتجات الأكثر مبيعً
            </h2>
            <Bar
              data={{
                labels: topProducts.map((item) => item.name),
                datasets: [
                  {
                    label: "المبيعات",
                    data: topProducts.map((item) => item.sales),
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
                labels: Object.keys(categoryDistribution),
                datasets: [
                  {
                    data: Object.values(categoryDistribution),
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
                      الحد ا��أدنى
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStock.map((item) => (
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

          {/* توزيع المدفوعات */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              توزيع المدفوعات
            </h2>
            <Pie
              data={{
                labels: ["مدفوع", "غير مدفوع", "مدفوع جزئياً"],
                datasets: [
                  {
                    data: [
                      paymentStats.paid,
                      paymentStats.unpaid,
                      paymentStats.partiallyPaid,
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
        </div>

        {/* تحليلات إضافية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* تحليل الطلبات حسب الحالة */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              تحليل الطلبات حسب الحالة
            </h2>
            <Bar
              data={{
                labels: Object.keys(orderStatusAnalysis).map((status) =>
                  status === "PENDING"
                    ? "قيد الانتظار"
                    : status === "PROCESSING"
                    ? "قيد المعالجة"
                    : status === "COMPLETED"
                    ? "مكتمل"
                    : status === "CANCELLED"
                    ? "ملغي"
                    : status
                ),
                datasets: [
                  {
                    label: "عدد الطلبات",
                    data: Object.values(orderStatusAnalysis),
                    backgroundColor: [
                      "rgba(234, 179, 8, 0.5)",
                      "rgba(59, 130, 246, 0.5)",
                      "rgba(34, 197, 94, 0.5)",
                      "rgba(239, 68, 68, 0.5)",
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

          {/* تحليل المبيعات اليومية */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              تحليل المبيعات حسب الأيام
            </h2>
            <Line
              data={{
                labels: Object.keys(dailySalesAnalysis),
                datasets: [
                  {
                    label: "إجمالي المبيعات",
                    data: Object.values(dailySalesAnalysis).map(
                      (day) => day.total
                    ),
                    borderColor: "rgb(59, 130, 246)",
                    yAxisID: "y1",
                  },
                  {
                    label: "عدد الطلبات",
                    data: Object.values(dailySalesAnalysis).map(
                      (day) => day.count
                    ),
                    borderColor: "rgb(34, 197, 94)",
                    yAxisID: "y2",
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
                scales: {
                  y1: {
                    type: "linear",
                    display: true,
                    position: "left",
                  },
                  y2: {
                    type: "linear",
                    display: true,
                    position: "right",
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }}
            />
          </div>

          {/* أداء الموردين */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              أفضل 5 موردين
            </h2>
            <div className="space-y-4">
              {supplierPerformance.map((supplier, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {supplier.supplierName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {supplier.totalInvoices} فاتورة | نسبة السداد:{" "}
                      {(
                        (supplier.paidAmount / supplier.totalAmount) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {supplier.totalAmount.toLocaleString("ar-LY")} د.ل
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* تحليل المخزون */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              تحليل المخزون
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">منتجات نفذت</p>
                <p className="text-2xl font-bold text-red-700">
                  {inventoryAnalysis.outOfStock}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">مخزون منخفض</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {inventoryAnalysis.lowStock}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg col-span-2">
                <p className="text-sm text-blue-600">قيمة المخزون</p>
                <p className="text-2xl font-bold text-blue-700">
                  {inventoryAnalysis.totalValue.toLocaleString("ar-LY")} د.ل
                </p>
                <p className="text-sm text-blue-500 mt-1">
                  متوسط قيمة المنتج:{" "}
                  {inventoryAnalysis.averageValue.toLocaleString("ar-LY")} د.ل
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* رسالة عن عدم توفر التقارير التفصيلية */}
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-center mb-6">
          التقارير التفصيلية والتصدير غير متوفرة حالياً
        </div>

        {/* إحصائيات إضافية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              معدل المبيعات
            </h3>
            <div className="text-3xl font-bold text-blue-600">
              {(stats.totalSales / (orders?.length || 1)).toLocaleString(
                "ar-LY",
                {
                  maximumFractionDigits: 2,
                }
              )}
              <span className="text-sm text-gray-500 mr-2">د.ل / طلب</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              متوسط قيمة المنتج
            </h3>
            <div className="text-3xl font-bold text-green-600">
              {(
                products?.reduce(
                  (acc, product) => acc + (product.SellPrice || 0),
                  0
                ) / (products?.length || 1)
              ).toLocaleString("ar-LY", {
                maximumFractionDigits: 2,
              })}
              <span className="text-sm text-gray-500 mr-2">د.ل</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              نسبة اكتمال الطلبات
            </h3>
            <div className="text-3xl font-bold text-purple-600">
              {(
                ((orders?.filter((order) => order.Status === "COMPLETED")
                  ?.length || 0) /
                  (orders?.length || 1)) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </div>
    </QueryWrapper>
  );
}
