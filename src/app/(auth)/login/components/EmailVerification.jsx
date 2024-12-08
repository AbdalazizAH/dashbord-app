"use client";
import { useState } from "react";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { showToast } from "@/utils/toast";

export default function EmailVerification({ email, onVerificationComplete }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/authenticate/request-verification-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast.success("تم إرسال رمز التحقق بنجاح");
      } else {
        showToast.error(data.message || "حدث خطأ في إرسال رمز التحقق");
      }
    } catch (error) {
      showToast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/authenticate/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code: verificationCode,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        showToast.success("تم التحقق من البريد الإلكتروني بنجاح");
        onVerificationComplete();
      } else {
        showToast.error(data.message || "رمز التحقق غير صحيح");
      }
    } catch (error) {
      showToast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          التحقق من البريد الإلكتروني
        </h3>
        <p className="text-gray-600">
          يرجى التحقق من بريدك الإلكتروني {email} للحصول على رمز التحقق
        </p>
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            رمز التحقق
          </label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaKey />
            </div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="أدخل رمز التحقق"
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleRequestCode}
            disabled={isLoading}
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 disabled:opacity-50"
          >
            إعادة إرسال الرمز
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            تأكيد
          </button>
        </div>
      </form>
    </div>
  );
}
