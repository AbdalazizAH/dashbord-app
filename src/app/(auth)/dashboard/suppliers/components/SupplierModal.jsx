import { FaUserTie, FaPlus, FaEdit } from "react-icons/fa";
import Modal from "@/components/shared/Modal";

export default function SupplierModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editingId,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "تعديل مورد" : "إضافة مورد جديد"}
      icon={FaUserTie}
    >
      <form onSubmit={onSubmit} className="space-y-6">
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
            onClick={onClose}
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
  );
}
