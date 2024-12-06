"use client";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { showToast } from "@/utils/toast";

export default function RoleGuard({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      showToast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
      router.push("/dashboard");
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
