'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from './providers/AuthProvider';
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // البيانات تعتبر قديمة بعد 30 ثانية
      cacheTime: 3600000, // تخزين البيانات لمدة ساعة
      retry: 2, // محاولة إعادة الطلب مرتين في حالة الفشل
      suspense: true, // تفعيل Suspense
      refetchOnWindowFocus: false, // عدم إعادة الطلب عند التركيز على النافذة
      refetchOnMount: false, // عدم إعادة الطلب عند تركيب المكون
    },
  },
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
