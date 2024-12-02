import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/utils/api/product";
import { showToast } from "@/utils/toast";

export function useProductForm() {
    const queryClient = useQueryClient();
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [formData, setFormData] = useState({
        ProductName: "",
        Description: "",
        CategoryID: "",
        SellPrice: "",
        SKU: "",
        IsActive: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);

    // إضافة منتج جديد
    const addMutation = useMutation({
        mutationFn: async (formDataToSend) => {
            const toastId = showToast.loading("جاري إضافة المنتج...");
            try {
                const queryParams = new URLSearchParams({
                    CategoryID: formData.CategoryID,
                    ProductName: formData.ProductName,
                    Description: formData.Description || "",
                    SKU: formData.SKU,
                    SellPrice: formData.SellPrice,
                    IsActive: formData.IsActive,
                }).toString();

                const result = await productApi.addProduct(queryParams, formDataToSend);
                showToast.dismiss(toastId);
                showToast.success("تم إضافة المنتج بنجاح");
                return result;
            } catch (error) {
                showToast.dismiss(toastId);
                showToast.error(error.message);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setIsModalOpen(false);
            resetForm();
        },
    });

    // تحديث منتج
    const updateMutation = useMutation({
        mutationFn: async ({ id, formDataToSend }) => {
            const toastId = showToast.loading("جاري تحديث المنتج...");
            try {
                const updatedFields = {
                    CategoryID: formData.CategoryID,
                };

                if (formData.IsActive !== undefined) {
                    updatedFields.IsActive = formData.IsActive;
                }

                if (formData.ProductName?.trim())
                    updatedFields.ProductName = formData.ProductName.trim();
                if (formData.Description?.trim())
                    updatedFields.Description = formData.Description.trim();
                if (formData.SKU?.trim()) updatedFields.SKU = formData.SKU.trim();
                if (formData.SellPrice) {
                    const price = Number(formData.SellPrice);
                    if (!isNaN(price) && price >= 0) updatedFields.SellPrice = price;
                }

                const queryParams = new URLSearchParams(updatedFields).toString();

                const result = await productApi.updateProduct(
                    id,
                    queryParams,
                    formDataToSend,
                    {
                        currentProduct,
                        selectedFiles,
                        imagesToDelete,
                    }
                );

                showToast.dismiss(toastId);
                showToast.success("تم تحديث المنتج بنجاح");
                return result;
            } catch (error) {
                showToast.dismiss(toastId);
                showToast.error(error.message);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            setIsModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    // حذف منتج
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const toastId = showToast.loading("جاري حذف المنتج...");
            try {
                const result = await productApi.deleteProduct(id);
                showToast.dismiss(toastId);

                if (result.message?.includes("تم تعطيل المنتج")) {
                    showToast.info(result.message);
                } else {
                    showToast.success("تم حذف المنتج بنجاح");
                }

                return result;
            } catch (error) {
                showToast.dismiss(toastId);
                showToast.error(error.message);
                throw error;
            }
        },
        onSuccess: () => queryClient.invalidateQueries(["products"]),
    });

    const resetForm = () => {
        setFormData({
            ProductName: "",
            Description: "",
            CategoryID: "",
            SellPrice: "",
            SKU: "",
            IsActive: true,
        });
        setSelectedFiles([]);
        setMainImageIndex(0);
        setEditingId(null);
        setCurrentProduct(null);
        setImagesToDelete([]);
    };

    return {
        formData,
        setFormData,
        error,
        setError,
        isModalOpen,
        setIsModalOpen,
        selectedFiles,
        setSelectedFiles,
        mainImageIndex,
        setMainImageIndex,
        editingId,
        setEditingId,
        imagesToDelete,
        setImagesToDelete,
        currentProduct,
        setCurrentProduct,
        addMutation,
        updateMutation,
        deleteMutation,
        resetForm,
    };
} 