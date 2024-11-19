"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaUsers,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCity,
  FaShoppingCart,
} from "react-icons/fa";
import Modal from "@/components/shared/Modal";
import QueryWrapper from "@/components/shared/QueryWrapper";
import { showToast } from "@/utils/toast";

export default function Customers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    CustomerName: "",
    CustomerPhone: "",
    Email: "",
    Address: "",
    City: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState("all");

  // جلب العملاء
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/customers/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب العملاء");
      return response.json();
    },
  });

  // إضافة عميل جديد
  const addMutation = useMutation({
    mutationFn: async (newCustomer) => {
      const toastId = showToast.loading("جاري إضافة العميل...");
      try {
        const response = await fetch(
          "https://backend-v1-psi.vercel.app/customers/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(newCustomer),
          }
        );
        if (!response.ok) {
          const error = await response.json();
          showToast.error(error.detail || "فشل في إضافة العميل");
        }
        showToast.dismiss(toastId);
        showToast.success("تم إضافة العميل بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // تحديث عميل
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const toastId = showToast.loading("جاري تحديث بيانات العميل...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/customers/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          const error = await response.json();
          showToast.error(error.detail || "فشل في تحديث بيانات العميل");
        }
        showToast.dismiss(toastId);
        showToast.success("تم تحديث بيانات العميل بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // حذف عميل
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const toastId = showToast.loading("جاري حذف العميل...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/customers/${id}`,
          {
            method: "DELETE",
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) {
          const error = await response.json();
          showToast.error(error.detail || "فشل في حذف العميل");
        }
        showToast.dismiss(toastId);
        showToast.success("تم حذف العميل بنجاح");
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["customers"]),
  });

  // تصفية العملاء
  //   const filteredCustomers = customers.filter((customer) => {
  //     const matchesSearch =
  //       customer.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       customer.CustomerPhone.includes(searchTerm) ||
  //       customer.Email.toLowerCase().includes(searchTerm.toLowerCase());

  //     const matchesCity = cityFilter === "all" || customer.City === cityFilter;

  //     return matchesSearch && matchesCity;
  //   });

  // استخراج المدن الفريدة
  //   const uniqueCities = [...new Set(customers.map((customer) => customer.City))];

  // إحصائيات العملاء
  //   const customerStats = {
  //     total: customers.length,
  //     withOrders: customers.filter((customer) => customer.Orders?.length > 0)
  //       .length,
  //     newThisMonth: customers.filter(
  //       (customer) =>
  //         new Date(customer.created_date).getMonth() === new Date().getMonth()
  //     ).length,
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      CustomerName: customer.CustomerName,
      CustomerPhone: customer.CustomerPhone,
      Email: customer.Email,
      Address: customer.Address,
      City: customer.City,
    });
    setEditingId(customer.CustomerId);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      CustomerName: "",
      CustomerPhone: "",
      Email: "",
      Address: "",
      City: "",
    });
    setEditingId(null);
  };

  return (
    <QueryWrapper loading={isLoading}>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaUsers className="text-blue-600 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة العملاء
              </h1>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-200"
            >
              <FaPlus />
              <span>إضافة عميل جديد</span>
            </button>
          </div>

          {/* إحصائيات العملاء */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">إجمالي العملاء</div>
              <div className="text-2xl font-bold text-blue-700">
                {customerStats.total}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">عملاء لديهم طلبات</div>
              <div className="text-2xl font-bold text-green-700">
                {customerStats.withOrders}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">عملاء جدد هذا الشهر</div>
              <div className="text-2xl font-bold text-purple-700">
                {customerStats.newThisMonth}
              </div>
            </div>
          </div> */}

          {/* أدوات التصفية */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع المدن</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select> */}
          </div>
        </div>

        {/* جدول العملاء */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    معلومات الاتصال
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الطلبات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              {/* <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.CustomerId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.CustomerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        منذ{" "}
                        {new Date(customer.created_date).toLocaleDateString(
                          "ar-LY"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          {customer.CustomerPhone}
                        </div>
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          {customer.Email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FaCity className="text-gray-400" />
                          {customer.City}
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {customer.Address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaShoppingCart className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {customer.Orders?.length || 0} طلبات
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-800"
                          title="تعديل"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.CustomerId)}
                          className="text-red-600 hover:text-red-800"
                          title="حذف"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody> */}
            </table>
          </div>
        </div>

        {/* مودال إضافة/تعديل عميل */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
          icon={FaUsers}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  اسم العميل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.CustomerName}
                  onChange={(e) =>
                    setFormData({ ...formData, CustomerName: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="أدخل اسم العميل"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.CustomerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, CustomerPhone: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) =>
                    setFormData({ ...formData, Email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="example@domain.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  المدينة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.City}
                  onChange={(e) =>
                    setFormData({ ...formData, City: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="أدخل اسم المدينة"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                العنوان <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.Address}
                onChange={(e) =>
                  setFormData({ ...formData, Address: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
                placeholder="أدخل العنوان التفصيلي"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? "تحديث" : "إضافة"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </QueryWrapper>
  );
}
