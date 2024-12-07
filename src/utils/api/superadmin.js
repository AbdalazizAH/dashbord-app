import { getToken } from "@/utils/encryption";

const BASE_URL = "https://backend-v1-psi.vercel.app/dashboard";

export const superadmin = {
    // جلب جميع المديرين
    getAdmins: async () => {
        const token = getToken();
        const response = await fetch(`${BASE_URL}/admin`, {
            headers: {
                accept: "application/json",
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) throw new Error("فشل في جلب المديرين");
        return response.json();
    },

    // إضافة مدير جديد
    addAdmin: async (data) => {
        const token = getToken();
        const response = await fetch(`${BASE_URL}/create-admin/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في إضافة المدير");
        }
        return response.json();
    },

    // حذف مدير
    deleteAdmin: async (id) => {
        const token = getToken();
        const response = await fetch(`${BASE_URL}/admin/${id}`, {
            method: "DELETE",
            headers: {
                accept: "application/json",
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "فشل في حذف المدير");
        }
        return response.json();
    },

    // تحديث بيانات المدير
    //     updateAdmin: async (id, data) => {
    //         const token = getToken();
    //         const response = await fetch(`${BASE_URL}/admin/${id}`, {
    //             method: "PUT",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 accept: "application/json",
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify(data),
    //         });
    //         if (!response.ok) {
    //             const error = await response.json();
    //             throw new Error(error.detail || "فشل في تحديث بيانات المدير");
    //         }
    //         return response.json();
    //     },

    //     // تغيير كلمة المرور للمدير
    //     changePassword: async (id, data) => {
    //         const token = getToken();
    //         const response = await fetch(`${BASE_URL}/admin/${id}/change-password`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 accept: "application/json",
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify(data),
    //         });
    //         if (!response.ok) {
    //             const error = await response.json();
    //             throw new Error(error.detail || "فشل في تغيير كلمة المرور");
    //         }
    //         return response.json();
    //     },

    //     // تعليق حساب مدير
    //     suspendAdmin: async (id) => {
    //         const token = getToken();
    //         const response = await fetch(`${BASE_URL}/admin/${id}/suspend`, {
    //             method: "POST",
    //             headers: {
    //                 accept: "application/json",
    //                 'Authorization': `Bearer ${token}`
    //             },
    //         });
    //         if (!response.ok) {
    //             const error = await response.json();
    //             throw new Error(error.detail || "فشل في تعليق حساب المدير");
    //         }
    //         return response.json();
    //     },

    //     // إلغاء تعليق حساب مدير
    //     unsuspendAdmin: async (id) => {
    //         const token = getToken();
    //         const response = await fetch(`${BASE_URL}/admin/${id}/unsuspend`, {
    //             method: "POST",
    //             headers: {
    //                 accept: "application/json",
    //                 'Authorization': `Bearer ${token}`
    //             },
    //         });
    //         if (!response.ok) {
    //             const error = await response.json();
    //             throw new Error(error.detail || "فشل في إلغاء تعليق حساب المدير");
    //         }
    //         return response.json();
    //     },
};