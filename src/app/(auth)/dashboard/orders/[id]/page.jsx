"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import {
  FaArrowRight,
  FaBox,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCity,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaPrint,
} from "react-icons/fa";
import QueryWrapper from "@/components/shared/QueryWrapper";
import { showToast } from "@/utils/toast";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusTranslations = {
  PENDING: "قيد الانتظار",
  PROCESSING: "قيد المعالجة",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

// تحديث قائمة الحالات المتاحة
const availableStatuses = {
  PENDING: {
    next: ["PROCESSING", "COMPLETED", "CANCELLED"],
    color: "bg-yellow-100 text-yellow-800",
    icon: FaSpinner,
    label: "قيد الانتظار",
  },
  PROCESSING: {
    next: ["PENDING", "COMPLETED", "CANCELLED"],
    color: "bg-blue-100 text-blue-800",
    icon: FaSpinner,
    label: "قيد المعالجة",
  },
  COMPLETED: {
    next: ["PENDING", "PROCESSING", "CANCELLED"],
    color: "bg-green-100 text-green-800",
    icon: FaCheck,
    label: "مكتمل",
  },
  CANCELLED: {
    next: ["PENDING", "PROCESSING", "COMPLETED"],
    color: "bg-red-100 text-red-800",
    icon: FaTimes,
    label: "ملغي",
  },
};

// Add new status configurations for items
const itemStatusColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  UNAVAILABLE: "bg-red-100 text-red-800",
  NONE: "bg-gray-100 text-gray-800",
};

const itemStatusTranslations = {
  AVAILABLE: "متوفر",
  UNAVAILABLE: "غير متوفر",
  NONE: "غير محدد",
};

export default function OrderDetails({ params }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: orderId } = React.use(params);

  // جلب تفاصيل الطلب
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/orders/${orderId}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب تفاصيل الطلب");
      return response.json();
    },
  });

  // تحديث حالة الطلب
  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      const toastId = showToast.loading("جاري تحديث حالة الطلب...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/orders/${orderId}/status?status=${status}`,
          {
            method: "PUT",
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("فشل في تحديث حالة الطلب");
        showToast.dismiss(toastId);
        showToast.success("تم تحديث حالة الطلب بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
    },
  });

  // Add new mutation for updating item status
  const updateItemStatusMutation = useMutation({
    mutationFn: async ({ itemId, status }) => {
      const toastId = showToast.loading("جاري تحديث حالة المنتج...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/orders/${orderId}/items/${itemId}/status?status=${status}`,
          {
            method: "PUT",
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("فشل في تحديث حالة المنتج");
        showToast.dismiss(toastId);
        showToast.success("تم تحديث حالة المنتج بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["order", orderId]);
    },
  });

  const handlePrint = () => {
    window.print();
  };

  // إضافة حالة لإظهار/إخفاء القائمة المنسدلة
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // تحديث دالة معالجة تغيير الحالة
  const handleStatusChange = (newStatus) => {
    if (
      window.confirm(
        `هل أنت متأكد من تغيير حالة الطلب إلى ${statusTranslations[newStatus]}؟`
      )
    ) {
      updateStatusMutation.mutate(newStatus);
    }
    setShowStatusDropdown(false);
  };

  // Add handler for item status change
  const handleItemStatusChange = (itemId, newStatus) => {
    if (
      window.confirm(
        `هل أنت متأكد من تغيير حالة المنتج إلى ${itemStatusTranslations[newStatus]}؟`
      )
    ) {
      updateItemStatusMutation.mutate({ itemId, status: newStatus });
    }
  };

  return (
    <QueryWrapper loading={isLoading}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowRight />
              <span>رجوع</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <FaPrint />
              <span>طباعة</span>
            </button>
          </div>

          {order && (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    طلب #{order.OrderNumber}
                  </h1>
                  <p className="text-gray-500">
                    {new Date(order.OrderDate).toLocaleDateString("ar-LY", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {/* تحديث قسم حالة الطلب */}
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                        availableStatuses[order.Status].color
                      }`}
                    >
                      {React.createElement(
                        availableStatuses[order.Status].icon
                      )}
                      {availableStatuses[order.Status].label}
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* القائمة المنسدلة للحالات */}
                    {showStatusDropdown && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
                          {Object.entries(availableStatuses)
                            .filter(([key]) => key !== order.Status) // استثناء الحالة الحالية
                            .map(([status, data]) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`w-full text-right px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                                  status === "CANCELLED"
                                    ? "text-red-600 hover:bg-red-50"
                                    : status === "COMPLETED"
                                    ? "text-green-600 hover:bg-green-50"
                                    : status === "PROCESSING"
                                    ? "text-blue-600 hover:bg-blue-50"
                                    : "text-yellow-600 hover:bg-yellow-50"
                                }`}
                                role="menuitem"
                              >
                                {React.createElement(data.icon, {
                                  className: "w-4 h-4",
                                })}
                                {data.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* معلومات العميل */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  معلومات العميل
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">الاسم</p>
                      <p className="font-medium">{order.CustomerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                      <p className="font-medium">{order.CustomerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                      <p className="font-medium">{order.Email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCity className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">المدينة</p>
                      <p className="font-medium">{order.City}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 col-span-2">
                    <FaMapMarkerAlt className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">العنوان</p>
                      <p className="font-medium">{order.Address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* المنتجات */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <h2 className="text-lg font-bold text-gray-900 p-6 border-b">
                  المنتجات
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          المنتج
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          الكمية
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          السعر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          الإجمالي
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          الحالة
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.Items.map((item) => (
                        <tr key={item.OrderItemId}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FaBox className="text-blue-600 ml-2" />
                              <span className="font-medium">
                                {item.ProductName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{item.Quantity}</td>
                          <td className="px-6 py-4">
                            {item.Price.toLocaleString("ar-LY")} د.ل
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {item.Total.toLocaleString("ar-LY")} د.ل
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={item.Status || "NONE"}
                              onChange={(e) =>
                                handleItemStatusChange(
                                  item.OrderItemId,
                                  e.target.value
                                )
                              }
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                itemStatusColors[item.Status || "NONE"]
                              }`}
                            >
                              <option value="NONE">غير محدد</option>
                              <option value="AVAILABLE">متوفر</option>
                              <option value="UNAVAILABLE">غير متوفر</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ملخص الطلب */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">إجمالي المنتجات</span>
                  <span className="font-medium">
                    {order.Items.length} منتجات
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4 text-xl font-bold">
                  <span className="text-gray-900">المبلغ الإجمالي</span>
                  <span className="text-blue-600">
                    {order.TotalAmount.toLocaleString("ar-LY")} د.ل
                  </span>
                </div>
                {order.Notes && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">
                      ملاحظات
                    </h3>
                    <p className="text-yellow-700">{order.Notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </QueryWrapper>
  );
}
