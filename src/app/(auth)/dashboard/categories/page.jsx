"use client";
import { Suspense, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/utils/toast";
import { categoriesApi } from "@/utils/api/categories";
import CategoryHeader from "./components/CategoryHeader";
import CategoryModal from "./components/CategoryModal";
import CategoriesData from "./components/CategoriesData";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function Categories() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    CategoryName: "",
    Description: "",
  });
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setFormData({
      CategoryName: "",
      Description: "",
    });
    setEditingId(null);
  };

  // جضافة صنف
  const addMutation = useMutation({
    mutationFn: async (newCategory) => {
      const toastId = showToast.loading("جاري إضافة الصنف...");
      try {
        const result = await categoriesApi.addCategory(newCategory);
        showToast.dismiss(toastId);
        showToast.success("تم إضافة الصنف بنجاح");
        return result;
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["categories-count"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // تعديل صنف
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const toastId = showToast.loading("جاري تحديث الصنف...");
      try {
        const result = await categoriesApi.updateCategory(id, data);
        showToast.dismiss(toastId);
        showToast.success("تم تحديث الصنف بنجاح");
        return result;
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["categories-count"]);
      setIsModalOpen(false);
      resetForm();
    },
  });

  // حذف صنف
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const toastId = showToast.loading("جاري حذف الصنف...");
      try {
        await categoriesApi.deleteCategory(id);
        showToast.dismiss(toastId);
        showToast.success("تم حذف الصنف بنجاح");
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["categories-count"]);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      CategoryName: category.CategoryName,
      Description: category.Description || "",
    });
    setEditingId(category.CategoryID);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <CategoryHeader
        onAddClick={() => {
          setFormData({ CategoryName: "", Description: "" });
          setEditingId(null);
          setIsModalOpen(true);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Suspense fallback={<LoadingSpinner />}>
        <CategoriesData
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Suspense>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        editingId={editingId}
      />
    </div>
  );
}
