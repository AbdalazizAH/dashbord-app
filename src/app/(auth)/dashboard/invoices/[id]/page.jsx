"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  FaFileInvoiceDollar,
  FaEdit,
  FaTrash,
  FaArrowRight,
  FaPlus,
  FaSave,
  FaUser,
  FaCalendar,
  FaMoneyBill,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import QueryWrapper from "@/components/shared/QueryWrapper";
import { use } from "react";

export default function InvoiceDetails({ params }) {
  const invoiceId = use(params).id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [localItems, setLocalItems] = useState([]);
  const [newItem, setNewItem] = useState({
    ProductID: "",
    Quantity: "",
    BuyPrice: "",
    SellPrice: "",
  });

  // جلب تفاصيل الفاتورة
  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${invoiceId}`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب تفاصيل الفاتورة");
      return response.json();
    },
  });

  // تحديث العناصر المحلية عند تحميل الفاتورة
  useEffect(() => {
    if (invoice) {
      setLocalItems(invoice.items || []);
    }
  }, [invoice]);

  // جلب المنتجات
  const { data: products = [] } = useQuery({
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
  });

  // جلب الموردين
  const { data: suppliers = [] } = useQuery({
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

  // تحديث عنصر في الفاتورة
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, data }) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${invoiceId}/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            Quantity: data.Quantity,
            BuyPrice: data.BuyPrice,
            SellPrice: data.SellPrice,
          }),
        }
      );
      if (!response.ok) throw new Error("فشل في تحديث العنصر");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice", invoiceId]);
    },
  });

  // إضافة عنصر جديد
  const addItemMutation = useMutation({
    mutationFn: async (items) => {
      // تحويل العناصر إلى الشكل المطلوب
      const formattedItems = Array.isArray(items) ? items : [items];
      const itemsToSend = formattedItems.map((item) => ({
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        BuyPrice: item.BuyPrice,
        SellPrice: item.SellPrice,
      }));

      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${invoiceId}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(itemsToSend),
        }
      );
      if (!response.ok) throw new Error("فشل في إضافة العناصر");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice", invoiceId]);
      setNewItem({
        ProductID: "",
        Quantity: "",
        BuyPrice: "",
        SellPrice: "",
      });
    },
  });

  // حذف عنصر
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${invoiceId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في حذف العنصر");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice", invoiceId]);
    },
  });

  const handleAddItem = () => {
    if (
      !newItem.ProductID ||
      !newItem.Quantity ||
      !newItem.BuyPrice ||
      !newItem.SellPrice
    )
      return;

    const product = products.find((p) => p.ProductID === newItem.ProductID);
    const totalPrice = Number(newItem.Quantity) * Number(newItem.BuyPrice);

    const newItemData = {
      ...newItem,
      ProductName: product.ProductName,
      TotalPrice: totalPrice,
    };

    setLocalItems([...localItems, newItemData]);
    setNewItem({
      ProductID: "",
      Quantity: "",
      BuyPrice: "",
      SellPrice: "",
    });
  };

  const handleDeleteItem = (index) => {
    if (window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) {
      setLocalItems(localItems.filter((_, i) => i !== index));
    }
  };

  // حساب إجمالي الفاتورة
  const calculateTotal = (items) => {
    return items?.reduce((sum, item) => sum + (item.TotalPrice || 0), 0) || 0;
  };

  // إضافة mutation لتحديث الفاتورة
  const updateInvoiceMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            InvoiceName: data.InvoiceName,
            SupplierID: data.SupplierID,
            Paid: data.Paid,
            is_completed: data.is_completed,
          }),
        }
      );
      if (!response.ok) throw new Error("فشل في تحديث الفاتورة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice", invoiceId]);
    },
  });

  // معالجة حفظ التغييرات
  const handleSaveChanges = async () => {
    try {
      // تجميع العناصر الجديدة
      const newItems = localItems
        .filter((item) => !item.InvoiceItemID)
        .map((item) => ({
          ProductID: item.ProductID,
          Quantity: item.Quantity,
          BuyPrice: item.BuyPrice,
          SellPrice: item.SellPrice,
        }));

      // إرسال العناصر الجديدة في طلب واحد
      if (newItems.length > 0) {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${invoiceId}/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(newItems),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في إضافة العناصر");
        }
      }

      // تحديث العناصر الموجودة
      const existingItems = localItems.filter((item) => item.InvoiceItemID);
      for (const item of existingItems) {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${invoiceId}/items/${item.InvoiceItemID}`,
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

      // حذف العناصر التي تم إزالتها
      const itemsToDelete = invoice.items.filter(
        (item) =>
          !localItems.some(
            (localItem) => localItem.InvoiceItemID === item.InvoiceItemID
          )
      );

      for (const item of itemsToDelete) {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${invoiceId}/items/${item.InvoiceItemID}`,
          {
            method: "DELETE",
            headers: { accept: "application/json" },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في حذف العناصر");
        }
      }

      // تحديث الفاتورة بالإجمالي الجديد
      const newTotal = calculateTotal(localItems);
      await updateInvoiceMutation.mutateAsync({
        ...invoice,
        TotalAmount: newTotal,
        Status: newTotal <= invoice.Paid ? "paid" : "unpaid",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      throw error;
    }
  };

  // إضافة mutation لإكمال الفاتورة
  const completeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            ...invoice,
            is_completed: true,
          }),
        }
      );
      if (!response.ok) throw new Error("فشل في إكمال الفاتورة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice", invoiceId]);
      setIsEditing(false);
    },
  });

  // إضافة handler لإكمال الفاتورة
  const handleComplete = () => {
    if (
      window.confirm(
        "هل أنت متأكد من إكمال هذه الفاتورة؟ لن يمكن التراجع عن هذا الإجراء."
      )
    ) {
      completeMutation.mutate();
    }
  };

  return (
    <QueryWrapper loading={isLoading} error={error}>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <FaArrowRight /> العودة
            </button>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  invoice?.is_completed
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {invoice?.is_completed ? "مكتملة" : "غير مكتملة"}
              </span>
              {!invoice?.is_completed && (
                <div className="flex gap-3">
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <FaCheck /> إكمال الفاتورة
                  </button>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        <FaTimes /> إلغاء
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <FaSave /> حفظ التغييرات
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <FaEdit /> تعديل الفاتورة
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* معلومات الفاتورة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaFileInvoiceDollar className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم الفاتورة</p>
                <p className="font-medium">{invoice?.InvoiceName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-green-100 rounded-full">
                <FaUser className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">المورد</p>
                <p className="font-medium">
                  {suppliers.find((s) => s.SupplierID === invoice?.SupplierID)
                    ?.SupplierName || "غير محدد"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaCalendar className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ الفاتورة</p>
                <p className="font-medium">
                  {new Date(invoice?.InvoiceDate).toLocaleDateString("ar-LY")}
                </p>
              </div>
            </div>
          </div>

          {/* إضافة عنصر جديد */}
          {!invoice?.is_completed && isEditing && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-4">
                إضافة منتج جديد
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المنتج
                  </label>
                  <select
                    value={newItem.ProductID}
                    onChange={(e) =>
                      setNewItem({ ...newItem, ProductID: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
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
                    value={newItem.Quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, Quantity: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    سعر الشراء
                  </label>
                  <input
                    type="number"
                    value={newItem.BuyPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, BuyPrice: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
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
                    value={newItem.SellPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, SellPrice: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
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
          )}

          {/* جدول المنتجات */}
          <div className="bg-white rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      امنتج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الكمية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      سعر الشراء
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      سعر البيع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الإجمالي
                    </th>
                    {isEditing && !invoice?.is_completed && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الإجراءات
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {localItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {products.find((p) => p.ProductID === item.ProductID)
                            ?.ProductName || "غير محدد"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing && !invoice?.is_completed ? (
                          <input
                            type="number"
                            value={item.Quantity}
                            onChange={(e) => {
                              const newQuantity = Number(e.target.value);
                              const updatedItems = [...localItems];
                              updatedItems[index].Quantity = newQuantity;
                              updatedItems[index].TotalPrice =
                                newQuantity * updatedItems[index].BuyPrice;
                              setLocalItems(updatedItems);
                            }}
                            className="w-20 p-1 border rounded text-gray-900"
                            min="1"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {item.Quantity}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing && !invoice?.is_completed ? (
                          <input
                            type="number"
                            value={item.BuyPrice}
                            onChange={(e) => {
                              const newPrice = Number(e.target.value);
                              const updatedItems = [...localItems];
                              updatedItems[index].BuyPrice = newPrice;
                              updatedItems[index].TotalPrice =
                                newPrice * updatedItems[index].Quantity;
                              setLocalItems(updatedItems);
                            }}
                            className="w-24 p-1 border rounded text-gray-900"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {item.BuyPrice} د.ل
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing && !invoice?.is_completed ? (
                          <input
                            type="number"
                            value={item.SellPrice}
                            onChange={(e) => {
                              const newPrice = Number(e.target.value);
                              const updatedItems = [...localItems];
                              updatedItems[index].SellPrice = newPrice;
                              setLocalItems(updatedItems);
                            }}
                            className="w-24 p-1 border rounded text-gray-900"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {item.SellPrice} د.ل
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.TotalPrice} د.ل
                        </div>
                      </td>
                      {isEditing && !invoice?.is_completed && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ملخص الفاتورة */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <FaMoneyBill className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي الفاتورة</p>
                  <p className="text-xl font-bold text-gray-900">
                    {calculateTotal(localItems).toLocaleString("ar-LY")} د.ل
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">الحالة</p>
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice?.Status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : invoice?.Status === "Partially Paid"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {invoice?.Status === "Paid"
                    ? "مدفوعة"
                    : invoice?.Status === "Partially Paid"
                    ? "مدفوعة جزئياً"
                    : "غير مدفوعة"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryWrapper>
  );
}
