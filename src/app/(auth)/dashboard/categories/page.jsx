"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import Modal from "@/components/shared/Modal";
import QueryWrapper from "@/components/shared/QueryWrapper";
import { showToast } from "@/utils/toast";

export default function Categories() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    CategoryName: "",
    Description: "",
  });
  const [editingId, setEditingId] = useState(null);

  // إضافة دالة resetForm
  const resetForm = () => {
    setFormData({
      CategoryName: "",
      Description: "",
    });
    setEditingId(null);
  };

  // جلب الأصناف مع عدد المنتجات
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories-with-count"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/categories/product-count/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب البيانات");
      return response.json();
    },
  });

  // تصفية الأصناف حسب البحث
  const filteredCategories = categories.filter((category) =>
    category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إضافة صنف جديد
  const addMutation = useMutation({
    mutationFn: async (newCategory) => {
      const toastId = showToast.loading("جاري إضافة الصنف...");
      try {
        const response = await fetch(
          "https://backend-v1-psi.vercel.app/categories/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(newCategory),
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في إضافة الصنف");
        }
        showToast.dismiss(toastId);
        showToast.success("تم إضافة الصنف بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-with-count"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // تعديل صنف
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const toastId = showToast.loading("جاري تحديث الصنف...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/categories/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          throw new Error("فشل في تحديث الصنف");
        }
        showToast.dismiss(toastId);
        showToast.success("تم تحديث الصنف بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-with-count"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // حذف صنف
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const toastId = showToast.loading("جاري حذف الصنف...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/categories/${id}`,
          {
            method: "DELETE",
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في حذف الصنف");
        }
        showToast.dismiss(toastId);
        showToast.success("تم حذف الصنف بنجاح");
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["categories-with-count"]),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      CategoryName: category.CategoryName,
      Description: category.Description || "",
    });
    setEditingId(category.CategoryID);
    setIsModalOpen(true);
  };

  return (
    <QueryWrapper loading={isLoading} error={error}>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaLayerGroup className="text-blue-600 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة الأصناف
              </h1>
            </div>
            <button
              onClick={() => {
                setFormData({ CategoryName: "", Description: "" });
                setEditingId(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md w-full md:w-auto justify-center"
            >
              <FaPlus />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          {/* شريط البحث */}
          <div className="mt-6">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الأصناف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}

        {/* جدول الأصناف */}
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
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      لا توجد أصناف متطابقة مع البحث
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
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
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                            title="تعديل"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.CategoryID)}
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

        {/* استخدام المودال */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingId ? "تعديل صنف" : "إضافة صنف جديد"}
          icon={FaLayerGroup}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                اسم الصنف <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.CategoryName}
                onChange={(e) =>
                  setFormData({ ...formData, CategoryName: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                required
                placeholder="أدخل اسم الصنف"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                الوصف
              </label>
              <textarea
                value={formData.Description}
                onChange={(e) =>
                  setFormData({ ...formData, Description: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                rows="4"
                placeholder="أدخل وصف الصنف"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
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
