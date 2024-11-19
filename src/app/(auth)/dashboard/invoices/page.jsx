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
  FaMoneyBill,
  FaSpinner,
} from "react-icons/fa";
import Modal from "@/components/shared/Modal";
import QueryWrapper from "@/components/shared/QueryWrapper";
import InvoiceItemsModal from "./components/InvoiceItemsModal";
import { useRouter } from "next/navigation";
import Notification from "@/components/shared/Notification";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import FilterDropdown from "./components/FilterDropdown";
import InvoiceStats from "./components/InvoiceStats";
import { showToast } from "@/utils/toast";

export default function Invoices() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    InvoiceName: "",
    SupplierID: "",
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
    completion: "all",
    supplier: "all",
  });
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null);

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
      const toastId = showToast.loading("جاري إضافة الفاتورة...");
      try {
        const response = await fetch(
          "https://backend-v1-psi.vercel.app/invoices/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(newInvoice),
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في إضافة الفاتورة");
        }
        showToast.dismiss(toastId);
        showToast.success("تم إضافة الفاتورة بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
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
      const toastId = showToast.loading("جاري تحديث الفاتورة...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${id}`,
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
          throw new Error(error.detail || "فشل في تحديث الفاتورة");
        }
        showToast.dismiss(toastId);
        showToast.success("تم تحديث الفاتورة بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["invoices"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // حذف فاتورة
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const toastId = showToast.loading("جاري حذف الفاتورة...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${id}`,
          {
            method: "DELETE",
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في حذف الفاتورة");
        }
        showToast.dismiss(toastId);
        showToast.success("تم حذف الفاتورة بنجاح");
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["invoices"]),
  });

  // إكمال الفاتورة
  const completeMutation = useMutation({
    mutationFn: async (id) => {
      const toastId = showToast.loading("جاري إكمال الفاتورة...");
      try {
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/invoices/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify({ is_completed: true }),
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في إكمال الفاتورة");
        }
        showToast.dismiss(toastId);
        showToast.success("تم إكمال الفاتورة بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["invoices"]),
  });

  // Add delete handler
  const handleDelete = async (id) => {
    const invoice = invoices.find((inv) => inv.InvoiceID === id);
    if (invoice?.is_completed) {
      setNotification({
        show: true,
        message: "لا يمكن حذف الفاتورة المكتملة",
        type: "error",
      });
      return;
    }

    if (window.confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
      try {
        await deleteMutation.mutateAsync(id);
        setNotification({
          show: true,
          message: "تم حذف الفاتورة بنجاح",
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

  // إضافة وظيفة التحقق من المدخلات
  const validateInvoice = (data) => {
    if (!data.InvoiceName.trim()) {
      throw new Error("رقم الفاتورة مطلوب");
    }
    if (!data.SupplierID) {
      throw new Error("يجب اختيار المورد");
    }

    // التحقق من المبلغ المدفوع
    const totalPaid =
      (Number(data.previousPaid) || 0) + (Number(data.Paid) || 0);
    const totalAmount = Number(data.TotalAmount) || 0;

    if (totalPaid > totalAmount) {
      throw new Error(
        "إجمالي المبلغ المدفوع لا يمكن أن يتجاوز إجمالي الفاتورة"
      );
    }
  };

  // تحديث handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // التحقق من المدخلات
      if (!formData.InvoiceName.trim()) {
        showToast.error("رقم الفاتورة مطلوب");
        return;
      }
      if (!formData.SupplierID) {
        showToast.error("يجب اختيار المورد");
        return;
      }
      if (!formData.items.length) {
        showToast.error("يجب إضافة منتج واحد على الأقل");
        return;
      }

      if (editingId) {
        // تحديث الفاتورة
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            InvoiceName: formData.InvoiceName,
            SupplierID: formData.SupplierID,
            Paid: Number(formData.Paid || 0),
            is_completed: formData.is_completed,
          },
        });
      } else {
        // إضافة فاتورة جديدة
        await addMutation.mutateAsync(formData);
      }
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // إضافة دالة calculateTotal
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const itemTotal = Number(item.Quantity) * Number(item.BuyPrice);
      return sum + (itemTotal || 0);
    }, 0);
  };

  // تحديث handleAddItem
  const handleAddItem = () => {
    if (
      !newItem.ProductID ||
      !newItem.Quantity ||
      !newItem.BuyPrice ||
      !newItem.SellPrice
    ) {
      showToast.error("جميع حقول المنتج مطلوبة");
      return;
    }

    const product = products.find((p) => p.ProductID === newItem.ProductID);
    const totalPrice = Number(newItem.Quantity) * Number(newItem.BuyPrice);

    const updatedItems = [
      ...formData.items,
      {
        ProductID: newItem.ProductID,
        ProductName: product.ProductName,
        Quantity: Number(newItem.Quantity),
        BuyPrice: Number(newItem.BuyPrice),
        SellPrice: Number(newItem.SellPrice),
        TotalPrice: totalPrice,
      },
    ];

    setFormData({
      ...formData,
      items: updatedItems,
      TotalAmount: calculateTotal(updatedItems),
    });

    setNewItem({
      ProductID: "",
      Quantity: "",
      BuyPrice: "",
      SellPrice: "",
    });

    showToast.success("تم إضافة المنتج بنجاح");
  };

  // تحديث handleRemoveItem
  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: updatedItems,
      TotalAmount: calculateTotal(updatedItems),
    });
  };

  // تحديث handleComplete
  const handleComplete = async (id) => {
    if (
      window.confirm(
        "هل أنت متأكد من إكمال هذه الفاتورة؟ لن يمكنك التراجع عن هذا الإجراء"
      )
    ) {
      try {
        await completeMutation.mutateAsync(id);
      } catch (error) {
        showToast.error(error.message);
      }
    }
  };

  // إضافة resetForm
  const resetForm = () => {
    setFormData({
      InvoiceName: "",
      SupplierID: "",
      Paid: 0,
      items: [],
    });
    setEditingId(null);
    setSelectedInvoice(null);
    setNewItem({
      ProductID: "",
      Quantity: "",
      BuyPrice: "",
      SellPrice: "",
    });
  };

  // تحديث handleEdit
  const handleEdit = (invoice) => {
    if (invoice.is_completed) {
      showToast.error("لا يمكن تعديل الفاتورة المكتملة");
      return;
    }

    setFormData({
      InvoiceName: invoice.InvoiceName,
      SupplierID: invoice.SupplierID,
      Paid: 0,
      items: invoice.items,
      previousPaid: invoice.Paid,
      TotalAmount: invoice.TotalAmount,
      is_completed: invoice.is_completed,
    });
    setEditingId(invoice.InvoiceID);
    setIsModalOpen(true);
  };

  // تحديث handleViewItems
  const handleViewItems = (invoice) => {
    if (invoice.is_completed) {
      showToast.error("لا يمكن تعديل منتجات الفاتورة المكتملة");
      return;
    }
    setSelectedInvoice(invoice);
    setIsItemsModalOpen(true);
  };

  // تحديث handleSaveItems
  const handleSaveItems = async (items) => {
    const toastId = showToast.loading("جاري حفظ المنتجات...");
    try {
      await itemsMutation.mutateAsync({
        invoiceId: selectedInvoice.InvoiceID,
        items,
      });
      showToast.dismiss(toastId);
      showToast.success("تم حفظ المنتجات بنجاح");
    } catch (error) {
      showToast.dismiss(toastId);
      showToast.error(error.message);
    }
  };

  // تحديث تصفية الفواتير
  const filteredInvoices = invoices
    .filter((invoice) => {
      // تصفية حسب حالة الدفع
      if (filters.status !== "all" && invoice.Status !== filters.status)
        return false;

      // تصفية حسب حالة الإكمال
      if (
        filters.completion !== "all" &&
        ((filters.completion === "completed" && !invoice.is_completed) ||
          (filters.completion === "incomplete" && invoice.is_completed))
      )
        return false;

      // تصفية حسب المورد
      if (filters.supplier !== "all" && invoice.SupplierID !== filters.supplier)
        return false;

      // تصفية حسب البحث
      if (searchTerm) {
        return invoice.InvoiceName.toLowerCase().includes(
          searchTerm.toLowerCase()
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.InvoiceDate) - new Date(a.InvoiceDate));

  // إضافة إحصائيات الفواتير
  const invoiceStats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.Status === "paid").length,
    unpaid: invoices.filter((inv) => inv.Status === "unpaid").length,
    completed: invoices.filter((inv) => inv.is_completed).length,
    incomplete: invoices.filter((inv) => !inv.is_completed).length,
  };

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

  // إضافة مون الطباعة
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

          {/* إضافة إحصائيات */}
          <InvoiceStats stats={invoiceStats} />

          {/* إضافة قوائم التصفية */}
          <FilterDropdown
            filters={filters}
            setFilters={setFilters}
            suppliers={suppliers}
          />

          {/* شريط البحث */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
                          invoice.Status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.Status === "Partially Paid"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.Status === "Paid"
                          ? "مدفوعة"
                          : invoice.Status === "Partially Paid"
                          ? "مدفوعة جزئياً"
                          : "غير مدفوعة"}
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
                          onClick={async () => {
                            setLoadingInvoiceId(invoice.InvoiceID);
                            router.push(
                              `/dashboard/invoices/${invoice.InvoiceID}`
                            );
                          }}
                          className="text-gray-600 hover:text-gray-800 transition-colors duration-150"
                          title="عرض التفاصيل"
                          disabled={loadingInvoiceId === invoice.InvoiceID}
                        >
                          {loadingInvoiceId === invoice.InvoiceID ? (
                            <FaSpinner className="animate-spin" size={18} />
                          ) : (
                            <FaEye size={18} />
                          )}
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
                    <option
                      key={supplier.SupplierID}
                      value={supplier.SupplierID}
                    >
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
                  <h3 className="text-lg font-medium text-gray-900">
                    إضافة منتجات
                  </h3>
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
                        <option
                          key={product.ProductID}
                          value={product.ProductID}
                        >
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
                      <FaPlus size={16} />
                      إضافة
                    </button>
                  </div>
                </div>

                {/* جدول المنتجات امضافة */}
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
                                  <FaTrash size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        إجمالي المنتجات: {formData.items.length}
                      </span>
                      <span className="font-medium text-gray-900">
                        الإجمالي:{" "}
                        {calculateTotal(formData.items).toLocaleString("ar-LY")}{" "}
                        د.ل
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* معلومات المدفوعات */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  معلومات الدفع
                </h3>
                {editingId && (
                  <div className="text-sm text-gray-500">
                    حالة الدفع:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formData.Status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {formData.Status === "Paid" ? "مدفوعة" : "غير مدفوعة"}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* إجمالي الفاتورة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    إجمالي الفاتورة
                  </label>
                  <div className="p-2.5 bg-gray-50 border rounded-lg text-gray-900 font-medium">
                    {calculateTotal(formData.items).toLocaleString("ar-LY")} د.ل
                  </div>
                </div>

                {/* المبلغ المدفوع سابقاً - يظهر فقط في حالة التعديل */}
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المبلغ المدفوع سابقاً
                    </label>
                    <div className="p-2.5 bg-gray-50 border rounded-lg text-green-600 font-medium">
                      {Number(formData.previousPaid || 0).toLocaleString(
                        "ar-LY"
                      )}{" "}
                      د.ل
                    </div>
                  </div>
                )}

                {/* المبلغ المتبقي */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المبلغ المتبقي
                  </label>
                  <div className="p-2.5 bg-gray-50 border rounded-lg text-red-600 font-medium">
                    {(
                      calculateTotal(formData.items) -
                      (editingId ? Number(formData.previousPaid || 0) : 0) -
                      Number(formData.Paid || 0)
                    ).toLocaleString("ar-LY")}{" "}
                    د.ل
                  </div>
                </div>

                {/* المبلغ المدفوع الجديد */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingId ? "المبلغ المدفوع الإضافي" : "المبلغ المدفوع"}
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
                    max={
                      calculateTotal(formData.items) -
                      (editingId ? Number(formData.previousPaid || 0) : 0)
                    }
                    step="0.01"
                  />
                </div>
              </div>

              {/* إجمالي المدفوعات - يظهر فقط في حالة التعديل */}
              {editingId && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">
                      إجمالي المدفوعات
                    </span>
                    <span className="font-bold text-blue-700">
                      {(
                        Number(formData.previousPaid || 0) +
                        Number(formData.Paid || 0)
                      ).toLocaleString("ar-LY")}{" "}
                      د.ل
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ملخص الفاتورة */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">عدد المنتجات</p>
                  <p className="font-medium text-gray-900">
                    {formData.items.length}
                  </p>
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
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || (!editingId && formData.items.length === 0)
                }
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
