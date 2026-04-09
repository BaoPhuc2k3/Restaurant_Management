import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/POS/Sidebar";

export default function LayoutApp() {
  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      <div className="w-20 shrink-0 bg-gray-800 text-white h-full z-20 shadow-lg print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 h-full overflow-hidden flex flex-col bg-gray-100">
        <Outlet />
      </div>

    </div>
  );
}