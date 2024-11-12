"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaFileInvoiceDollar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBox,
  FaEye,
  FaPrint,
} from "react-icons/fa";
import Modal from "@/components/shared/Modal";
import QueryWrapper from "@/components/shared/QueryWrapper";
import InvoiceItemsModal from "./components/InvoiceItemsModal";
import { useRouter } from "next/navigation";
import Notification from "@/components/shared/Notification";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function Invoices() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    InvoiceName: "",
    SupplierID: "",
    TotalAmount: "",
    Status: "unpaid",
    Paid: 0,
    items: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const router = useRouter();
  const [newItem, setNewItem] = useState({
    ProductID: "",
    Quantity: "",
    BuyPrice: "",
    SellPrice: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    supplier: "all",
  });

  // جلب الفواتير
  const {
    data: invoices = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/invoices/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب الفواتير");
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

  // إضافة فاتورة جديدة
  const addMutation = useMutation({
    mutationFn: async (newInvoice) => {
      const invoiceResponse = await fetch(
        "https://backend-v1-psi.vercel.app/invoices/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            InvoiceName: newInvoice.InvoiceName,
            SupplierID: newInvoice.SupplierID,
            TotalAmount: newInvoice.TotalAmount,
            Status: newInvoice.Status,
            Paid: newInvoice.Paid,
          }),
        }
      );

      if (!invoiceResponse.ok) throw new Error("فشل في إضافة الفاتورة");
      const { id: invoiceId } = await invoiceResponse.json();

      if (newInvoice.items.length > 0) {
        await Promise.all(
          newInvoice.items.map((item) =>
            fetch("https://backend-v1-psi.vercel.app/invoices-items/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                accept: "application/json",
              },
              body: JSON.stringify({
                ...item,
                InvoiceID: invoiceId,
                IsPurchased: true,
              }),
            })
          )
        );
      }

      return { invoiceId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // تحديث فاتورة
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ ...data, is_completed: false }),
        }
      );
      if (!response.ok) throw new Error("فشل في تحديث الفاتورة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${id}`,
        {
          method: "DELETE",
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في حذف الفاتورة");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
    },
  });

  // Add delete handler
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      deleteMutation.mutate(id);
    }
  };

  // إضافة وظيفة التحقق من المدخلات
  const validateInvoice = (data) => {
    if (!data.InvoiceName.trim()) {
      throw new Error("رقم الفاتورة مطلوب");
    }
    if (!data.SupplierID) {
      throw new Error("يجب اختيار المورد");
    }
    if (!data.items.length) {
      throw new Error("يجب إضافة منتج واحد على الأقل");
    }
    if (data.Paid > data.TotalAmount) {
      throw new Error("المبلغ المدفوع لا يمكن أن يتجاوز إجمالي الفاتورة");
    }
  };

  // تحديث handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      validateInvoice(formData);

      const invoiceData = {
        ...formData,
        TotalAmount: Number(
          formData.TotalAmount || calculateTotal(formData.items)
        ),
        Paid: Number(formData.Paid || 0),
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: invoiceData });
        setNotification({
          show: true,
          message: "تم تحديث الفاتورة بنجاح",
          type: "success",
        });
      } else {
        await addMutation.mutateAsync(invoiceData);
        setNotification({
          show: true,
          message: "تم إضافة الفاتورة بنجاح",
          type: "success",
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification({ show: false }), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      InvoiceName: "",
      SupplierID: "",
      TotalAmount: "",
      Status: "unpaid",
      Paid: 0,
      items: [],
    });
    setEditingId(null);
  };

  const handleEdit = (invoice) => {
    setFormData({
      InvoiceName: invoice.InvoiceName,
      SupplierID: invoice.SupplierID,
      TotalAmount: invoice.TotalAmount.toString(),
      Status: invoice.Status,
      Paid: invoice.Paid,
      items: invoice.items,
    });
    setEditingId(invoice.InvoiceID);
    setIsModalOpen(true);
  };

  // تصفية الفواتير حسب البحث
  const filteredInvoices = invoices
    .filter((invoice) => {
      if (filters.status !== "all" && invoice.Status !== filters.status)
        return false;
      if (filters.supplier !== "all" && invoice.SupplierID !== filters.supplier)
        return false;
      if (searchTerm) {
        return invoice.InvoiceName.toLowerCase().includes(
          searchTerm.toLowerCase()
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.InvoiceDate) - new Date(a.InvoiceDate));

  // Add items mutation
  const itemsMutation = useMutation({
    mutationFn: async ({ invoiceId, items }) => {
      // Delete existing items first
      if (selectedInvoice?.items?.length > 0) {
        await Promise.all(
          selectedInvoice.items.map((item) =>
            fetch(
              `https://backend-v1-psi.vercel.app/invoices-items/${item.InvoiceItemID}`,
              {
                method: "DELETE",
                headers: { accept: "application/json" },
              }
            )
          )
        );
      }

      // Add new items
      await Promise.all(
        items.map((item) =>
          fetch("https://backend-v1-psi.vercel.app/invoices-items/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({ ...item, InvoiceID: invoiceId }),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      setIsItemsModalOpen(false);
      setSelectedInvoice(null);
    },
  });

  // Add handler for opening items modal
  const handleViewItems = (invoice) => {
    setSelectedInvoice(invoice);
    setIsItemsModalOpen(true);
  };

  // Add handler for saving items
  const handleSaveItems = (items) => {
    itemsMutation.mutate({
      invoiceId: selectedInvoice.InvoiceID,
      items,
    });
  };

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

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ...newItem,
          ProductName: product.ProductName,
          TotalPrice: totalPrice,
        },
      ],
      TotalAmount: (Number(formData.TotalAmount || 0) + totalPrice).toString(),
    });

    setNewItem({
      ProductID: "",
      Quantity: "",
      BuyPrice: "",
      SellPrice: "",
    });
  };

  const handleRemoveItem = (index) => {
    const removedItem = formData.items[index];
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      TotalAmount: (
        Number(formData.TotalAmount) - removedItem.TotalPrice
      ).toString(),
    });
  };

  // إضافة وظيفة لحساب الإجمالي
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.TotalPrice || 0), 0);
  };

  // إضافة mutation لإكمال الفاتورة
  const completeMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(
        `https://backend-v1-psi.vercel.app/invoices/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            is_completed: true,
          }),
        }
      );
      if (!response.ok) throw new Error("فشل في إكمال الفاتورة");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
    },
  });

  // إضافة handler لإكمال الفاتورة
  const handleComplete = async (id) => {
    if (
      window.confirm(
        "هل أنت متأكد من إكمال هذه الفاتورة؟ لن يمكنك التراجع عن هذا الإجراء أو تعديل الفاتورة لاحقاً"
      )
    ) {
      try {
        await completeMutation.mutateAsync(id);
        setNotification({
          show: true,
          message: "تم إكمال الفاتورة بنجاح",
          type: "success",
        });
      } catch (error) {
        setNotification({
          show: true,
          message: error.message,
          type: "error",
        });
      }
    }
  };

  // إضافة مكون الطباعة
  const PrintInvoice = ({ invoice }) => {
    return (
      <div className="print:block hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">
            فاتورة رقم: {invoice.InvoiceName}
          </h1>
          <div className="mb-6">
            <p>
              التاريخ:{" "}
              {new Date(invoice.InvoiceDate).toLocaleDateString("ar-LY")}
            </p>
            <p>
              المورد:{" "}
              {
                suppliers.find((s) => s.SupplierID === invoice.SupplierID)
                  ?.SupplierName
              }
            </p>
          </div>
          <table className="w-full mb-6">
            <thead>
              <tr>
                <th className="text-right">المنتج</th>
                <th className="text-right">الكمية</th>
                <th className="text-right">السعر</th>
                <th className="text-right">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.InvoiceItemID}>
                  <td>
                    {
                      products.find((p) => p.ProductID === item.ProductID)
                        ?.ProductName
                    }
                  </td>
                  <td>{item.Quantity}</td>
                  <td>{item.BuyPrice} د.ل</td>
                  <td>{item.TotalPrice} د.ل</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-left">
            <p>الإجمالي: {invoice.TotalAmount} د.ل</p>
            <p>المدفوع: {invoice.Paid} د.ل</p>
            <p>المتبقي: {invoice.Due} د.ل</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <QueryWrapper loading={isLoading} error={error}>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FaFileInvoiceDollar className="text-blue-600 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة الفواتير
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
              <span>إضافة فاتورة جديدة</span>
            </button>
          </div>

          {/* شريط البحث */}
          <div className="mt-6">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الفواتير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* جدول الفواتير */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الفاتورة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المورد
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المبلغ الإجمالي
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المدفوع
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المتبقي
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    حالة الإكمال
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.InvoiceID}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.InvoiceName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(invoice.InvoiceDate).toLocaleDateString(
                          "ar-LY"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {suppliers.find(
                          (s) => s.SupplierID === invoice.SupplierID
                        )?.SupplierName || "غير محدد"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.TotalAmount?.toLocaleString("ar-LY")} د.ل
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-medium">
                        {invoice.Paid?.toLocaleString("ar-LY")} د.ل
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-medium">
                        {invoice.Due?.toLocaleString("ar-LY")} د.ل
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.Status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {invoice.Status === "paid" ? "مدفوعة" : "غير مدفوعة"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.InvoiceDate).toLocaleDateString(
                          "ar-LY"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.is_completed
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {invoice.is_completed ? "مكتملة" : "غير مكتملة"}
                        </span>
                        {!invoice.is_completed && (
                          <button
                            onClick={() => handleComplete(invoice.InvoiceID)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150 text-sm"
                            title="إكمال الفاتورة"
                          >
                            إكمال
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/invoices/${invoice.InvoiceID}`
                            )
                          }
                          className="text-gray-600 hover:text-gray-800 transition-colors duration-150"
                          title="عرض التفاصيل"
                        >
                          <FaEye size={18} />
                        </button>
                        {!invoice.is_completed && (
                          <>
                            <button
                              onClick={() => handleViewItems(invoice)}
                              className="text-gray-600 hover:text-gray-800 transition-colors duration-150"
                              title="عرض المنتجات"
                            >
                              <FaBox size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(invoice)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                              title="تعديل"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.InvoiceID)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-150"
                              title="حذف"
                            >
                              <FaTrash size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => window.print()}
                          className="text-gray-600 hover:text-gray-800 transition-colors duration-150 print:hidden"
                          title="طباعة"
                        >
                          <FaPrint size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingId ? "تعديل فاتورة" : "إضافة فاتورة جديدة"}
          icon={FaFileInvoiceDollar}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  رقم الفاتورة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.InvoiceName}
                  onChange={(e) =>
                    setFormData({ ...formData, InvoiceName: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  required
                  placeholder="أدخل رقم الفاتورة"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  المورد <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.SupplierID}
                  onChange={(e) =>
                    setFormData({ ...formData, SupplierID: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  required
                >
                  <option value="">اختر المورد</option>
                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.SupplierID}
                      value={supplier.SupplierID}
                    >
                      {supplier.SupplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  المبلغ الإجمالي <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.TotalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, TotalAmount: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  المبلغ المدفوع
                </label>
                <input
                  type="number"
                  value={formData.Paid}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      Paid: e.target.value,
                      Status:
                        Number(e.target.value) >= Number(formData.TotalAmount)
                          ? "paid"
                          : "unpaid",
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  min="0"
                  max={formData.TotalAmount}
                  step="0.01"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">إضافة منتجات</h3>
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
                    value={newItem.Quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, Quantity: e.target.value })
                    }
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
                    value={newItem.BuyPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, BuyPrice: e.target.value })
                    }
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
                    value={newItem.SellPrice}
                    onChange={(e) =>
                      setNewItem({ ...newItem, SellPrice: e.target.value })
                    }
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

            {/* عرض المنتجات المضافة */}
            {formData.items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                        المنج
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
                    {formData.items.map((item, index) => (
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
            )}

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
                disabled={isSubmitting || !formData.items.length}
                className={`px-6 py-2.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md ${
                  formData.items.length && !isSubmitting
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

        <InvoiceItemsModal
          isOpen={isItemsModalOpen}
          onClose={() => {
            setIsItemsModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          products={products}
          existingItems={selectedInvoice?.items || []}
          onSave={handleSaveItems}
        />

        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ show: false })}
          />
        )}
      </div>
    </QueryWrapper>
  );
}
