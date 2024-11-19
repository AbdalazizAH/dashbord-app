"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaCog,
  FaUser,
  FaLock,
  FaStore,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSave,
  FaPrint,
  FaMoneyBillWave,
  FaImage,
  FaBell,
  FaLanguage,
} from "react-icons/fa";
import { showToast } from "@/utils/toast";
import QueryWrapper from "@/components/shared/QueryWrapper";

export default function Settings() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إعدادات المتجر
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
    storeLogo: null,
    currency: "LYD",
    language: "ar",
  });

  // إعدادات كلمة المرور
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // إعدادات الطباعة
  const [printSettings, setPrintSettings] = useState({
    showLogo: true,
    showHeader: true,
    showFooter: true,
    headerText: "",
    footerText: "",
    paperSize: "A4",
  });

  // إعدادات الإشعارات
  const [notificationSettings, setNotificationSettings] = useState({
    lowStockNotification: true,
    lowStockThreshold: 10,
    orderNotification: true,
    emailNotification: true,
  });

  // إعدادات الضرائب والرسوم
  const [taxSettings, setTaxSettings] = useState({
    enableTax: false,
    taxRate: 0,
    taxNumber: "",
    enableServiceCharge: false,
    serviceChargeRate: 0,
  });

  // جلب الإعدادات
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/settings/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) showToast.error("فشل في جلب الإعدادات");
      return response.json();
    },
    onSuccess: (data) => {
      // تحديث جميع الإعدادات
      setGeneralSettings({
        storeName: data.storeName || "",
        storePhone: data.storePhone || "",
        storeEmail: data.storeEmail || "",
        storeAddress: data.storeAddress || "",
        storeLogo: data.storeLogo || null,
        currency: data.currency || "LYD",
        language: data.language || "ar",
      });
      setPrintSettings({
        showLogo: data.printSettings?.showLogo ?? true,
        showHeader: data.printSettings?.showHeader ?? true,
        showFooter: data.printSettings?.showFooter ?? true,
        headerText: data.printSettings?.headerText || "",
        footerText: data.printSettings?.footerText || "",
        paperSize: data.printSettings?.paperSize || "A4",
      });
      setNotificationSettings({
        lowStockNotification:
          data.notificationSettings?.lowStockNotification ?? true,
        lowStockThreshold: data.notificationSettings?.lowStockThreshold || 10,
        orderNotification: data.notificationSettings?.orderNotification ?? true,
        emailNotification: data.notificationSettings?.emailNotification ?? true,
      });
      setTaxSettings({
        enableTax: data.taxSettings?.enableTax ?? false,
        taxRate: data.taxSettings?.taxRate || 0,
        taxNumber: data.taxSettings?.taxNumber || "",
        enableServiceCharge: data.taxSettings?.enableServiceCharge ?? false,
        serviceChargeRate: data.taxSettings?.serviceChargeRate || 0,
      });
    },
  });

  // تحديث الإعدادات
  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      const toastId = showToast.loading("جاري حفظ الإعدادات...");
      try {
        const response = await fetch(
          "https://backend-v1-psi.vercel.app/settings/",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          throw new Error("فشل في تحديث الإعدادات");
        }
        showToast.dismiss(toastId);
        showToast.success("تم تحديث الإعدادات بنجاح");
        return response.json();
      } catch (error) {
        showToast.dismiss(toastId);
        showToast.error(error.message);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    },
  });

  // معالجة تحديث الإعدادات العامة
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSettingsMutation.mutateAsync({
        ...generalSettings,
        printSettings,
        notificationSettings,
        taxSettings,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <QueryWrapper loading={isLoading}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaCog className="text-blue-600 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
        </div>

        <div className="space-y-6">
          {/* الإعدادات العامة */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaStore className="text-blue-600" />
              إعدادات المتجر
            </h2>
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    اسم المتجر
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storeName}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storeName: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل اسم المتجر"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.storePhone}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storePhone: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storeEmail: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storeAddress}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storeAddress: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل عنوان المتجر"
                  />
                </div>
              </div>

              {/* إعدادات إضافية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    العملة
                  </label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        currency: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LYD">دينار ليبي</option>
                    <option value="USD">دولار أمريكي</option>
                    <option value="EUR">يورو</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    اللغة
                  </label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        language: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* شعار المتجر */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  شعار المتجر
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        storeLogo: e.target.files[0],
                      })
                    }
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <FaImage />
                    اختيار صورة
                  </label>
                  {generalSettings.storeLogo && (
                    <span className="text-sm text-gray-600">
                      تم اختيار: {generalSettings.storeLogo.name}
                    </span>
                  )}
                </div>
              </div>

              {/* إعدادات الطباعة */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FaPrint className="text-blue-600" />
                  إعدادات الطباعة
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printSettings.showLogo}
                        onChange={(e) =>
                          setPrintSettings({
                            ...printSettings,
                            showLogo: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      إظهار الشعار
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printSettings.showHeader}
                        onChange={(e) =>
                          setPrintSettings({
                            ...printSettings,
                            showHeader: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      إظهار الترويسة
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={printSettings.showFooter}
                        onChange={(e) =>
                          setPrintSettings({
                            ...printSettings,
                            showFooter: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      إظهار التذييل
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">
                        نص الترويسة
                      </label>
                      <input
                        type="text"
                        value={printSettings.headerText}
                        onChange={(e) =>
                          setPrintSettings({
                            ...printSettings,
                            headerText: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">
                        نص التذييل
                      </label>
                      <input
                        type="text"
                        value={printSettings.footerText}
                        onChange={(e) =>
                          setPrintSettings({
                            ...printSettings,
                            footerText: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* إعدادات الإشعارات */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FaBell className="text-blue-600" />
                  إعدادات الإشعارات
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.lowStockNotification}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            lowStockNotification: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      تنبيهات المخزون المنخفض
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderNotification}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            orderNotification: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      تنبيهات الطلبات الجديدة
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotification}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotification: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      تنبيهات البريد الإلكتروني
                    </label>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">
                      حد المخزون المنخفض
                    </label>
                    <input
                      type="number"
                      value={notificationSettings.lowStockThreshold}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          lowStockThreshold: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded-lg"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* إعدادات الضرائب والرسوم */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-blue-600" />
                  إعدادات الضرائب والرسوم
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={taxSettings.enableTax}
                        onChange={(e) =>
                          setTaxSettings({
                            ...taxSettings,
                            enableTax: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      تفعيل الضريبة
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={taxSettings.enableServiceCharge}
                        onChange={(e) =>
                          setTaxSettings({
                            ...taxSettings,
                            enableServiceCharge: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600"
                      />
                      تفعيل رسوم الخدمة
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">
                        نسبة الضريبة (%)
                      </label>
                      <input
                        type="number"
                        value={taxSettings.taxRate}
                        onChange={(e) =>
                          setTaxSettings({
                            ...taxSettings,
                            taxRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">
                        الرقم الضريبي
                      </label>
                      <input
                        type="text"
                        value={taxSettings.taxNumber}
                        onChange={(e) =>
                          setTaxSettings({
                            ...taxSettings,
                            taxNumber: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1">
                        نسبة رسوم الخدمة (%)
                      </label>
                      <input
                        type="number"
                        value={taxSettings.serviceChargeRate}
                        onChange={(e) =>
                          setTaxSettings({
                            ...taxSettings,
                            serviceChargeRate: parseFloat(e.target.value),
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaSave />
                  حفظ جميع الإعدادات
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </QueryWrapper>
  );
}
