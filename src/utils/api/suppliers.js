const BASE_URL = "https://backend-v1-psi.vercel.app";

export const suppliersApi = {
    // جلب جميع الموردين
    getSuppliers: async () => {
        const response = await fetch(`${BASE_URL}/suppliers/`, {
            headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error("فشل في جلب الموردين");
        return response.json();
    },

    // إضافة مورد جديد
    addSupplier: async (newSupplier) => {
        const response = await fetch(`${BASE_URL}/suppliers/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(newSupplier),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في إضافة المورد");
        }
        return response.json();
    },

    // تحديث مورد
    updateSupplier: async (id, data) => {
        const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في تحديث المورد");
        }
        return response.json();
    },

    // حذف مورد
    deleteSupplier: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
                method: "DELETE",
                headers: { accept: "application/json" },
            });

            const data = await response.json();

            // إذا كان هناك رسالة خطأ متعلقة بالفواتير
            if (data.detail?.includes("Cannot delete supplier") ||
                data.detail?.includes("Supplier has related invoices")) {
                throw new Error("لا يمكن حذف المورد لوجود فواتير مرتبطة به");
            }

            // للأخطاء الأخرى
            if (!response.ok) {
                throw new Error(data.detail || "فشل في حذف المورد");
            }

            return data;
        } catch (error) {
            throw error;
        }
    },
}; 