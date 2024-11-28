const BASE_URL = "https://backend-v1-psi.vercel.app";

export const categoriesApi = {
    // جلب جميع الأصناف مع عدد المنتجات
    getCategoriesCount: async () => {
        const response = await fetch(`${BASE_URL}/categories/product-count/`, {
            headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error("فشل في جلب البيانات");
        return response.json();
    },

    // جلب جميع الأصناف
    getCategories: async () => {
        const response = await fetch(`${BASE_URL}/categories/`, {
            headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error("فشل في جلب البيانات");
        return response.json();
    },

    // إضافة صنف جديد
    addCategory: async (newCategory) => {
        const response = await fetch(`${BASE_URL}/categories/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(newCategory),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في إضافة الصنف");
        }
        return response.json();
    },

    // تحديث صنف
    updateCategory: async (id, data) => {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("فشل في تحديث الصنف");
        }
        return response.json();
    },

    // حذف صنف
    deleteCategory: async (id) => {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: "DELETE",
            headers: { accept: "application/json" },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في حذف الصنف");
        }
    }
}; 