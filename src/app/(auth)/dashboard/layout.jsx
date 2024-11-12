"use client";
import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaUsers,
  FaBox,
  FaChartLine,
  FaSignOutAlt,
  FaShoppingCart,
  FaCog,
  FaHome,
  FaClipboardList,
  FaBars,
} from "react-icons/fa";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  }, [router]);

  const menuItems = [
    { icon: <FaHome />, title: "الرئيسية", path: "/dashboard" },
    { icon: <FaBox />, title: "الأصناف", path: "/dashboard/categories" },
    { icon: <FaBox />, title: "المنتجات", path: "/dashboard/products" },
    { icon: <FaUsers />, title: "الموردين", path: "/dashboard/suppliers" },
    {
      icon: <FaClipboardList />,
      title: "الفواتير",
      path: "/dashboard/invoices",
    },
    { icon: <FaClipboardList />, title: "الطلبات", path: "/dashboard/orders" },
    { icon: <FaUsers />, title: "العملاء", path: "/dashboard/customers" },
    { icon: <FaChartLine />, title: "التقارير", path: "/dashboard/reports" },
    { icon: <FaCog />, title: "الإعدادات", path: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg fixed right-0 top-0 h-full transition-all duration-300 z-50 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <span className="text-xl font-bold text-gray-800">
                متجرك الإلكتروني
              </span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <FaBars className="text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center p-4 hover:bg-blue-50 transition-colors ${
                pathname === item.path
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && (
                <span className="mr-4 text-sm font-medium">{item.title}</span>
              )}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center p-4 hover:bg-red-50 text-red-600 transition-colors mt-4"
          >
            <span className="text-xl">
              <FaSignOutAlt />
            </span>
            {isSidebarOpen && (
              <span className="mr-4 text-sm font-medium">تسجيل الخروج</span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "mr-64" : "mr-20"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find((item) => item.path === pathname)?.title ||
                  "لوحة التحكم"}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">مرحباً بك</span>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FaCog className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-4rem)]">{children}</div>
      </main>
    </div>
  );
}
