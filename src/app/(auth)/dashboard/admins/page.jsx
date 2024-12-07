"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaUsers,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaClock,
  FaUserTag,
} from "react-icons/fa";
import Modal from "@/components/shared/Modal";
import QueryWrapper from "@/components/shared/QueryWrapper";
import { showToast } from "@/utils/toast";
import { superadmin } from "@/utils/api/superadmin";
import RoleGuard from "@/components/auth/RoleGuard";

export default function Admins() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // جلب المديرين
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: superadmin.getAdmins,
  });

  // إضافة مدير جديد
  const addMutation = useMutation({
    mutationFn: superadmin.addAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      setIsModalOpen(false);
      resetForm();
      showToast.success("تم إضافة المدير بنجاح");
    },
    onError: (error) => {
      showToast.error(error.message);
    },
  });

  // حذف مدير
  const deleteMutation = useMutation({
    mutationFn: superadmin.deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      showToast.success("تم حذف المدير بنجاح");
    },
    onError: (error) => {
      showToast.error(error.message);
    },
  });

  // تصفية المديرين
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المدير؟")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  // إضافة هذه الإحصائيات بعد تعريف filteredAdmins
  const adminStats = {
    total: admins.length,
    superadmins: admins.filter((admin) => admin.role === "superadmin").length,
    admins: admins.filter((admin) => admin.role === "admin").length,
    activeToday: admins.filter((admin) => {
      const lastLogin = new Date(admin.last_login);
      const today = new Date();
      return lastLogin.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <RoleGuard allowedRoles={["manager", "superadmin"]}>
      <QueryWrapper loading={isLoading}>
        <div className="p-6 max-w-[1400px] mx-auto">
          {/* رأس الصفحة */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <FaUsers className="text-blue-600 text-2xl" />
                <h1 className="text-2xl font-bold text-gray-900">
                  إدارة المديرين
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
                <span>إضافة مدير جديد</span>
              </button>
            </div>

            {/* أضافة قسم الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaUsers className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-sm text-gray-500">إجمالي المديرين</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {adminStats.total}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaUserTag className="text-purple-600 text-xl" />
                  </div>
                  <p className="text-sm text-gray-500">المديرين الرئيسيين</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {adminStats.superadmins}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaUserTag className="text-green-600 text-xl" />
                  </div>
                  <p className="text-sm text-gray-500">المديرين العاديين</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {adminStats.admins}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FaClock className="text-yellow-600 text-xl" />
                  </div>
                  <p className="text-sm text-gray-500">نشط اليوم</p>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {adminStats.activeToday}
                </p>
              </div>
            </div>

            {/* أدوات التصفية - تحديث التصميم */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث في المديرين..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>إجمالي النتائج:</span>
                  <span className="font-bold text-blue-600">
                    {filteredAdmins.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* جدول المديرين */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      آخر تسجيل دخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الدور
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {admin.username}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          {admin.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <FaClock className="text-gray-400" />
                          {new Date(admin.last_login).toLocaleString("ar-LY")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <FaUserTag className="text-gray-400" />
                          {admin.role}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-800"
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

          {/* مودال إضافة مدير */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              resetForm();
            }}
            title="إضافة مدير جديد"
            icon={FaUsers}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  اسم المستخدم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="أدخل اسم المستخدم"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="example@domain.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  كلمة المرور <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="أدخل كلمة المرور"
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
                  إضافة
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </QueryWrapper>
    </RoleGuard>
  );
}
