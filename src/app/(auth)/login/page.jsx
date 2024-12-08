"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { encryptToken } from "@/utils/encryption";
import { FaUser, FaLock, FaShoppingCart } from "react-icons/fa";
import { showToast } from "@/utils/toast";
import { useAuth } from "@/app/providers/AuthProvider";
import EmailVerification from "./components/EmailVerification";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = showToast.loading("جاري تسجيل الدخول...");
    setIsLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("grant_type", "password");
      formData.append("username", username);
      formData.append("password", password);
      formData.append("client_id", "string");
      formData.append("client_secret", "string");

      const response = await fetch("https://backend-v1-psi.vercel.app/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (data.access_token) {
        const encryptedToken = encryptToken(data.access_token);
        localStorage.setItem("token", encryptedToken);
        document.cookie = `token=${data.access_token}; path=/; secure; samesite=strict`;
        showToast.dismiss(toastId);
        showToast.success("تم تسجيل الدخول بنجاح");
        await login(data.access_token);
        router.push("/dashboard");
      } else if (data.is_email_verified === false) {
        showToast.dismiss(toastId);
        setNeedsVerification(true);
        setVerificationEmail(data.email);
      } else {
        showToast.dismiss(toastId);
        showToast.error("خطأ في اسم المستخدم أو كلمة المرور");
        setError("خطأ في اسم المستخدم أو كلمة المرور");
      }
    } catch (err) {
      showToast.dismiss(toastId);
      showToast.error("حدث خطأ في الاتصال بالخادم");
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setNeedsVerification(false);
    showToast.success("تم التحقق بنجاح، يرجى تسجيل الدخول مرة أخرى");
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <EmailVerification
              email={verificationEmail}
              onVerificationComplete={handleVerificationComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-white mb-4">
            <FaShoppingCart className="text-4xl text-blue-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            متجرك الإلكتروني
          </h1>
          <p className="text-blue-200">لوحة تحكم المسؤول</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            تسجيل الدخول
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border-r-4 border-red-500">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 rtl:text-right">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900"
                  required
                  placeholder="أدخل اسم المستخدم"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2 rtl:text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaLock />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900"
                  required
                  placeholder="أدخل كلمة المرور"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>جاري تسجيل الدخول...</span>
                </div>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm">
            جميع الحقوق محفوظة © {new Date().getFullYear()} متجرك الإلكتروني
          </p>
        </div>
      </div>
    </div>
  );
}
