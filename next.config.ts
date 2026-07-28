import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // 🌟 บังคับเปิด PWA ตลอดเวลา
  // ลบ register และ skipWaiting ออกได้เลยครับ
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ค่า config อื่นๆ ของ Next.js
};

export default withPWA(nextConfig);
