"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUserTie,
  FaSearch,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Modal from "@/components/shared/Modal";
import QueryWrapper from "@/components/shared/QueryWrapper";

export default function Suppliers() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    SupplierName: "",
    ContactPerson: "",
    PhoneNumber: "",
    Email: "",
    Address: "",
  });
  const [editingId, setEditingId] = useState(null);

  // جلب الموردين
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({
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
  });

  // تصفية الموردين حسب البحث
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.SupplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.ContactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.Email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إضافة مورد جديد
  const addMutation = useMutation({
    mutationFn: async (newSupplier) => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/suppliers/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(newSupplier),
        }
      );
      if (!response.ok) throw new Error("فشل في إضافة المورد");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => setError(error.message),
  });

  // تحديث مورد
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/suppliers/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("فشل في تحديث المورد");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => setError(error.message),
  });

  // حذف مورد
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/suppliers/${id}`,
        {
          method: "DELETE",
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في حذف المورد");
    },
    onSuccess: () => queryClient.invalidateQueries(["suppliers"]),
    onError: (error) => setError(error.message),
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
    if (window.confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      SupplierName: supplier.SupplierName,
      ContactPerson: supplier.ContactPerson,
      PhoneNumber: supplier.PhoneNumber,
      Email: supplier.Email,
      Address: supplier.Address,
    });
    setEditingId(supplier.SupplierID);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      SupplierName: "",
      ContactPerson: "",
      PhoneNumber: "",
      Email: "",
      Address: "",
    });
    setEditingId(null);
  };

  return (
    <QueryWrapper loading={isLoading} error={error}>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-6">
          {/* رأس الصفحة */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <FaUserTie className="text-blue-600 text-2xl" />
                <h1 className="text-2xl font-bold text-gray-900">
                  إدارة الموردين
                </h1>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md w-full md:w-auto justify-center"
              >
                <FaPlus />
                <span>إضافة مورد جديد</span>
              </button>
            </div>

            {/* شريط البحث */}
            <div className="mt-6">
              <div className="relative">
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الموردين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* جدول الموردين */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم المورد
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الشخص المسؤول
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      معلومات الاتصال
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العنوان
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr
                      key={supplier.SupplierID}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {supplier.SupplierName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {supplier.ContactPerson}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-400" />
                            {supplier.PhoneNumber}
                          </div>
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            {supplier.Email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {supplier.Address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                            title="تعديل"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.SupplierID)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-150"
                            title="حذف"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingId ? "تعديل مورد" : "إضافة مورد جديد"}
          icon={FaUserTie}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  اسم المورد <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.SupplierName}
                  onChange={(e) =>
                    setFormData({ ...formData, SupplierName: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                  required
                  placeholder="أدخل اسم المورد"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  الشخص المسؤول <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ContactPerson}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ContactPerson: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                  required
                  placeholder="أدخل اسم الشخص المسؤول"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.PhoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, PhoneNumber: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                  required
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) =>
                    setFormData({ ...formData, Email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                  required
                  placeholder="example@domain.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                العنوان <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.Address}
                onChange={(e) =>
                  setFormData({ ...formData, Address: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                rows="3"
                required
                placeholder="أدخل العنوان التفصيلي"
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
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                {editingId ? (
                  <>
                    <FaEdit /> تحديث
                  </>
                ) : (
                  <>
                    <FaPlus /> إضافة
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </QueryWrapper>
  );
}
