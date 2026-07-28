import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Office System",
  description: "ระบบลงเวลาและจัดการวันลาสำหรับพนักงาน",
  manifest: "/manifest.json",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={notoSansThai.className}>
        <div className="flex min-h-dvh items-center justify-center bg-gray-200 sm:p-4">
          
          {/* 🌟 เรียกใช้ตัวแปรตรงนี้ โค้ดจะดูคลีนมาก */}
          <div className="mobile-app-container">
            
            <main className="min-h-0 flex-1 overflow-y-auto pb-12">
              {children}
              <Toaster position="top-center" richColors closeButton />
            </main>

            <div className="absolute inset-x-0 bottom-0 z-50">
              <BottomNav />
            </div>
            
          </div>

        </div>
      </body>
    </html>
  );
}