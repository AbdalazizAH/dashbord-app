"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import QueryWrapper from "@/components/shared/QueryWrapper";
import { showToast } from "@/utils/toast";
import { categoriesApi } from "@/utils/api/categories";
import CategoryHeader from "./components/CategoryHeader";
import CategoryTable from "./components/CategoryTable";
import CategoryModal from "./components/CategoryModal";

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

  // جلب الأصناف مع عدد المنتجات
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories-with-count"],
    queryFn: categoriesApi.getCategories,
  });

  // تصفية الأصناف حسب البحث
  const filteredCategories = categories.filter((category) =>
    category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إضافة صنف جديد
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
      queryClient.invalidateQueries(["categories-with-count"]);
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
      queryClient.invalidateQueries(["categories-with-count"]);
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
    onSuccess: () => queryClient.invalidateQueries(["categories-with-count"]),
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
    <QueryWrapper loading={isLoading} error={error}>
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

        <CategoryTable
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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
    </QueryWrapper>
  );
}
