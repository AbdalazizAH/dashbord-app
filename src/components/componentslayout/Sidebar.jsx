import { memo } from 'react';
import { useRouter, usePathname } from "next/navigation";
import {
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaAngleLeft
} from "react-icons/fa";

const Sidebar = memo(({ isSidebarOpen, setIsSidebarOpen, menuItems, onLogout }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside
        className={`bg-white fixed right-0 top-0 h-full transition-all duration-300 z-50 
        border-l border-gray-200 flex flex-col
        ${isSidebarOpen ? 'w-72' : 'w-20'}`}
      >
        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-4 bg-gradient-to-l from-blue-50/50 to-white">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-lg font-bold text-gray-800">
                متجر إلكتروني
              </span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/80 transition-all duration-200"
          >
            {isSidebarOpen ? (
              <FaAngleLeft className="text-gray-600" />
            ) : (
              <FaBars className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 px-2 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center p-3 rounded-lg group transition-all duration-200
                  ${pathname === item.path 
                    ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
              >
                <span className={`text-xl transition-transform duration-200 group-hover:scale-110 
                  ${pathname === item.path ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="mr-3 text-sm font-medium whitespace-nowrap">{item.title}</span>
                )}
                {isSidebarOpen && pathname === item.path && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 rounded-lg group transition-all duration-200
              text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent
              hover:border-red-100/50"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">
              <FaSignOutAlt />
            </span>
            {isSidebarOpen && (
              <span className="mr-3 text-sm font-medium">تسجيل الخروج</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar; 