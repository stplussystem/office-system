"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface CalendarViewProps {
  events: any[];
  isLoading: boolean;
  onDateClick: (dateStr: string) => void;
  onEventClick: (event: any) => void;
}

export default function CalendarView({ events, isLoading, onDateClick, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-gray-100 bg-gray-50/50 rounded-xl"></div>);
  }

  // หาวันที่ปัจจุบัน (รูปแบบ YYYY-MM-DD)
  const todayDate = new Date();
  todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
  const todayString = todayDate.toISOString().split("T")[0];

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDayString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayEvents = events.filter(evt => evt.event_date === currentDayString);
    
    const isToday = todayString === currentDayString;
    // 🌟 เช็คว่าเป็นอดีตหรือไม่ (ถ้าน้อยกว่าวันปัจจุบันคืออดีต)
    const isPast = currentDayString < todayString;

    // 🌟 กำหนดคลาสสำหรับช่องวันที่ตามสถานะ
    let dayClass = "h-24 md:h-32 border p-1 md:p-2 flex flex-col gap-1 overflow-y-auto transition-all rounded-xl ";
    
    if (isPast) {
      // วันที่ผ่านมาแล้ว: พื้นเทาจางๆ และเปลี่ยน Cursor 
      dayClass += "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed";
    } else if (isToday) {
      // วันนี้: เน้นสีฟ้า
      dayClass += "border-blue-400 bg-blue-50/30 cursor-pointer hover:border-blue-300 hover:shadow-md";
    } else {
      // วันในอนาคต: พื้นขาวปกติ
      dayClass += "border-gray-200 bg-white cursor-pointer hover:border-blue-300 hover:shadow-md";
    }

    days.push(
      <div 
        key={d} 
        // 🌟 ดักไว้ว่าถ้าไม่ใช่อดีต ถึงจะอนุญาตให้คลิกเพิ่มงานได้
        onClick={() => {
          if (!isPast) onDateClick(currentDayString);
        }}
        className={dayClass}
      >
        <div className="flex justify-between items-center px-1 mb-1">
          <span className={`text-xs md:text-sm font-bold ${isToday ? "text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full" : "text-gray-600"}`}>
            {d}
          </span>
        </div>
        
        <div className="flex flex-col gap-1">
          {dayEvents.map((evt) => {
            let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
            if (evt.event_type === "meeting") colorClass = "bg-blue-100 text-blue-700 border-blue-200";
            if (evt.event_type === "holiday") colorClass = "bg-red-100 text-red-700 border-red-200";
            if (evt.event_type === "general") colorClass = "bg-green-100 text-green-700 border-green-200";

            return (
              <div 
                key={evt.id} 
                onClick={(e) => {
                  // 🌟 ตัว e.stopPropagation() ทำให้สามารถคลิกดูอีเวนต์ในวันอดีตได้ โดยไม่โดนบล็อก
                  e.stopPropagation();
                  onEventClick(evt);
                }}
                className={`text-[10px] md:text-xs truncate px-1.5 py-1 rounded cursor-pointer transition-colors border ${colorClass} hover:opacity-80`}
                title={evt.title}
              >
                {evt.start_time && <span className="font-semibold mr-1">{evt.start_time.substring(0, 5)}</span>}
                {evt.title}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col items-center">
      {/* Controls เปลี่ยนเดือน */}
      <div className="flex items-center justify-between w-full mb-5 bg-gray-50 p-2 md:p-3 rounded-2xl border border-gray-100">
        <button onClick={prevMonth} className="p-2 md:p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm cursor-pointer">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-base md:text-xl font-black text-blue-700">
          {monthNames[month]} {year + 543}
        </h2>
        <button onClick={nextMonth} className="p-2 md:p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm cursor-pointer">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 w-full">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 font-medium">กำลังโหลดปฏิทิน...</p>
        </div>
      ) : (
        <div className="w-full">
          {/* หัวตาราง วัน จ-อา */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs md:text-sm font-bold text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>
          {/* ตารางวันที่ */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {days}
          </div>
        </div>
      )}
    </div>
  );
}