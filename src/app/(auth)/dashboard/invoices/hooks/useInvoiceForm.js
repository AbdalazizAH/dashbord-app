import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { showToast } from "@/utils/toast";
import { invoiceApi } from "@/utils/api/invoice";

export default function useInvoiceForm() {
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
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [newItem, setNewItem] = useState({
        ProductID: "",
        Quantity: "",
        BuyPrice: "",
        SellPrice: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filters, setFilters] = useState({
        status: "all",
        completion: "all",
        supplier: "all",
    });
    const [loadingInvoiceId, setLoadingInvoiceId] = useState(null);

    // جلب جميع البيانات المطلوبة بشكل متزامن
    const { data: { invoices = [], products = [], suppliers = [] } = {} } = useSuspenseQuery({
        queryKey: ["invoiceData"],
        queryFn: async () => {
            const [invoicesRes, productsRes, suppliersRes] = await Promise.all([
                invoiceApi.getInvoices(),
                fetch("https://backend-v1-psi.vercel.app/product/", {
                    headers: { accept: "application/json" },
                }),
                fetch("https://backend-v1-psi.vercel.app/suppliers/", {
                    headers: { accept: "application/json" },
                })
            ]);

            if (!productsRes.ok) throw new Error("فشل في جلب المنتجات");
            if (!suppliersRes.ok) throw new Error("فشل في جلب الموردين");

            const [invoicesData, productsData, suppliersData] = await Promise.all([
                invoicesRes,
                productsRes.json(),
                suppliersRes.json()
            ]);

            return {
                invoices: invoicesData,
                products: productsData,
                suppliers: suppliersData
            };
        }
    });

    // Mutations
    const addMutation = useMutation({
        mutationFn: async (newInvoice) => {
            const toastId = showToast.loading("جاري إضافة الفاتورة...");
            try {
                const result = await invoiceApi.addInvoice(newInvoice);
                showToast.dismiss(toastId);
                showToast.success("تم إضافة الفاتورة بنجاح");
                return result;
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

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const toastId = showToast.loading("جاري تحديث الفاتورة...");
            try {
                const result = await invoiceApi.updateInvoice(id, data);
                showToast.dismiss(toastId);
                showToast.success("تم تحديث الفاتورة بنجاح");
                return result;
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

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const toastId = showToast.loading("جاري حذف الفاتورة...");
            try {
                await invoiceApi.deleteInvoice(id);
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

    const completeMutation = useMutation({
        mutationFn: async (id) => {
            const toastId = showToast.loading("جاري إكمال الفاتورة...");
            try {
                const result = await invoiceApi.completeInvoice(id);
                showToast.dismiss(toastId);
                showToast.success("تم إكمال الفاتورة بنجاح");
                return result;
            } catch (error) {
                showToast.dismiss(toastId);
                showToast.error(error.message);
                throw error;
            }
        },
        onSuccess: () => queryClient.invalidateQueries(["invoices"]),
    });


    // Helper Functions
    const calculateTotal = (items) => {
        return items.reduce((sum, item) => {
            const itemTotal = Number(item.Quantity) * Number(item.BuyPrice);
            return sum + (itemTotal || 0);
        }, 0);
    };

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

    // Event Handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
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
                await addMutation.mutateAsync(formData);
            }
        } catch (error) {
            showToast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddItem = () => {
        if (!newItem.ProductID || !newItem.Quantity || !newItem.BuyPrice || !newItem.SellPrice) {
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

    const handleRemoveItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            items: updatedItems,
            TotalAmount: calculateTotal(updatedItems),
        });
    };

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

    const handleDelete = async (id) => {
        const invoice = invoices.find((inv) => inv.InvoiceID === id);
        if (invoice?.is_completed) {
            showToast.error("لا يمكن حذف الفاتورة المكتملة");
            return;
        }

        if (window.confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                showToast.error(error.message);
            }
        }
    };

    const handleComplete = async (id) => {
        if (window.confirm("هل أنت متأكد من إكمال هذه الفاتورة؟ لن يمكنك التراجع عن هذا الإجراء")) {
            try {
                await completeMutation.mutateAsync(id);
            } catch (error) {
                showToast.error(error.message);
            }
        }
    };

    return {
        formData,
        setFormData,
        newItem,
        setNewItem,
        isModalOpen,
        setIsModalOpen,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        loadingInvoiceId,
        setLoadingInvoiceId,
        isSubmitting,
        products,
        suppliers,
        editingId,
        handleSubmit,
        handleAddItem,
        handleRemoveItem,
        handleEdit,
        handleDelete,
        handleComplete,
        calculateTotal,
        resetForm,
        invoices,
    };
} 