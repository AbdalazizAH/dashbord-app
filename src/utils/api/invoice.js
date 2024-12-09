const BASE_URL = "https://backend-v1-psi.vercel.app";

export const invoiceApi = {
    // جلب جميع الفواتير
    getInvoices: async () => {
        const response = await fetch(`${BASE_URL}/invoices/`, {
            headers: { accept: "application/json" },
        });
        if (!response.ok) throw new Error("فشل في جلب الفواتير");
        return response.json();
    },

    // إضافة فاتورة جديدة
    addInvoice: async (newInvoice) => {
        const response = await fetch(`${BASE_URL}/invoices/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(newInvoice),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في إضافة لفاتورة");
        }
        return response.json();
    },

    // تحديث فاتورة
    updateInvoice: async (id, data) => {
        const response = await fetch(`${BASE_URL}/invoices/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في تحديث الفاتورة");
        }
        return response.json();
    },

    // حذف فاتورة
    deleteInvoice: async (id) => {
        const response = await fetch(`${BASE_URL}/invoices/${id}`, {
            method: "DELETE",
            headers: { accept: "application/json" },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في حذف الفاتورة");
        }
    },

    // إكمال الفاتورة
    completeInvoice: async (id) => {
        const response = await fetch(`${BASE_URL}/invoices/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({ is_completed: true }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في إكمال الفاتورة");
        }
        return response.json();
    },

    // التعامل مع عناصر الفاتورة
    invoiceItems: {
        // حذف عنصر من الفاتورة
        deleteItem: async (itemId) => {
            const response = await fetch(
                `${BASE_URL}/invoices-items/${itemId}`,
                {
                    method: "DELETE",
                    headers: { accept: "application/json" },
                }
            );
            if (!response.ok) throw new Error("فشل في حذف عنصر الفاتورة");
        },

        // إضافة عنصر للفاتورة
        addItem: async (item) => {
            const response = await fetch(`${BASE_URL}/invoices-items/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error("فشل في إضافة عنصر الفاتورة");
            return response.json();
        }
    }
}; 