"use client";

import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Loader2,
  ScanLine,
  Mail,
  ArrowLeft,
  KeyRound,
  MapPinHouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("กำลังตรวจสอบระบบ...");

  const [isEmailMode, setIsEmailMode] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const logoUrl = "";
  const bgImageUrl = "/img/login-bg.jpg";

  useEffect(() => {
    import("@line/liff")
      .then((liff) => {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          setStatusText("เกิดข้อผิดพลาด: ไม่พบ LIFF ID");
          setLoading(false);
          return;
        }

        liff.default
          .init({ liffId: liffId })
          .then(() => {
            if (liff.default.isLoggedIn()) {
              setStatusText("กำลังดึงข้อมูลพนักงาน...");
              checkEmployeeData(liff.default);
            } else {
              setLoading(false);
              setStatusText("ระบบลงเวลาและจัดการวันลาสำหรับพนักงาน");
            }
          })
          .catch((err) => {
            console.error(err);
            setStatusText("เกิดข้อผิดพลาดในการเชื่อมต่อ LINE");
            setLoading(false);
          });
      })
      .catch((err) => console.error(err));
  }, [router]);

  const checkEmployeeData = async (liffInstance: any) => {
    try {
      const profile = await liffInstance.getProfile();
      const lineUserId = profile.userId;

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("line_user_id", lineUserId)
        .single();

      if (error || !data) {
        localStorage.setItem("temp_line_profile", JSON.stringify(profile));
        router.push("/register");
        return;
      }

      // 🌟 แก้ไข: เปลี่ยนมาเช็ค is_active === false แทน status === "pending"
      if (data.is_active === false) {
        localStorage.setItem("line_profile", JSON.stringify(profile));
        router.push("/pending");
        return;
      }

      const localDeviceToken = localStorage.getItem("device_token");
      if (!localDeviceToken || localDeviceToken !== data.device_token) {
        toast.error("ไม่อนุญาตให้เข้าสู่ระบบจากอุปกรณ์อื่น");
        setLoading(false);
        setStatusText("อุปกรณ์นี้ไม่ได้รับอนุญาต");
        return;
      }

      localStorage.setItem("employee_data", JSON.stringify(data));
      localStorage.setItem("line_profile", JSON.stringify(profile));
      router.push("/");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    try {
      const liff = (await import("@line/liff")).default;
      if (!liff.isLoggedIn()) liff.login();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setLoading(true);
    setStatusText("กำลังตรวจสอบอีเมล...");

    try {
      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("email", emailInput)
        .single();

      if (empError || !empData) {
        toast.error("ไม่พบอีเมลนี้ในระบบ หรือคุณยังไม่ได้ผูกอีเมลสำรอง");
        setLoading(false);
        setStatusText("กรุณาลองใหม่อีกครั้ง");
        return;
      }

      // 🌟 แก้ไข: เปลี่ยนมาเช็ค is_active === false
      if (empData.is_active === false) {
        toast.warning("บัญชีนี้กำลังรอการอนุมัติจากแอดมิน");
        router.push("/pending");
        return;
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: emailInput,
      });

      if (authError) throw authError;

      toast.success("ส่งรหัส 6 หลักไปที่อีเมลของคุณแล้ว");
      setShowOtpInput(true);
      setStatusText("กรุณากรอกรหัส 6 หลักจากอีเมล");
      setLoading(false);
    } catch (error) {
      toast.error("ส่ง OTP ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;

    setLoading(true);
    setStatusText("กำลังยืนยันรหัส OTP...");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.verifyOtp({
          email: emailInput,
          token: otpInput,
          type: "email",
        });

      if (authError) throw authError;

      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("email", emailInput)
        .single();

      const newDeviceToken = crypto.randomUUID();

      await supabase
        .from("employees")
        .update({ device_token: newDeviceToken })
        .eq("id", empData.id);

      // 🌟 ป้องกันกรณีที่ล็อกอินด้วยอีเมลแล้วยังไม่มี line_user_id
      const fallbackProfile = {
        userId: empData.line_user_id || `temp_${empData.id}`,
        displayName:
          `${empData.first_name || ""} ${empData.last_name || ""}`.trim() ||
          empData.email,
        pictureUrl: "",
      };

      localStorage.setItem("device_token", newDeviceToken);
      localStorage.setItem("employee_data", JSON.stringify(empData));
      localStorage.setItem("line_profile", JSON.stringify(fallbackProfile));

      toast.success("ยืนยันตัวตนสำเร็จ! ยินดีต้อนรับครับ");
      router.push("/");
    } catch (error) {
      toast.error("รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว");
      setLoading(false);
      setStatusText("กรุณากรอกรหัส 6 หลักจากอีเมล");
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#FAFAFA] flex flex-col overflow-hidden">
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] md:w-[120%] h-[35%] md:h-[45%] rounded-b-[50%] pointer-events-none ${
          bgImageUrl
            ? "bg-cover bg-center"
            : "bg-gradient-to-b from-blue-50 to-blue-100/50"
        }`}
        style={bgImageUrl ? { backgroundImage: `url('${bgImageUrl}')` } : {}}
      >
        {bgImageUrl && (
          <div className="absolute inset-0 bg-white/30 rounded-b-[50%]"></div>
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 md:px-12 pt-10 md:pt-16">
        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl md:rounded-[32px] shadow-md border border-gray-50 flex items-center justify-center mb-6 md:mb-8 overflow-hidden shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo"
              fill
              className="object-contain p-2 md:p-3"
            />
          ) : (
            <MapPinHouse size={55} className="text-blue-600 md:w-20 md:h-20" />
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4 tracking-tight">
          OFFICE SYSTEM
        </h1>
        <p
          className={`text-sm md:text-lg text-center mb-10 md:mb-14 ${loading ? "text-blue-500 font-medium animate-pulse" : "text-gray-500"}`}
        >
          {statusText}
        </p>

        {!isEmailMode && !showOtpInput && (
          <div className="w-full flex flex-col items-center gap-3 md:gap-5">
            <button
              onClick={handleLineLogin}
              disabled={loading}
              className={`cursor-pointer w-full max-w-[320px] md:max-w-[400px] font-bold md:text-lg py-4 md:py-5 rounded-[16px] md:rounded-[24px] flex items-center justify-center gap-3 transition-all ${loading ? "bg-gray-100 text-gray-400" : "bg-[#06C755] hover:bg-[#05b34c] text-white shadow-lg shadow-[#06C755]/30 active:scale-95"}`}
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin md:w-7 md:h-7" />
              ) : (
                <>
                  <MessageCircle
                    size={24}
                    className="fill-white md:w-7 md:h-7"
                  />{" "}
                  เข้าสู่ระบบด้วย LINE
                </>
              )}
            </button>

            <button
              onClick={() => setIsEmailMode(true)}
              disabled={loading}
              className="cursor-pointer w-full max-w-[320px] md:max-w-[400px] font-bold md:text-lg py-4 md:py-5 rounded-[16px] md:rounded-[24px] flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <Mail size={20} className="text-gray-500 md:w-6 md:h-6" />{" "}
              เข้าสู่ระบบด้วยอีเมลสำรอง
            </button>
          </div>
        )}

        {isEmailMode && !showOtpInput && (
          <form
            onSubmit={handleSendOtp}
            className="w-full max-w-[320px] md:max-w-[400px] flex flex-col gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div>
              <input
                type="email"
                required
                placeholder="กรอกอีเมลของคุณ"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 md:px-6 py-4 md:py-5 bg-gray-50 border border-gray-200 rounded-[16px] md:rounded-[24px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm md:text-base font-medium"
              />
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setIsEmailMode(false)}
                className="p-4 md:p-5 bg-gray-100 rounded-[16px] md:rounded-[24px] text-gray-600 hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={20} className="md:w-6 md:h-6" />
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 font-bold md:text-lg py-4 md:py-5 rounded-[16px] md:rounded-[24px] flex items-center justify-center gap-2 transition-all cursor-pointer ${loading ? "bg-blue-100 text-blue-400" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 active:scale-95"}`}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin md:w-6 md:h-6" />
                ) : (
                  "ส่งรหัส OTP"
                )}
              </button>
            </div>
          </form>
        )}

        {isEmailMode && showOtpInput && (
          <form
            onSubmit={handleVerifyOtp}
            className="w-full max-w-[320px] md:max-w-[400px] flex flex-col gap-4 md:gap-5 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
                  <KeyRound size={20} className="text-gray-400 md:w-6 md:h-6" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="รหัส OTP 6 หลัก"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-4 md:py-5 bg-gray-50 border border-gray-200 rounded-[16px] md:rounded-[24px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-lg md:text-xl font-bold tracking-[0.2em] text-center"
                />
              </div>
              <p className="text-[10px] md:text-sm text-gray-400 text-center mt-2 md:mt-4">
                รหัสผ่านถูกส่งไปยัง: {emailInput}
              </p>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtpInput("");
                  setStatusText("ระบบลงเวลาและจัดการวันลาสำหรับพนักงาน");
                }}
                className="p-4 md:p-5 bg-gray-100 rounded-[16px] md:rounded-[24px] text-gray-600 hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft size={20} className="md:w-6 md:h-6" />
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 font-bold md:text-lg py-4 md:py-5 rounded-[16px] md:rounded-[24px] flex items-center justify-center gap-2 transition-all cursor-pointer ${loading ? "bg-blue-100 text-blue-400" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 active:scale-95"}`}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin md:w-6 md:h-6" />
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="relative z-10 pb-8 md:pb-12 px-8 mt-auto shrink-0">
        <p className="text-[11px] md:text-sm text-gray-400 text-center leading-relaxed">
          การเข้าสู่ระบบถือว่ายอมรับเงื่อนไขการใช้งาน
          <br />
          และนโยบายความเป็นส่วนตัวของบริษัท
        </p>
      </div>
    </div>
  );
}
