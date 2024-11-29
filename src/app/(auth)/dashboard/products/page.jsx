"use client";
// استيراد المكتبات والمكونات اللازمة
import { useState } from "react";
import { useProductForm } from "@/hooks/products/useProductForm";
import { useProductQueries } from "@/hooks/products/useProductQueries";
import { usePagination } from "@/hooks/products/usePagination";
import { showToast } from "@/utils/toast";
import ProductModal from "./components/ProductModal";
import ProductGrid from "./components/ProductGrid";
import ProductTable from "./components/ProductTable";
import ProductHeader from "./components/ProductHeader";
import Pagination from "./components/Pagination";

export default function Products() {
  // حالة البحث وطريقة العرض
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // استخدام نموذج المنتج
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

  // جلب المنتجات والأصناف
  const {
    products,
    categories,
    isLoading,
    error: queryError,
  } = useProductQueries();

  // إدارة الصفحات
  const {
    currentPage,
    setCurrentPage,
    currentItems: currentProducts,
    totalPages,
  } = usePagination(products);

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // تحديث منتج موجود
        const formDataToSend = new FormData();
        updateMutation.mutate({ id: editingId, formDataToSend });
      } else {
        // إضافة منتج جديد
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

        // إعداد البيانات للإرسال
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

  // معالجة تعديل المنتج
  const handleEdit = (product) => {
    setFormData({
      ProductName: product.ProductName,
      Description: product.Description || "",
      CategoryID: product.CategoryID,
      SellPrice: product.SellPrice?.toString() || "",
      SKU: product.SKU || "",
    });
    setEditingId(product.ProductID);
    setCurrentProduct(product);
    setImagesToDelete([]);
    setIsModalOpen(true);
  };

  // معالجة حذف المنتج
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      deleteMutation.mutate(id);
    }
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (queryError) {
    return (
      <div className="bg-red-50 border-r-4 border-red-500 text-red-600 p-4 rounded-lg m-6">
        <p className="font-bold">حدث خطأ</p>
        <p>{queryError.message}</p>
      </div>
    );
  }

  // الواجهة الرئيسية
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

      {/* عرض رسالة الخطأ إن وجدت */}
      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <span className="mr-2">⚠️</span>
          {error}
        </div>
      )}

      {/* عرض المنتجات حسب النمط المختار */}
      {viewMode === "table" ? (
        <ProductTable
          products={currentProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ProductGrid
          products={currentProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ترقيم الصفحات */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* نافذة إضافة/تعديل المنتج */}
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
