const BASE_URL = "https://backend-v1-psi.vercel.app";

export const productApi = {
    // جلب جميع المنتجات
    getProducts: async () => {
        const response = await fetch(`${BASE_URL}/product/`, {
            headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error("فشل في جلب المنتجات");
        return response.json();
    },

    // إضافة منتج جديد
    addProduct: async (queryParams, formData) => {
        const response = await fetch(`${BASE_URL}/product/?${queryParams}`, {
            method: "POST",
            headers: { accept: "application/json" },
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في إضافة المنتج");
        }
        return response.json();
    },

    // تحديث منتج
    updateProduct: async (id, queryParams, formData, { currentProduct, selectedFiles, imagesToDelete }) => {
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
        const totalImagesAfterUpdate = currentImagesCount - deletedImagesCount + newImagesCount;

        if (totalImagesAfterUpdate > 5) {
            throw new Error("لا يمكن إضافة أكثر من 5 صور للمنتج");
        }

        // إضافة الصور الجديدة إلى FormData
        if (selectedFiles.length > 0) {
            selectedFiles.forEach((file) => {
                // التحقق من حجم الملف (مثلاً: 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`الملف ${file.name} كبير جداً. الحد الأقصى هو 5 ميجابايت`);
                }
                formDataToSend.append("files", file);
            });
        }

        // إرسال الطلب
        const response = await fetch(`${BASE_URL}/product/${id}?${queryParams}`, {
            method: "PATCH",
            headers: { accept: "application/json" },
            body: selectedFiles.length > 0 || imagesToDelete.length > 0 ? formDataToSend : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "فشل في تحديث المنتج");
        }
        return response.json();
    },

    // حذف منتج
    deleteProduct: async (id) => {
        const response = await fetch(`${BASE_URL}/product/${id}`, {
            method: "DELETE",
            headers: { accept: "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
            // التحقق من نوع الخطأ
            if (data.message?.includes("Product has existing orders/invoices")) {
                throw new Error("تم تعطيل المنتج بدلاً من حذفه لارتباطه بطلبات أو فواتير ");
            }
            throw new Error("فشل في حذف المنتج");
        }

        // إذا كان المنتج مرتبط بطلبات وتم تعطيله
        if (data.message?.includes("Product has existing orders/invoices")) {
            return {
                success: true,
                message: "تم تعطيل المنتج بدلاً من حذفه لارتباطه بطلبات أو فواتير "
            };
        }

        return data;
    },
};
