import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/utils/toast";
import { suppliersApi } from "@/utils/api/suppliers";

export function useSupplierForm() {
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

    // Mutations
    const addMutation = useMutation({
        mutationFn: async (newSupplier) => {
            const toastId = showToast.loading("جاري إضافة المورد...");
            try {
                const result = await suppliersApi.addSupplier(newSupplier);
                showToast.dismiss(toastId);
                showToast.success("تم إضافة المورد بنجاح");
                return result;
            } catch (error) {
                showToast.dismiss(toastId);
                showToast.error(error.message);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["suppliers"]);
            setIsModalOpen(false);
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const toastId = showToast.loading("جاري تحديث المورد...");
            try {
                const result = await suppliersApi.updateSupplier(id, data);
                showToast.dismiss(toastId);
                showToast.success("تم تحديث المورد بنجاح");
                return result;
            } catch (error) {
                showToast.dismiss(toastId);
                showToast.error(error.message);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["suppliers"]);
            setIsModalOpen(false);
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const toastId = showToast.loading("جاري حذف المورد...");
            try {
                const result = await suppliersApi.deleteSupplier(id);
                showToast.dismiss(toastId);
                showToast.success("تم حذف المورد بنجاح");
                return result;
            } catch (error) {
                showToast.dismiss(toastId);
                if (error.message.includes("فواتير مرتبطة")) {
                    showToast.info(error.message);
                } else {
                    showToast.error(error.message);
                }
                throw error;
            }
        },
        onSuccess: () => queryClient.invalidateQueries(["suppliers"]),
    });

    // Event Handlers
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

    return {
        isModalOpen,
        setIsModalOpen,
        searchTerm,
        setSearchTerm,
        formData,
        setFormData,
        editingId,
        handleSubmit,
        handleDelete,
        handleEdit,
        resetForm,
    };
} 