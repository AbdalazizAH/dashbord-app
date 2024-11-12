"use client";
import { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function QueryWrapper({ loading, error, children }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error.message || "حدث خطأ أثناء تحميل البيانات"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
