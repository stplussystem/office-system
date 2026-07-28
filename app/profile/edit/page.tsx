"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { UserCog, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [lineProfile, setLineProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    position: "",
    email: "",
  });

  useEffect(() => {
    const empData = localStorage.getItem("employee_data");
    const profileData = localStorage.getItem("line_profile");

    if (empData) {
      const parsedEmp = JSON.parse(empData);
      setEmployeeId(parsedEmp.id);
      setFormData({
        firstName: parsedEmp.first_name || "",
        lastName: parsedEmp.last_name || "",
        nickname: parsedEmp.nickname || "",
        position: parsedEmp.position || "",
        email: parsedEmp.email || "",
      });

      if (profileData) {
        setLineProfile(JSON.parse(profileData));
      }

      setIsFetching(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("employees")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          nickname: formData.nickname,
          position: formData.position,
          email: formData.email,
        })
        .eq("id", employeeId)
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem("employee_data", JSON.stringify(data));

      toast.success("อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว!");
      router.back(); 
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดต กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    // 🌟 1. ปรับ Container ให้ยืดเต็มจอ Edge-to-Edge 
    <div className="fixed inset-0 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto h-full bg-[#FAFAFA] flex flex-col overflow-hidden md:border-x md:border-gray-200 md:shadow-2xl">
      
      {/* 🌟 2. Header (Fixed) */}
      <div
        className="pt-12 md:pt-16 pb-6 md:pb-12 bg-cover bg-center relative overflow-hidden bg-blue-50 shrink-0"
        style={{ backgroundImage: `url('/img/bg-head.jpg')` }}
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="px-6 md:px-10 flex items-center justify-between relative z-10 mb-0">
          <button
            onClick={() => router.back()}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center text-gray-700 active:scale-95 transition-all shadow-sm"
          >
            <ChevronLeft size={24} className="md:w-6 md:h-6" />
          </button>
          <div className="w-10 md:w-12"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center px-6 mt-4 md:mt-6">
          {/* 🌟 ขยายขนาดรูปโปรไฟล์บน iPad */}
          <div className="relative w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-[4px] md:border-[5px] border-white shadow-md shrink-0 bg-white mb-4">
            {lineProfile?.pictureUrl ? (
              <Image
                src={lineProfile.pictureUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                <UserCog size={40} className="text-blue-600 md:w-12 md:h-12" />
              </div>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 drop-shadow-sm">
            แก้ไขโปรไฟล์
          </h1>
        </div>
      </div>

      {/* 🌟 3. Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 pt-6 md:pt-8 pb-10">
        <form
          id="editProfileForm"
          onSubmit={handleSubmit}
          className="space-y-4 md:space-y-6"
        >
          {/* 🌟 ปรับให้ชื่อ-นามสกุล อยู่บรรทัดเดียวกันบน iPad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2 ml-1">
                ชื่อจริง
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-white rounded-[16px] md:rounded-[20px] border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm md:text-base font-medium"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2 ml-1">
                นามสกุล
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-white rounded-[16px] md:rounded-[20px] border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm md:text-base font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2 ml-1">
                ชื่อเล่น
              </label>
              <input
                type="text"
                name="nickname"
                required
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-white rounded-[16px] md:rounded-[20px] border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm md:text-base font-medium"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2 ml-1">
                ตำแหน่ง
              </label>
              <input
                type="text"
                name="position"
                required
                disabled
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-gray-100 rounded-[16px] md:rounded-[20px] border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm md:text-base font-medium text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* ฟิลด์อีเมล ขยายเต็มบรรทัดเหมือนเดิม */}
          <div>
            <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1.5 md:mb-2 ml-1">
              อีเมลสำรอง (สำหรับล็อกอินกรณีฉุกเฉิน)
            </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full px-4 md:px-5 py-3.5 md:py-4 bg-white rounded-[16px] md:rounded-[20px] border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm md:text-base font-medium" 
              placeholder="เช่น your.email@example.com" 
            />
          </div>
          
          <div className="pt-4 md:pt-6">
            <button
              type="submit"
              form="editProfileForm"
              disabled={loading}
              className={`cursor-pointer w-full font-bold md:text-lg py-4 md:py-5 rounded-[16px] md:rounded-[24px] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                loading
                  ? "bg-gray-100 text-gray-400"
                  : "bg-gray-900 hover:bg-black text-white shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin md:w-6 md:h-6" /> กำลังบันทึก...
                </>
              ) : (
                "บันทึกการแก้ไข"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}