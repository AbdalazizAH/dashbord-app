import { memo, useState, useRef, useEffect } from 'react';
import { 
  FaCog, 
  FaBell, 
  FaUserCircle, 
  FaChevronDown,
} from "react-icons/fa";

const Header = memo(({ title, user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeStyle = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700 border border-purple-200",
      superadmin: "bg-red-100 text-red-700 border border-red-200",
      manager: "bg-blue-100 text-blue-700 border border-blue-200",
      default: "bg-gray-100 text-gray-700 border border-gray-200"
    };
    return styles[role] || styles.default;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Page Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-l from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">الإشعارات</h3>
                      <button className="text-xs text-blue-600 hover:text-blue-700">
                        تحديد الكل كمقروء
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="p-2.5 hover:bg-gray-50 rounded-md transition-colors border border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          <div>
                            <p className="text-sm text-gray-600">طلب جديد #1234</p>
                            <span className="text-xs text-gray-400">منذ 5 دقائق</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 hover:bg-gray-50 rounded-md transition-colors border border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-600"></div>
                          <div>
                            <p className="text-sm text-gray-600">تم اكتمال الطلب #1233</p>
                            <span className="text-xs text-gray-400">منذ 10 دقائق</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2 border-t">
                      عرض كل الإشعارات
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200">
                    <FaUserCircle className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeStyle(user?.role)}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <FaChevronDown className={`text-gray-400 text-sm transition-transform duration-200 
                  ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100">
                  <div className="py-1">
                    <button className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <FaUserCircle className="text-gray-400" />
                      <span>الملف الشخصي</span>
                    </button>
                    <button className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <FaCog className="text-gray-400" />
                      <span>الإعدادات</span>
                    </button>
                    <hr className="my-1" />
                    <button className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors group">
                      <span className="group-hover:text-red-700">تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header; 