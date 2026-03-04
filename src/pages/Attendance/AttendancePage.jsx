import React, { useState, useEffect } from "react";
import { FiClock, FiLogIn, FiLogOut, FiUser, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { getAttendanceStatus, doCheckIn, doCheckOut } from "../../API/Service/attendanceServices"; 

export default function AttendancePage() {
  const [isWorking, setIsWorking] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const staffName = localStorage.getItem("fullName") || "Nhân viên";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getAttendanceStatus();
      setIsWorking(data.isWorking);
      setCheckInTime(data.checkInTime);
    } catch (err) {
      showToast("Lỗi tải trạng thái", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendance = async (action) => {
    try {
      if (action === "IN") {
        const res = await doCheckIn();
        setIsWorking(true);
        setCheckInTime(res.time);
        showToast("Check-in thành công!", "success");
      } else {
        await doCheckOut();
        setIsWorking(false);
        setCheckInTime(null);
        showToast("Check-out thành công!", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Thao tác thất bại", "error");
    }
  };

  if (isLoading) return <div className="p-10 text-center">Đang kết nối hệ thống...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-linear-to-br from-teal-600 to-teal-800 p-8 text-white text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
            <FiUser className="text-5xl" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{staffName}</h2>
          <p className="opacity-80 text-sm font-medium mt-1">ID: {localStorage.getItem("username")}</p>
        </div>

        {/* STATUS SECTION */}
        <div className="p-8 text-center">
          <div className="mb-8">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Trạng thái hiện tại</p>
            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-black shadow-sm ${
              isWorking ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              <span className={`w-3 h-3 rounded-full ${isWorking ? "bg-green-600 animate-ping" : "bg-red-600"}`}></span>
              {isWorking ? "ĐANG LÀM VIỆC" : "ĐANG NGHỈ CA"}
            </div>
            
            {isWorking && checkInTime && (
              <p className="mt-3 text-gray-500 text-xs font-medium">
                Vào ca lúc: {new Date(checkInTime).toLocaleTimeString("vi-VN")}
              </p>
            )}
          </div>

          {/* BUTTONS SECTION */}
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleAttendance("IN")}
              disabled={isWorking}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all active:scale-95 ${
                !isWorking 
                ? "border-teal-600 text-teal-700 hover:bg-teal-50 shadow-lg shadow-teal-100" 
                : "border-gray-100 text-gray-300 opacity-50 cursor-not-allowed"
              }`}
            >
              <FiLogIn className="text-4xl" />
              <span className="font-black text-xs uppercase">Check In</span>
            </button>

            <button
              onClick={() => handleAttendance("OUT")}
              disabled={!isWorking}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all active:scale-95 ${
                isWorking 
                ? "border-red-600 text-red-700 hover:bg-red-50 shadow-lg shadow-red-100" 
                : "border-gray-100 text-gray-300 opacity-50 cursor-not-allowed"
              }`}
            >
              <FiLogOut className="text-4xl" />
              <span className="font-black text-xs uppercase">Check Out</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 py-4 border-t flex items-center justify-center gap-2 text-gray-400">
          <FiClock className="text-sm" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Hệ thống chấm công PL RES v2.0</span>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white ${
            toast.type === 'success' ? 'bg-teal-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-xl" /> : <FiAlertCircle className="text-xl" />}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}