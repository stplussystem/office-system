import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 🌟 1. ตั้งค่า PWA
const withPWA = withPWAInit({
  dest: "public",
  // disable: process.env.NODE_ENV === "development", // ปิด PWA ตอนรัน dev (npm run dev)
  disable: false, //🌟 เปลี่ยนบรรทัดนี้เป็น false เพื่อบังคับเปิด PWA ตลอดเวลา
  register: true,
  skipWaiting: true,
});

// 🌟 2. การตั้งค่า Next.js เดิมของโปรเจกต์ (เติม : NextConfig เข้าไปตรงนี้)
const nextConfig: NextConfig = {
  allowedDevOrigins: ["exchange-ending-getaway.ngrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "profile.line-scdn.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

// 🌟 3. นำ PWA มาครอบ NextConfig ก่อน export
export default withPWA(nextConfig);
