"use client";
import { FaTimes } from "react-icons/fa";

export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  maxWidth = "2xl",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className={`bg-white rounded-2xl w-full max-w-${maxWidth} shadow-xl`}
      >
        {/* رأس النافذة */}
        <div className="p-6 border-b bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {Icon && (
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="text-blue-600 text-xl" />
                </div>
              )}
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* المحتوى */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
