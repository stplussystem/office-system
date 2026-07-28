"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  LogIn,
  LogOut,
  Loader2,
  ChevronLeft,
  Camera,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function CheckInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [employee, setEmployee] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const empData = localStorage.getItem("employee_data");
    if (empData) {
      const parsedEmp = JSON.parse(empData);
      setEmployee(parsedEmp);
      checkTodayStatus(parsedEmp.line_user_id);
      getLocation();
    } else {
      router.push("/login");
    }
  }, [router]);

  const checkTodayStatus = async (lineUserId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("line_user_id", lineUserId)
      .eq("work_date", today)
      .single();

    if (data) setTodayRecord(data);
  };

  const getLocation = () => {
    setLoadingLocation(true);
    setLocationName(null);

    if (!navigator.geolocation) {
      toast.error("เบราว์เซอร์ไม่รองรับ GPS");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });

        try {
          const apiKey = process.env.NEXT_PUBLIC_LONGDO_MAP_KEY;
          if (apiKey) {
            const res = await fetch(
              `https://api.longdo.com/map/services/address?lon=${lng}&lat=${lat}&key=${apiKey}`,
            );
            const data = await res.json();

            if (data && data.subdistrict && data.district) {
              setLocationName(
                `${data.subdistrict} ${data.district} ${data.province}`,
              );
            }
          }
        } catch (error) {
          console.error("Geocoding Error:", error);
        }

        setLoadingLocation(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        toast.error("กรุณาเปิดสิทธิ์ GPS ให้กับแอป");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhotoToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${employee.employee_code}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("attendance_photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("attendance_photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCheckIn = async () => {
    if (!location) {
      toast.error("กรุณารอระบุพิกัด GPS ก่อนลงเวลาครับ");
      return;
    }

    setIsSubmitting(true);
    const today = new Date().toISOString().split("T")[0];

    try {
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await uploadPhotoToSupabase(photoFile);
      }

      const { error } = await supabase.from("attendance").insert([
        {
          line_user_id: employee.line_user_id,
          work_date: today,
          check_in_time: new Date().toISOString(),
          check_in_lat: location.lat,
          check_in_lng: location.lng,
          check_in_photo_url: photoUrl,
          status: "Present",
        },
      ]);

      if (error) throw error;
      toast.success("บันทึกเวลาเข้างานสำเร็จ!");
      router.push("/");
    } catch (error) {
      console.error("Check-in Error:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      toast.error("กรุณารอระบุพิกัด GPS ก่อนลงเวลาครับ");
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await uploadPhotoToSupabase(photoFile);
      }

      const { error } = await supabase
        .from("attendance")
        .update({
          check_out_time: new Date().toISOString(),
          check_out_lat: location.lat,
          check_out_lng: location.lng,
          check_out_photo_url: photoUrl,
        })
        .eq("id", todayRecord.id);

      if (error) throw error;
      toast.success("บันทึกเวลาออกงานสำเร็จ!");
      router.push("/");
    } catch (error) {
      console.error("Check-out Error:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกเวลาออกงาน");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = todayRecord?.check_in_time && todayRecord?.check_out_time;

  return (
    // 🌟 ขยายขนาดความกว้างสำหรับ iPad (md:max-w-3xl lg:max-w-4xl) และเพิ่มเงา
    <div className="fixed inset-x-0 top-0 bottom-0 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto bg-[#FAFAFA] pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] md:border-x md:border-gray-200 md:shadow-2xl">
      {/* Header */}
      <div
        className="pt-12 md:pt-16 pb-16 md:pb-20 bg-cover bg-center relative overflow-hidden bg-blue-50 shrink-0"
        style={{ backgroundImage: `url('/img/bg-head.jpg')` }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

        <div className="px-6 md:px-10 flex items-center justify-between relative z-10">
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-gray-700 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={24} className="md:w-6 md:h-6" />
          </button>

          <h1 className="text-base md:text-lg font-bold text-gray-900 absolute left-1/2 -translate-x-1/2 drop-shadow-md">
            ลงเวลาเข้า-ออกงาน
          </h1>

          <div className="w-10 md:w-12"></div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-8 sm:h-12 md:h-16 block"
            preserveAspectRatio="none"
          >
            <path
              fill="#FAFAFA"
              d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z"
            ></path>
          </svg>
        </div>
      </div>

      <div className="px-6 md:px-10 flex flex-col items-center mt-4 md:mt-6">
        {/* กล่องเวลา และ GPS */}
        <div className="w-full bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center mb-6 md:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-36 md:h-36 bg-orange-50 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

          <div className="text-center mb-6 md:mb-8 relative z-10">
            {/* 🌟 ขยายขนาดเวลานาฬิกาให้ชัดเจนบน iPad */}
            <h2 className="text-5xl md:text-7xl font-light text-gray-900 tracking-tight tabular-nums">
              {mounted
                ? currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--:--:--"}
            </h2>
            <p className="text-sm md:text-lg text-gray-400 mt-2 md:mt-4 font-medium">
              {mounted
                ? currentTime.toLocaleDateString("th-TH", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "กำลังโหลด..."}
            </p>
          </div>

          <div className="flex items-center w-full bg-gray-50/80 backdrop-blur-sm px-4 md:px-6 py-2.5 md:py-4 rounded-full border border-gray-200 shadow-sm relative z-10">
            {loadingLocation ? (
              <div className="flex items-center gap-2 mx-auto">
                <Loader2 size={16} className="animate-spin text-blue-500 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium text-gray-600">
                  กำลังค้นหาตำแหน่ง...
                </span>
              </div>
            ) : location ? (
              <>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse shrink-0"></div>
                <div className="ml-2 md:ml-3 flex-1 min-w-0 flex flex-col justify-center">
                  <span className="text-[11px] md:text-sm font-bold text-gray-700 truncate block">
                    {locationName || "ระบุตำแหน่งสำเร็จ"}
                  </span>
                  {!locationName && (
                    <span className="text-[9px] md:text-xs text-gray-400 block truncate">
                      Lat: {location.lat.toFixed(4)}, Lng:{" "}
                      {location.lng.toFixed(4)}
                    </span>
                  )}
                </div>
                <button
                  onClick={getLocation}
                  className="ml-2 flex items-center gap-1 text-[10px] md:text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 md:px-4 md:py-2 rounded-md active:scale-95 transition-all shrink-0 cursor-pointer hover:bg-blue-100"
                >
                  <RefreshCw size={12} strokeWidth={2.5} className="md:w-4 md:h-4" />
                  รีเฟรช
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 mx-auto">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500 shrink-0"></div>
                <span className="text-xs md:text-sm font-medium text-gray-600">
                  ไม่พบตำแหน่ง
                </span>
                <button
                  onClick={getLocation}
                  className="ml-2 text-[10px] md:text-xs text-red-600 font-bold bg-red-50 px-2 md:px-3 py-1 md:py-1.5 rounded-md active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  ลองใหม่
                </button>
              </div>
            )}
          </div>
        </div>

        {/* พื้นที่ถ่ายรูป (ปรับลดความสำคัญลง มองเป็นตัวเลือก) */}
        {!isCompleted && (
          // 🌟 ให้กล่องอัปโหลดรูปมีความกว้างพอเหมาะบน iPad (ไม่ยืดกว้างเกินไป)
          <div className="w-full md:max-w-xl mx-auto mb-6 md:mb-8">
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={handlePhotoCapture}
              className="hidden"
              ref={fileInputRef}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-3xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer relative transition-all active:scale-[0.98] hover:bg-gray-100"
            >
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt="Selfie preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-gray-900/60 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-1.5">
                    <Camera size={14} className="md:w-5 md:h-5" /> เปลี่ยนรูป
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 mb-3 md:mb-4 border border-gray-100">
                    <ImageIcon size={24} className="md:w-8 md:h-8" />
                  </div>
                  <p className="text-sm md:text-base font-bold text-gray-600">
                    เพิ่มรูปถ่าย (ไม่บังคับ)
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2">
                    คลิกที่นี่เพื่อแนบรูปยืนยันตัวตน
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ปุ่มลงเวลา */}
        {/* 🌟 ให้ปุ่มมีความกว้างพอเหมาะบน iPad */}
        <div className="w-full md:max-w-xl mx-auto pb-8">
          {!todayRecord?.check_in_time ? (
            <button
              onClick={handleCheckIn}
              disabled={isSubmitting || !location}
              className={`cursor-pointer w-full py-4 md:py-5 rounded-[20px] md:rounded-[24px] flex items-center justify-center gap-2 transition-all ${
                isSubmitting || !location
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-lg shadow-blue-500/30"
              }`}
            >
              {isSubmitting ? (
                <Loader2 size={22} className="animate-spin md:w-6 md:h-6" />
              ) : (
                <LogIn size={22} className="md:w-6 md:h-6" />
              )}
              <span className="text-base md:text-lg font-bold">บันทึกเวลาเข้างาน</span>
            </button>
          ) : !todayRecord?.check_out_time ? (
            <button
              onClick={handleCheckOut}
              disabled={isSubmitting || !location}
              className={`cursor-pointer w-full py-4 md:py-5 rounded-[20px] md:rounded-[24px] flex items-center justify-center gap-2 transition-all ${
                isSubmitting || !location
                  ? "bg-gray-100 text-gray-400"
                  : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95 shadow-lg shadow-orange-500/30"
              }`}
            >
              {isSubmitting ? (
                <Loader2 size={22} className="animate-spin md:w-6 md:h-6" />
              ) : (
                <LogOut size={22} className="md:w-6 md:h-6" />
              )}
              <span className="text-base md:text-lg font-bold">บันทึกเวลาออกงาน</span>
            </button>
          ) : (
            <div className="w-full py-6 md:py-8 rounded-3xl bg-green-50 border border-green-100 flex flex-col items-center justify-center gap-2">
              <CheckCircle2 size={32} className="text-green-500 md:w-10 md:h-10" />
              <p className="text-green-700 font-bold text-sm md:text-base mt-1 md:mt-2">
                บันทึกเวลาของวันนี้เรียบร้อยแล้ว
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}