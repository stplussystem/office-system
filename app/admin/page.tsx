"use client";

import React from "react";
import { 
  Users, 
  UserCheck, 
  Clock, 
  Building2, 
  TrendingUp, 
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function AdminDashboard() {
  // ข้อมูลจำลอง (Mock Data) สำหรับโชว์หน้าตา UI
  const stats = [
    { title: "พนักงานทั้งหมด", value: "124", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "ลางานวันนี้", value: "8", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "รออนุมัติลา", value: "15", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "แผนกทั้งหมด", value: "12", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const recentLeaves = [
    { id: 1, name: "สมชาย ใจดี", dept: "IT Support", type: "พักร้อน", date: "29 ก.ค. 26", status: "pending" },
    { id: 2, name: "สมหญิง รักงาน", dept: "HR", type: "ลาป่วย", date: "28 ก.ค. 26", status: "approved" },
    { id: 3, name: "วิชัย มาสาย", dept: "Marketing", type: "ลากิจ", date: "28 ก.ค. 26", status: "rejected" },
    { id: 4, name: "มาลี ดีเลิศ", dept: "Accounting", type: "พักร้อน", date: "27 ก.ค. 26", status: "approved" },
  ];

  const getStatusUI = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 size={12}/> อนุมัติ</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100"><XCircle size={12}/> ปฏิเสธ</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100"><AlertCircle size={12}/> รอตรวจสอบ</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🌟 Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ (Overview)</h1>
          <p className="text-sm text-gray-500 mt-1">ข้อมูลสถิติและการทำรายการล่าสุดของวันนี้</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 w-fit">
          <TrendingUp size={16} />
          ออกรายงาน
        </button>
      </div>

      {/* 🌟 Stat Cards (สถิติ 4 กล่องบน) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 Content Section (แบ่ง 2 ฝั่งในจอใหญ่) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* กราฟ/พื้นที่ว่างฝั่งซ้าย (กินพื้นที่ 2 ส่วน) */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">สถิติการลางานย้อนหลัง 7 วัน</h2>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 font-medium">
              <option>สัปดาห์นี้</option>
              <option>เดือนนี้</option>
              <option>ปีนี้</option>
            </select>
          </div>
          {/* พื้นที่ใส่กราฟ (ApexCharts) ในอนาคต */}
          <div className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-3">
            <TrendingUp size={48} className="opacity-20" />
            <p className="text-sm font-medium">พื้นที่สำหรับแสดงกราฟ (ApexCharts)</p>
          </div>
        </div>

        {/* รายการคำขอล่าสุดฝั่งขวา (กินพื้นที่ 1 ส่วน) */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">คำขอล่าสุด</h2>
            <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">ดูทั้งหมด</a>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {recentLeaves.map((leave) => (
              <div key={leave.id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0 border border-gray-200">
                    {leave.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{leave.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{leave.type} • {leave.date}</p>
                  </div>
                </div>
                <div className="shrink-0 mt-1">
                  {getStatusUI(leave.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}