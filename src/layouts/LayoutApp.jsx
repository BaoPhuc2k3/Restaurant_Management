import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/POS/Sidebar"; // Đường dẫn tới file Sidebar của bạn

export default function LayoutApp() {
  return (
    // Cái khung to nhất bao trọn màn hình
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      
      {/* 1. CỘT SIDEBAR (Cố định bên trái) */}
      <div className="w-20 shrink-0 bg-gray-800 text-white h-full z-20 shadow-lg">
        <Sidebar />
      </div>

      {/* 2. KHU VỰC NỘI DUNG (Thay đổi tùy theo link URL) */}
      <div className="flex-1 h-full overflow-hidden flex flex-col bg-gray-100">
        <Outlet /> {/* <-- Đây chính là nơi POSPage hoặc CategoryManagement sẽ hiển thị */}
      </div>

    </div>
  );
}