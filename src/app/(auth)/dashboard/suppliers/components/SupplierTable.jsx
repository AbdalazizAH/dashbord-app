import {
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function SupplierTable({ suppliers, onEdit, onDelete }) {
  return (
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
            {suppliers.map((supplier) => (
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
                      onClick={() => onEdit(supplier)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                      title="تعديل"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(supplier.SupplierID)}
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
  );
}
