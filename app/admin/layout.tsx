"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  CalendarRange,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "แดชบอร์ด", icon: LayoutDashboard, path: "/admin" },
    { name: "จัดการพนักงาน", icon: Users, path: "/admin/users" },
    { name: "คำขอลางาน", icon: CalendarRange, path: "/admin/leaves" },
    { name: "ตั้งค่าระบบ", icon: Settings, path: "/admin/settings" },
  ];

  return (
    // 🌟 1. จุดที่แก้ไข: ใส่ fixed inset-0 w-full h-full z-50 เพื่อหลุดจากกรอบมือถือของระบบหลัก
    <div className="fixed inset-0 w-full h-full bg-[#F3F4F7] flex font-sans z-50 overflow-hidden">
      
      {/* 🌟 Sidebar */}
      <aside 
        className={`absolute lg:fixed inset-y-0 left-0 z-[60] w-64 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* โลโก้ */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 shrink-0">
          <span className="text-xl font-black text-blue-600 tracking-tight">ST PLUS<span className="text-gray-800"> ADMIN</span></span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* เมนู */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">เมนูหลัก</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* ปุ่มออกจากระบบ */}
        <div className="p-4 border-t border-gray-50 shrink-0">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
            <LogOut size={18} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* 🌟 Overlay สำหรับมือถือเวลาเปิด Sidebar */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-[55] lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🌟 2. พื้นที่ Content หลัก (แก้ไขให้ Scroll ได้เฉพาะส่วนนี้) */}
      <div className="flex-1 flex flex-col h-full min-w-0 lg:ml-64 transition-all duration-300 overflow-y-auto custom-scrollbar">
        
        {/* Header (Topbar) */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
            
            {/* ช่องค้นหา */}
            <div className="hidden md:flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* เมนูขวาบน */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer ring-2 ring-white">
              A
            </div>
          </div>
        </header>

        {/* พื้นที่แสดงเนื้อหา */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}