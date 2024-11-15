"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { encryptToken } from "@/utils/encryption";
import { FaUser, FaLock, FaShoppingCart } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("client_id", "string");
    formData.append("client_secret", "string");

    try {
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
        router.push("/dashboard");
      } else {
        setError("خطأ في تسجيل الدخول");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    }
  };

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

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            تسجيل الدخول
          </h2>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border-r-4 border-red-500">
              <p className="text-red-600">{error}</p>
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
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              تسجيل الدخول
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
