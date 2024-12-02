"use client";
import { Suspense, useState } from "react";
import { useProductForm } from "./hooks/useProductForm";
import ProductModal from "./components/ProductModal";
import ProductHeader from "./components/ProductHeader";
import ProductData from "./components/ProductData";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { showToast } from "@/utils/toast";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);

  const {
    formData,
    setFormData,
    error,
    isModalOpen,
    setIsModalOpen,
    selectedFiles,
    mainImageIndex,
    setMainImageIndex,
    editingId,
    imagesToDelete,
    currentProduct,
    addMutation,
    updateMutation,
    deleteMutation,
    resetForm,
    setSelectedFiles,
    setEditingId,
    setCurrentProduct,
    setImagesToDelete,
  } = useProductForm();

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const formDataToSend = new FormData();
        updateMutation.mutate({ id: editingId, formDataToSend });
      } else {
        if (!formData.ProductName?.trim()) {
          showToast.error("اسم المنتج مطلوب");
          return;
        }
        if (!formData.CategoryID) {
          showToast.error("الصنف مطلوب");
          return;
        }
        if (!selectedFiles.length) {
          showToast.error("يجب إضافة صورة واحدة على الأقل للمنتج");
          document.getElementById("image-upload").focus();
          return;
        }

        const formDataToSend = new FormData();
        selectedFiles.forEach((file) => {
          formDataToSend.append("files", file);
        });
        formDataToSend.append("main_image_index", mainImageIndex.toString());
        const altTexts = selectedFiles
          .map((_, index) => `صورة المنتج ${index + 1}`)
          .join(",");
        formDataToSend.append("alt_texts", altTexts);

        addMutation.mutate(formDataToSend);
      }
    } catch (error) {
      showToast.error(error.message);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <ProductHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddNew={() => {
          resetForm();
          setIsModalOpen(true);
        }}
      />

      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <ProductData
          viewMode={viewMode}
          searchTerm={searchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setCategories={setCategories}
          onEdit={(product) => {
            setFormData({
              ProductName: product.ProductName,
              Description: product.Description || "",
              CategoryID: product.CategoryID,
              SellPrice: product.SellPrice?.toString() || "",
              SKU: product.SKU || "",
              IsActive: product.IsActive,
            });
            setEditingId(product.ProductID);
            setCurrentProduct(product);
            setImagesToDelete([]);
            setIsModalOpen(true);
          }}
          onDelete={(id) => {
            if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
              deleteMutation.mutate(id);
            }
          }}
        />
      </Suspense>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        editingId={editingId}
        currentProduct={currentProduct}
        categories={categories}
        selectedFiles={selectedFiles}
        handleFileChange={(e) => setSelectedFiles(Array.from(e.target.files))}
        mainImageIndex={mainImageIndex}
        setMainImageIndex={setMainImageIndex}
        imagesToDelete={imagesToDelete}
        handleDeleteImage={(imageId) =>
          setImagesToDelete([...imagesToDelete, imageId])
        }
      />
    </div>
  );
}
