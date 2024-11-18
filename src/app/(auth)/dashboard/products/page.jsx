"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProductModal from "./components/ProductModal";
import ProductGrid from "./components/ProductGrid";
import ProductTable from "./components/ProductTable";
import ProductHeader from "./components/ProductHeader";
import Pagination from "./components/Pagination";
import { showToast } from "@/utils/toast";

export default function Products() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    ProductName: "",
    Description: "",
    CategoryID: "",
    SellPrice: "",
    SKU: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;

  // جلب المنتجات
  const { data: products = [], isLoading: productsLoading } = useQuery({
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

  // جلب الأصناف
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/categories/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب الأصناف");
      return response.json();
    },
  });

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
        }).toString();

        const response = await fetch(
          `https://backend-v1-psi.vercel.app/product/?${queryParams}`,
          {
            method: "POST",
            headers: { accept: "application/json" },
            body: formDataToSend,
          }
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "فشل في إضافة المنتج");
        }
        showToast.dismiss(toastId);
        showToast.success("تم إضافة المنتج بنجاح");
        return response.json();
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

  // تحديث mutation تحديث المنتج
  const updateMutation = useMutation({
    mutationFn: async ({ id, formDataToSend }) => {
      const toastId = showToast.loading("جاري تحديث المنتج...");
      try {
        // إنشاء كائن للحقول المتغيرة
        const updatedFields = {
          CategoryID: formData.CategoryID, // مطلوب دائماً
        };

        // إضافة الحقول فقط إذا كانت غير فارغة
        if (formData.ProductName?.trim()) {
          updatedFields.ProductName = formData.ProductName.trim();
        }

        if (formData.Description?.trim()) {
          updatedFields.Description = formData.Description.trim();
        }

        if (formData.SKU?.trim()) {
          updatedFields.SKU = formData.SKU.trim();
        }

        if (formData.SellPrice) {
          const price = Number(formData.SellPrice);
          if (!isNaN(price) && price >= 0) {
            updatedFields.SellPrice = price;
          }
        }

        // إنشاء query params
        const queryParams = new URLSearchParams(updatedFields).toString();

        // إنشاء FormData جديد
        const formDataToSend = new FormData();

        // إذا كان هناك صور للحذف
        if (imagesToDelete.length > 0) {
          formDataToSend.append("delete_image_ids", imagesToDelete.join(","));
        }

        // التحقق من عدد الصور
        const currentImagesCount = currentProduct.images?.length || 0;
        const deletedImagesCount = imagesToDelete.length;
        const newImagesCount = selectedFiles.length;
        const totalImagesAfterUpdate =
          currentImagesCount - deletedImagesCount + newImagesCount;

        if (totalImagesAfterUpdate > 5) {
          throw new Error("لا يمكن إضافة أكثر من 5 صور للمنتج");
        }

        // إضافة الصور الجديدة إلى FormData
        if (selectedFiles.length > 0) {
          selectedFiles.forEach((file) => {
            // التحقق من حجم الملف (مثلاً: 5MB)
            if (file.size > 5 * 1024 * 1024) {
              throw new Error(
                `الملف ${file.name} كبير جداً. الحد الأقصى هو 5 ميجابايت`
              );
            }
            formDataToSend.append("files", file);
          });
        }

        // إرسال الطلب
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/product/${id}?${queryParams}`,
          {
            method: "PATCH",
            headers: { accept: "application/json" },
            body:
              selectedFiles.length > 0 || imagesToDelete.length > 0
                ? formDataToSend
                : undefined,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "فشل في تحديث المنتج");
        }

        showToast.dismiss(toastId);
        showToast.success("تم تحديث المنتج بنجاح");
        return response.json();
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
        const response = await fetch(
          `https://backend-v1-psi.vercel.app/product/${id}`,
          {
            method: "DELETE",
            headers: { accept: "application/json" },
          }
        );
        if (!response.ok) {
          throw new Error("فشل في حذف المنتج");
        }
        showToast.dismiss(toastId);
        showToast.success("تم حذف المنتج بنجاح");
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
      setError(error.message);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const resetForm = () => {
    setFormData({
      ProductName: "",
      Description: "",
      CategoryID: "",
      SellPrice: "",
      SKU: "",
    });
    setSelectedFiles([]);
    setMainImageIndex(0);
    setEditingId(null);
    setCurrentProduct(null);
    setImagesToDelete([]);
  };

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

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]);
  };

  // حساب المنتجات المعروضة في الصفحة الحالية
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

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
        handleFileChange={handleFileChange}
        mainImageIndex={mainImageIndex}
        setMainImageIndex={setMainImageIndex}
        imagesToDelete={imagesToDelete}
        handleDeleteImage={handleDeleteImage}
      />
    </div>
  );
}
