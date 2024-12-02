"use client";
import {
  FaBox,
  FaEdit,
  FaPlus,
  FaImage,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";
import { showToast } from "@/utils/toast";

export default function ProductModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  handleSubmit,
  editingId,
  currentProduct,
  categories,
  selectedFiles,
  handleFileChange,
  mainImageIndex,
  setMainImageIndex,
  imagesToDelete,
  handleDeleteImage,
}) {
  if (!isOpen) return null;

  const handleStatusChange = (value) => {
    const isActive = value === "true";
    const price = Number(formData.SellPrice);

    if (isActive && (!price || price === 0)) {
      showToast.error("لا يمكن تنشيط المنتج بسعر 0");
      return;
    }

    setFormData({
      ...formData,
      IsActive: isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8 relative">
        {/* رأس النافذة */}
        <div className="p-6 border-b bg-gray-50/80 backdrop-blur supports-[backdrop-filter]:bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBox className="text-blue-600 text-xl" />
              </div>
              {editingId ? "تعديل منتج" : "إضافة منتج جديد"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* نموذج الإضافة/التعديل */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="p-6 space-y-8 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
            {/* المعلومات الأساسية */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">
                  المعلومات الأساسية
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اسم المنتج */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    اسم المنتج{" "}
                    {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.ProductName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ProductName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white/70"
                      required={!editingId}
                      placeholder="مثال: قميص قطني"
                    />
                    {editingId && currentProduct?.ProductName && (
                      <div className="text-xs text-gray-500 mt-1">
                        القيمة الحالية: {currentProduct.ProductName}
                      </div>
                    )}
                  </div>
                </div>

                {/* الصنف */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    الصنف{" "}
                    {!editingId && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={formData.CategoryID}
                      onChange={(e) =>
                        setFormData({ ...formData, CategoryID: e.target.value })
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white/70"
                      required={!editingId}
                    >
                      <option value="">اختر الصنف</option>
                      {categories.map((category) => (
                        <option
                          key={category.CategoryID}
                          value={category.CategoryID}
                        >
                          {category.CategoryName}
                        </option>
                      ))}
                    </select>
                    {editingId && currentProduct?.CategoryName && (
                      <div className="text-xs text-gray-500 mt-1">
                        الصنف الحالي: {currentProduct.CategoryName}
                      </div>
                    )}
                  </div>
                </div>

                {/* السعر */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    السعر
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.SellPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, SellPrice: e.target.value })
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 pl-16 bg-white/70"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      د.ل
                    </span>
                    {editingId && currentProduct?.SellPrice && (
                      <div className="text-xs text-gray-500 mt-1">
                        السعر الحالي:{" "}
                        {currentProduct.SellPrice.toLocaleString("ar-LY")} د.ل
                      </div>
                    )}
                  </div>
                </div>

                {/* حالة المنتج */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    حالة المنتج
                  </label>
                  <div className="relative">
                    <select
                      value={formData.IsActive ? "true" : "false"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white/70"
                    >
                      <option value="true">نشط</option>
                      <option value="false">غير نشط</option>
                    </select>
                    <div className="mt-1">
                      {formData.IsActive ? (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-block">
                          المنتج سيظهر في المتجر
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full inline-block">
                          المنتج لن يظهر في المتجر
                        </span>
                      )}
                    </div>
                    {editingId && currentProduct?.IsActive !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        الحالة الحالية:{" "}
                        <span
                          className={`font-medium ${
                            currentProduct.IsActive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {currentProduct.IsActive ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* رمز المنتج */}
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    رمز المنتج (SKU)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.SKU}
                      onChange={(e) =>
                        setFormData({ ...formData, SKU: e.target.value })
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white/70"
                      placeholder="مثال: PRD-001"
                    />
                    {editingId && currentProduct?.SKU && (
                      <div className="text-xs text-gray-500 mt-1">
                        الرمز الحالي: {currentProduct.SKU}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">وصف المنتج</h3>
              </div>
              <div className="space-y-2">
                <textarea
                  value={formData.Description}
                  onChange={(e) =>
                    setFormData({ ...formData, Description: e.target.value })
                  }
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white/70"
                  rows="4"
                  placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                />
                {editingId && currentProduct?.Description && (
                  <div className="text-xs text-gray-500 mt-1">
                    الوصف الحالي: {currentProduct.Description}
                  </div>
                )}
              </div>
            </div>

            {/* الصور */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900">
                  صور المنتج{" "}
                  {!editingId && <span className="text-red-500">*</span>}
                </h3>
              </div>

              {/* عرض الصور الحالية في حالة التعديل */}
              {editingId && currentProduct?.images && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    الصور الحالية:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentProduct.images
                      .filter(
                        (img) => !imagesToDelete.includes(img.ProductImageID)
                      )
                      .map((img, index) => (
                        <div
                          key={img.ProductImageID}
                          className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-square relative">
                            <Image
                              src={img.ImageURL}
                              alt={img.AltText || `صورة ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {img.IsMainImage && (
                              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg shadow">
                                رئيسية
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteImage(img.ProductImageID)
                            }
                            className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* إضافة صور جديدة */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white/50 hover:bg-white/80 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center cursor-pointer gap-3 ${
                      !editingId && selectedFiles.length === 0
                        ? "required-field"
                        : ""
                    }`}
                  >
                    <div className="p-4 bg-blue-50 rounded-full">
                      <FaImage className="text-blue-500 text-3xl" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 font-medium">
                        {editingId
                          ? "تعديل صور المنتج (اختياري)"
                          : "اختر صوراً للمنتج"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        أو اسحب الصور وأفلتها هنا
                      </p>
                      {!editingId && (
                        <p className="text-red-500 text-sm mt-2">
                          * مطلوب صورة واحدة على الأقل
                        </p>
                      )}
                    </div>
                  </label>
                </div>

                {/* معاينة الصور المختارة */}
                {selectedFiles.length > 0 && (
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      الصور المختارة (اختر الصورة الرئيسية):
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          onClick={() => setMainImageIndex(index)}
                          className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            mainImageIndex === index
                              ? "border-blue-500 shadow-lg"
                              : "border-transparent hover:border-gray-200"
                          }`}
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`معاينة ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {mainImageIndex === index && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg shadow">
                              رئيسية
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="border-t px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              onClick={(e) => {
                if (!editingId && selectedFiles.length === 0) {
                  e.preventDefault();
                  showToast.error("يجب إضافة صورة واحدة على الأقل للمنتج");
                  document.getElementById("image-upload").focus();
                  return;
                }
                handleSubmit(e);
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
            >
              {editingId ? (
                <>
                  <FaEdit /> تحديث المنتج
                </>
              ) : (
                <>
                  <FaPlus /> إضافة المنتج
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
