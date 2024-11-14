"use client";
import { useState } from "react";
import { FaBox, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import Modal from "@/components/shared/Modal";

export default function InvoiceItemsModal({
  isOpen,
  onClose,
  invoice,
  products = [],
  onSave,
  existingItems = [],
}) {
  const [items, setItems] = useState(existingItems);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || !buyPrice || !sellPrice) return;

    const product = products.find((p) => p.ProductID === selectedProduct);
    const totalPrice = Number(quantity) * Number(buyPrice);

    const newItem = {
      ProductID: selectedProduct,
      ProductName: product.ProductName,
      Quantity: Number(quantity),
      BuyPrice: Number(buyPrice),
      SellPrice: Number(sellPrice),
      TotalPrice: totalPrice,
      IsPurchased: true,
    };

    setItems([...items, newItem]);
    resetForm();
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedProduct("");
    setQuantity("");
    setBuyPrice("");
    setSellPrice("");
  };

  const handleSave = async () => {
    try {
      // تجميع كل العناصر الجديدة في مصفوفة واحدة
      const newItems = items
        .filter((item) => !item.InvoiceItemID)
        .map((item) => ({
          ProductID: item.ProductID,
          Quantity: item.Quantity,
          BuyPrice: item.BuyPrice,
          SellPrice: item.SellPrice,
        }));

      // إرسال كل العناصر الجديدة في طلب واحد
      if (newItems.length > 0) {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${invoice.InvoiceID}/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(newItems), // إرسال المصفوفة مباشرة
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في إضافة العناصر");
        }
      }

      // تحديث العناصر الموجودة
      const existingItems = items.filter((item) => item.InvoiceItemID);
      for (const item of existingItems) {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${invoice.InvoiceID}/items/${item.InvoiceItemID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({
              Quantity: item.Quantity,
              BuyPrice: item.BuyPrice,
              SellPrice: item.SellPrice,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في تحديث العناصر");
        }
      }

      onSave(items);
    } catch (error) {
      console.error("Error saving items:", error);
      throw error;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تفاصيل الفاتورة - ${invoice?.InvoiceName}`}
      icon={FaBox}
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* إضافة منتج جديد */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-4">إضافة منتج</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنتج
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full p-2 border rounded-lg text-gray-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الكمية
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2 border rounded-lg text-gray-900"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                سعر الشراء
              </label>
              <input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full p-2 border rounded-lg text-gray-900"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                سعر البيع
              </label>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full p-2 border rounded-lg text-gray-900"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> إضافة المنتج
          </button>
        </div>

        {/* قائمة المنتجات */}
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index}>
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
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.TotalPrice} د.ل
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </Modal>
  );
}
