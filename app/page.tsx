"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChevronRight,
  MapPin,
  Bell,
  Settings,
  LogOut,
  ClipboardList,
  Sun,
  HeartPulse,
  UserX,
  LogIn,
  Parasol,
  Moon,
  Sunset,
  Megaphone,
  UserCog,
  CarFront,
  Car,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import Tooltip from "@/components/ui/Tooltip";
import LoadingScreen from "@/components/LoadingScreen";

export default function HomePage() {
  const [employee, setEmployee] = useState<any>(null);
  const [lineProfile, setLineProfile] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const [activeTrip, setActiveTrip] = useState<any>(null);
  
  const [leaveStats, setLeaveStats] = useState({
    personal: 0,
    sick: 0,
    annual: 0,
    absent: 0
  });

  // 🌟 เพิ่ม State สำหรับเก็บจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const empData = localStorage.getItem("employee_data");
    const profileData = localStorage.getItem("line_profile");

    if (empData && profileData) {
      const parsedEmp = JSON.parse(empData);
      setEmployee(parsedEmp);
      setLineProfile(JSON.parse(profileData));

      Promise.all([
        fetchTodayAttendance(parsedEmp.line_user_id),
        checkActiveTrip(parsedEmp.line_user_id),
        fetchLeaveStats(parsedEmp.line_user_id),
        fetchUnreadNotifications(parsedEmp.line_user_id) // 🌟 โหลดแจ้งเตือน
      ]).finally(() => {
        setLoading(false);
      });
      
    } else {
      const searchParams = window.location.search;
      window.location.replace(`/login${searchParams}`);
    }
  }, [router]);

  // 🌟 ฟังก์ชันนับการแจ้งเตือน
  const fetchUnreadNotifications = async (lineUserId: string) => {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("line_user_id", lineUserId)
      .eq("is_read", false);

    if (!error && count !== null) {
      setUnreadCount(count);
    }
  };

  const fetchLeaveStats = async (lineUserId: string) => {
    const currentYear = new Date().getFullYear();
    const { data, error } = await supabase
      .from("leave_requests")
      .select("leave_type, total_days")
      .eq("line_user_id", lineUserId)
      .eq("status", "approved")
      .gte("start_date", `${currentYear}-01-01`)
      .lte("end_date", `${currentYear}-12-31`);

    if (error) return;

    const stats = { personal: 0, sick: 0, annual: 0, absent: 0 };
    if (data) {
      data.forEach((leave) => {
        const type = leave.leave_type?.toLowerCase();
        const days = Number(leave.total_days) || 0;
        
        if (type === "personal") stats.personal += days;
        else if (type === "sick") stats.sick += days;
        else if (type === "annual") stats.annual += days;
      });
    }
    setLeaveStats(stats);
  };

  const checkActiveTrip = async (lineUserId: string) => {
    const { data } = await supabase
      .from("travel_trips")
      .select("*")
      .eq("line_user_id", lineUserId)
      .eq("status", "in_progress")
      .limit(1)
      .single();

    if (data) setActiveTrip(data);
    else setActiveTrip(null);
  };

  const fetchTodayAttendance = async (lineUserId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("line_user_id", lineUserId)
      .eq("work_date", today)
      .single();

    if (data) setTodayAttendance(data);
  };

  if (loading) return <LoadingScreen text="กำลังโหลดข้อมูล..." />;

  const formatTime = (isoString: string) => {
    if (!isoString) return "-- : --";
    const date = new Date(isoString);
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const hasCheckedIn = !!todayAttendance?.check_in_time;
  const hasCheckedOut = !!todayAttendance?.check_out_time;
  const annualLeaveQuota = employee?.annual_leave_quota || 6; 

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto bg-[#FAFAFA] pb-28 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] md:border-x md:border-gray-200 md:shadow-2xl">
      {(() => {
        const hour = new Date().getHours();
        let greetingText = "สวัสดีตอนเช้า";
        let GreetingIcon = Sun;
        let iconColor = "text-yellow-500";

        if (hour >= 12 && hour < 16) {
          greetingText = "สวัสดีตอนบ่าย";
        } else if (hour >= 16 && hour < 19) {
          greetingText = "สวัสดีตอนเย็น";
          GreetingIcon = Sunset;
          iconColor = "text-orange-500";
        } else if (hour >= 19 || hour < 5) {
          greetingText = "สวัสดีตอนกลางคืน";
          GreetingIcon = Moon;
          iconColor = "text-indigo-500";
        }

        const headerBgUrl = "/img/bg-head.jpg";

        return (
          <div
            className="relative w-full bg-cover bg-center bg-no-repeat px-6 md:px-10 pt-12 md:pt-16 pb-6 md:pb-8 rounded-b-[32px] md:rounded-b-[40px] border-b border-gray-100 bg-white"
            style={{ backgroundImage: headerBgUrl ? `url("${headerBgUrl}")` : "none" }}
          >
            {headerBgUrl && (
              <div className="absolute inset-0 bg-white/60 rounded-b-[32px] md:rounded-b-[40px]"></div>
            )}

            <div className="flex items-center justify-between relative z-10">
              <div onClick={() => router.push("/profile/edit")} className="flex items-center gap-4 md:gap-5 cursor-pointer active:scale-95 transition-transform">
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-white">
                  {lineProfile?.pictureUrl ? (
                    <Image src={lineProfile.pictureUrl} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">IMG</div>
                  )}
                </div>
                <div>
                  <p className="flex items-center text-xs md:text-sm font-bold text-gray-700 mb-0.5 drop-shadow-md">
                    {greetingText}
                    <GreetingIcon size={16} strokeWidth={2.5} className={`${iconColor} ml-1.5 md:w-5 md:h-5`} />
                  </p>
                  <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight drop-shadow-md">
                    {employee ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim() : lineProfile?.displayName}
                  </h1>
                  <p className="text-[10px] md:text-xs text-blue-700 font-bold mt-1 bg-white/80 backdrop-blur-md inline-block px-2.5 py-0.5 rounded-full border border-white/50 shadow-sm">
                    {employee?.role || "พนักงาน"}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 md:gap-3">
                <Tooltip content="การแจ้งเตือน" position="bottom">
                  <button
                    type="button"
                    onClick={() => router.push("/notifications")}
                    aria-label="การแจ้งเตือน"
                    className="relative cursor-pointer flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/50 bg-white/80 text-gray-700 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-blue-600 active:scale-95"
                  >
                    <Bell size={20} className="md:w-6 md:h-6" />
                    {/* 🌟 จุดสีแดงแสดงตัวเลขการแจ้งเตือน */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-red-500 text-[9px] md:text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-bounce">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                </Tooltip>

                <Tooltip content="แก้ไขโปรไฟล์" position="bottom">
                  <button
                    type="button"
                    onClick={() => router.push("/profile/edit")}
                    aria-label="โปรไฟล์และการตั้งค่า"
                    className="cursor-pointer flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/50 bg-white/80 text-gray-700 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-blue-600 active:scale-95"
                  >
                    <UserCog size={20} className="md:w-6 md:h-6" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="px-6 md:px-10 mt-4 md:mt-6 space-y-4 md:space-y-6">
        <button onClick={() => router.push("/hr")} className="w-full text-left focus:outline-none active:scale-[0.98] transition-transform block cursor-pointer">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-blue-100 py-3 md:py-4 px-4 md:px-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-200 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <ClipboardList size={25} strokeWidth={1.5} className="md:w-7 md:h-7" />
              </div>
              <div className="flex flex-col ml-auto items-end">
                <p className="text-[14px] md:text-sm text-gray-500 font-medium mb-0.5">ลากิจ</p>
                <h4 className="text-[18px] md:text-xl font-bold text-gray-900 leading-none">
                  {leaveStats.personal} <span className="text-[10px] md:text-xs font-normal text-gray-400">วัน</span>
                </h4>
              </div>
            </div>

            <div className="bg-orange-100 py-3 md:py-4 px-4 md:px-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 flex items-center gap-3">
              <div className="w-11 h-11 md:w-14 md:h-14 bg-orange-200 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <Parasol size={22} strokeWidth={1.5} className="md:w-7 md:h-7" />
              </div>
              <div className="flex flex-col ml-auto items-end">
                <p className="text-[14px] md:text-sm text-gray-500 font-medium mb-0.5">พักร้อน</p>
                <h4 className="text-[18px] md:text-xl font-bold text-gray-900 leading-none">
                  {leaveStats.annual}/{annualLeaveQuota} <span className="text-[10px] md:text-xs font-normal text-gray-400">วัน</span>
                </h4>
              </div>
            </div>

            <div className="bg-pink-100 py-3 md:py-4 px-4 md:px-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 flex items-center gap-3">
              <div className="w-11 h-11 md:w-14 md:h-14 bg-pink-200 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                <HeartPulse size={22} strokeWidth={1.5} className="md:w-7 md:h-7" />
              </div>
              <div className="flex flex-col ml-auto items-end">
                <p className="text-[12px] md:text-sm text-gray-500 font-medium mb-0.5">ลาป่วย</p>
                <h4 className="text-[18px] md:text-xl font-bold text-gray-900 leading-none">
                  {leaveStats.sick} <span className="text-[10px] md:text-xs font-normal text-gray-400">วัน</span>
                </h4>
              </div>
            </div>

            <div className="bg-gray-200 py-3 md:py-4 px-4 md:px-5 rounded-2xl border border-gray-100 shadow-sm shadow-gray-100/50 flex items-center gap-3">
              <div className="w-11 h-11 md:w-14 md:h-14 bg-gray-300 text-gray-600 rounded-xl flex items-center justify-center shrink-0">
                <UserX size={22} strokeWidth={1.5} className="md:w-7 md:h-7" />
              </div>
              <div className="flex flex-col ml-auto items-end">
                <p className="text-[12px] md:text-sm text-gray-500 font-medium mb-0.5">ขาดงาน</p>
                <h4 className="text-[18px] md:text-xl font-bold text-gray-900 leading-none">
                  {leaveStats.absent} <span className="text-[10px] md:text-xs font-normal text-gray-400">วัน</span>
                </h4>
              </div>
            </div>
          </div>
        </button>

        <div className="bg-gray-100 p-3 md:p-5 rounded-[24px] md:rounded-[32px] mt-6 md:mt-8">
          <div className="grid grid-cols-2 gap-3 md:gap-5">
            <button
              onClick={() => !hasCheckedIn && router.push("/check-in")}
              disabled={hasCheckedIn}
              className={`w-full text-left p-4 md:p-6 rounded-2xl md:rounded-[24px] border transition-all relative overflow-hidden ${
                !hasCheckedIn ? "bg-blue-100 border-blue-200 shadow-md shadow-blue-100 cursor-pointer active:scale-95 hover:border-blue-300" : "bg-white border-gray-100 shadow-sm cursor-default"
              }`}
            >
              {!hasCheckedIn && <LogIn size={150} strokeWidth={1.5} className="absolute -right-4 -bottom-8 text-blue-300/50 pointer-events-none md:w-[200px] md:h-[200px]" />}
              <div className="relative z-10">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 ${!hasCheckedIn ? "bg-blue-600 text-white" : "bg-green-100 text-green-600"}`}>
                  <Clock size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
                </div>
                <p className={`text-sm md:text-base font-medium mb-1 md:mb-2 ${!hasCheckedIn ? "text-blue-600" : "text-gray-500"}`}>
                  {!hasCheckedIn ? "ลงเวลาเข้างาน" : "เวลาเข้างาน"}
                </p>
                <h4 className="text-xl md:text-3xl font-bold text-gray-900">{formatTime(todayAttendance?.check_in_time)}</h4>
              </div>
            </button>

            <button
              onClick={() => hasCheckedIn && !hasCheckedOut && router.push("/check-in")}
              disabled={!hasCheckedIn || hasCheckedOut}
              className={`w-full text-left p-4 md:p-6 rounded-2xl md:rounded-[24px] border transition-all relative overflow-hidden ${
                !hasCheckedIn ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" : hasCheckedIn && !hasCheckedOut ? "bg-orange-100 border-orange-200 shadow-md shadow-orange-100 cursor-pointer active:scale-95 hover:border-orange-300" : "bg-white border-gray-100 shadow-sm cursor-default"
              }`}
            >
              {hasCheckedIn && !hasCheckedOut && <LogOut size={150} strokeWidth={1.5} className="absolute -right-4 -bottom-8 text-orange-300/50 pointer-events-none md:w-[200px] md:h-[200px]" />}
              <div className="relative z-10">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 ${!hasCheckedIn ? "bg-gray-200 text-gray-400" : hasCheckedIn && !hasCheckedOut ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-600"}`}>
                  <LogOut size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
                </div>
                <p className={`text-sm md:text-base font-medium mb-1 md:mb-2 ${!hasCheckedIn ? "text-gray-400" : hasCheckedIn && !hasCheckedOut ? "text-orange-600" : "text-gray-500"}`}>
                  {hasCheckedIn && !hasCheckedOut ? "ลงเวลาออกงาน" : "เวลาออกงาน"}
                </p>
                <h4 className={`text-xl md:text-3xl font-bold ${!hasCheckedIn ? "text-gray-400" : "text-gray-900"}`}>{formatTime(todayAttendance?.check_out_time)}</h4>
              </div>
            </button>
          </div>

          <button onClick={() => router.push("/attendance")} className="w-full mt-4 md:mt-5 bg-white border border-gray-100 p-4 md:p-5 rounded-[20px] flex items-center justify-between shadow-sm active:scale-95 transition-all cursor-pointer hover:border-blue-200">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Clock size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
              </div>
              <span className="text-sm md:text-base font-bold">ประวัติการลงเวลาทั้งหมด</span>
            </div>
            <ChevronRight size={18} className="text-gray-400 md:w-6 md:h-6" />
          </button>

          {activeTrip && (
            <div onClick={() => router.push("/travel")} className="cursor-pointer mt-3 md:mt-4 w-full bg-red-50 border border-red-200 p-4 md:p-5 rounded-2xl flex items-center justify-between shadow-sm animate-pulse hover:bg-red-100 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md shadow-red-500/30 animate-wobble">
                  <Car size={20} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-red-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>กำลังบันทึกเดินทาง</p>
                  <p className="text-[11px] md:text-xs text-gray-600 line-clamp-1 mt-0.5">หัวข้อ: {activeTrip.purpose || "การเดินทางค้างไว้"}</p>
                </div>
              </div>
              <div className="text-xs md:text-sm font-bold text-red-600 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-red-100 shadow-sm">จัดการต่อ &rarr;</div>
            </div>
          )}
        </div>

        <div className="mt-6 md:mt-8 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-1 font-bold text-md md:text-lg text-gray-900">
              <Megaphone size={16} className="text-blue-500 ml-2 md:w-5 md:h-5" /><span>ข่าวสาร</span>
            </h3>
            <button className="text-[11px] md:text-xs text-blue-600 font-bold bg-blue-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full active:scale-95 transition-transform cursor-pointer hover:bg-blue-100">ดูทั้งหมด</button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="snap-center shrink-0 w-[85%] md:w-[45%] h-36 md:h-44 relative rounded-[24px] overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 flex flex-col justify-end">
                <span className="bg-blue-600/80 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md w-fit mb-1.5">ประกาศวันหยุด</span>
                <h4 className="font-bold text-white text-sm md:text-base mb-0.5 line-clamp-1">ประกาศวันหยุดสงกรานต์ ประจำปี 2569</h4>
                <p className="text-[11px] md:text-xs text-gray-300 line-clamp-1">บริษัทขอประกาศแจ้งวันหยุดทำการในช่วงเทศกาลสงกรานต์...</p>
              </div>
            </div>

            <div className="snap-center shrink-0 w-[85%] md:w-[45%] h-36 md:h-44 relative rounded-[24px] overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-5 flex flex-col justify-end">
                <span className="bg-orange-500/80 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md w-fit mb-1.5">สวัสดิการ</span>
                <h4 className="font-bold text-white text-sm md:text-base mb-0.5 line-clamp-1">อัปเดตสวัสดิการพนักงานใหม่</h4>
                <p className="text-[11px] md:text-xs text-gray-300 line-clamp-1">เพิ่มโควตาวันลาพักร้อนและงบประมาณสำหรับการอบรม...</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-1">
            <div className="w-5 h-1.5 bg-blue-600 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}