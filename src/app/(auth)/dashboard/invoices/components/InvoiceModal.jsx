import { FaFileInvoiceDollar } from "react-icons/fa";
import Modal from "@/components/shared/Modal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function InvoiceModal({
  isOpen,
  onClose,
  editingId,
  formData,
  setFormData,
  newItem,
  setNewItem,
  products,
  suppliers,
  handleSubmit,
  handleAddItem,
  handleRemoveItem,
  calculateTotal,
  isSubmitting,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingId ? "تعديل فاتورة" : "إضافة فاتورة جديدة"}
      icon={FaFileInvoiceDollar}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* البيانات الأساسية */}
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الفاتورة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.InvoiceName}
              onChange={(e) =>
                setFormData({ ...formData, InvoiceName: e.target.value })
              }
              className="w-full p-2.5 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              required
              placeholder="أدخل رقم الفاتورة"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المورد <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.SupplierID}
              onChange={(e) =>
                setFormData({ ...formData, SupplierID: e.target.value })
              }
              className="w-full p-2.5 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر المورد</option>
              {suppliers.map((supplier) => (
                <option key={supplier.SupplierID} value={supplier.SupplierID}>
                  {supplier.SupplierName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* إضافة المنتجات - تظهر فقط في حالة إنشاء فاتورة جديدة */}
        {!editingId && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">إضافة منتجات</h3>
              <div className="text-sm text-gray-500">
                {formData.items.length} منتجات مضافة
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-2">
                <select
                  value={newItem.ProductID}
                  onChange={(e) =>
                    setNewItem({ ...newItem, ProductID: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر المنتج</option>
                  {products.map((product) => (
                    <option key={product.ProductID} value={product.ProductID}>
                      {product.ProductName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  value={newItem.Quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, Quantity: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="الكمية"
                  min="1"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={newItem.BuyPrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, BuyPrice: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="سعر الشراء"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={newItem.SellPrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, SellPrice: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="سعر البيع"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full h-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  disabled={
                    !newItem.ProductID ||
                    !newItem.Quantity ||
                    !newItem.BuyPrice ||
                    !newItem.SellPrice
                  }
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* جدول المنتجات المضافة */}
            {formData.items.length > 0 && (
              <div className="mt-4 bg-white rounded-lg border overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                          المنتج
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                          الكمية
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                          سعر الشراء
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                          سعر البيع
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                          الإجمالي
                        </th>
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.ProductName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.Quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.BuyPrice} د.ل
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.SellPrice} د.ل
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.TotalPrice.toLocaleString("ar-LY")} د.ل
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* معلومات الدفع */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900">معلومات الدفع</h3>
            {editingId && (
              <div className="text-sm text-gray-500">
                المبلغ المدفوع سابقاً: {formData.previousPaid} د.ل
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المبلغ المدفوع
            </label>
            <input
              type="number"
              value={formData.Paid}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Paid: e.target.value,
                })
              }
              className="w-full p-2.5 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* ملخص الفاتورة */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">عدد المنتجات</p>
              <p className="font-medium text-gray-900">{formData.items.length}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-gray-500">الإجمالي النهائي</p>
              <p className="text-xl font-bold text-blue-600">
                {calculateTotal(formData.items).toLocaleString("ar-LY")} د.ل
              </p>
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!editingId && formData.items.length === 0)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isSubmitting || (!editingId && formData.items.length === 0)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="small" text={null} />
                جاري الحفظ...
              </span>
            ) : editingId ? (
              "تحديث"
            ) : (
              "إضافة"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
} 