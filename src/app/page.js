import Image from "next/image";
import Link from "next/link";
import { FaSignInAlt, FaGlobe } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-white mb-4">
            <FaSignInAlt className="text-4xl text-blue-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            متجرك الإلكتروني
          </h1>
          <p className="text-blue-200">لوحة تحكم المسؤول</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="space-y-6">
            <Link
              href="/login"
              className="block transform hover:scale-105 transition-transform duration-200"
            >
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-900 transition-colors flex items-center justify-center gap-2">
                <FaSignInAlt />
                <span>تسجيل دخول المدير</span>
              </button>
            </Link>

            <Link
              href="https://web-site-app-19.vercel.app/"
              className="block text-center text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-200 flex items-center justify-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGlobe />
              زيارة الموقع الرئيسي
            </Link>
          </div>
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
