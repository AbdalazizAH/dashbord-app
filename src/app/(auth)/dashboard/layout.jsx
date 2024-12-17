"use client";
import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaUsers,
  FaBox,
  FaChartLine,
  FaCog,
  FaHome,
  FaClipboardList,
} from "react-icons/fa";
import { showToast } from "@/utils/toast";
import { useAuth } from "@/app/providers/AuthProvider";
import Sidebar from "../../../components/componentslayout/Sidebar";
import Header from "../../../components/componentslayout/Header";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
    showToast.success("تم تسجيل الخروج بنجاح");
  }, [router]);

  const menuItems = [
    { icon: <FaHome />, title: "الرئيسية", path: "/dashboard" },
    { icon: <FaBox />, title: "الأصناف", path: "/dashboard/categories" },
    { icon: <FaBox />, title: "المنتجات", path: "/dashboard/products" },
    { icon: <FaUsers />, title: "الموردين", path: "/dashboard/suppliers" },
    { icon: <FaClipboardList />, title: "الفواتير", path: "/dashboard/invoices" },
    { icon: <FaClipboardList />, title: "الطلبات", path: "/dashboard/orders" },
    { icon: <FaUsers />, title: "الإعدادات", path: "/dashboard/settings" },
    { icon: <FaChartLine />, title: "التقارير", path: "/dashboard/reports" },
    ...(user?.role === "manager"
      ? [{ icon: <FaCog />, title: "مديري المحتوي", path: "/dashboard/admins" }]
      : []),
  ];

  const currentPageTitle = menuItems.find((item) => item.path === pathname)?.title || "لوحة التحكم";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        menuItems={menuItems}
        onLogout={handleLogout}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "mr-64" : "mr-20"
        }`}
      >
        <Header title={currentPageTitle} user={user} />
        <div className="min-h-[calc(100vh-4rem)]">{children}</div>
      </main>
    </div>
  );
}
