"use client";

import React from "react";
import { 
  Building2, 
  Link as LinkIcon, 
  BellRing, 
  Save,
  ShieldAlert,
  Send
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      
      {/* 🌟 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลบริษัท การเชื่อมต่อ และการแจ้งเตือนต่างๆ</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-blue-200 transition-all active:scale-95 flex items-center gap-2 w-fit">
          <Save size={18} />
          บันทึกการตั้งค่า
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* เมนูนำทางด้านซ้าย (สำหรับจอใหญ่) */}
        <div className="hidden md:flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-white text-blue-600 rounded-xl shadow-sm border border-gray-100 font-bold text-sm transition-all">
            <Building2 size={18} /> ข้อมูลองค์กร
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-gray-900 rounded-xl hover:shadow-sm border border-transparent hover:border-gray-100 font-medium text-sm transition-all">
            <LinkIcon size={18} /> การเชื่อมต่อระบบ (LIFF)
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-white hover:text-gray-900 rounded-xl hover:shadow-sm border border-transparent hover:border-gray-100 font-medium text-sm transition-all">
            <Send size={18} /> การแจ้งเตือน (Telegram)
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-white hover:text-red-600 rounded-xl hover:shadow-sm border border-transparent hover:border-gray-100 font-medium text-sm transition-all mt-4">
            <ShieldAlert size={18} /> โซนอันตราย
          </button>
        </div>

        {/* 🌟 พื้นที่ฟอร์มตั้งค่าฝั่งขวา */}
        <div className="md:col-span-2 space-y-6 pb-10">
          
          {/* Card: ข้อมูลบริษัท */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">ข้อมูลองค์กร</h2>
                <p className="text-xs text-gray-500">ข้อมูลพื้นฐานสำหรับแสดงในระบบ</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">ชื่อบริษัท / องค์กร</label>
                <input type="text" defaultValue="ST PLUS SYSTEM" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">ลิงก์เอกสารประกาศวันหยุดประจำปี (PDF/Image URL)</label>
                <input type="text" defaultValue="https://www.example.com/holiday-announcement.pdf" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-blue-600" />
                <p className="text-[10px] text-gray-400 mt-1.5">* ลิงก์นี้จะไปแสดงผลในหน้า "วันหยุดบริษัท" ของพนักงานโดยอัตโนมัติ</p>
              </div>
            </div>
          </div>

          {/* Card: การเชื่อมต่อระบบ LINE LIFF */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <LinkIcon size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">การเชื่อมต่อระบบ LINE</h2>
                <p className="text-xs text-gray-500">ตั้งค่ารหัส LIFF ID สำหรับให้พนักงานล็อกอิน</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">LINE LIFF ID</label>
                <input type="text" defaultValue="2010143328-wyg8T4P5" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono text-gray-600" />
              </div>
            </div>
          </div>

          {/* Card: แจ้งเตือน Telegram */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 border-l-4 border-l-sky-500">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                  <Send size={20} className="ml-1" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">การแจ้งเตือนผ่าน Telegram</h2>
                  <p className="text-xs text-gray-500">ส่งแจ้งเตือนเข้ากลุ่ม Admin ฟรี ไม่มีค่าใช้จ่าย</p>
                </div>
              </div>
              <label className="relative cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Bot Token (รับจาก @BotFather)</span>
                </label>
                <input type="text" placeholder="1234567890:AAH_xxx..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono text-gray-600" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Group Chat ID (ไอดีกลุ่มของ Admin)</label>
                <input type="text" placeholder="-100xxxxxxxxxx" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-mono text-gray-600" />
                <p className="text-[10px] text-gray-400 mt-2 bg-sky-50 p-2 rounded-lg border border-sky-100">
                  💡 <b>วิธีใช้งาน:</b> นำ Bot ที่สร้างจาก @BotFather ดึงเข้ากลุ่มแอดมิน แล้วพิมพ์คำสั่ง <code className="bg-white px-1 rounded text-sky-600">/start</code> ในกลุ่ม จากนั้นนำ Chat ID มาใส่ในช่องนี้
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}