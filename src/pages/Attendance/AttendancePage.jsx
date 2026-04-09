import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 🟢 Import thêm useNavigate
import { 
  FiClock, FiLogIn, FiLogOut, FiUser, FiCheckCircle, 
  FiAlertCircle, FiCalendar, FiX, FiChevronLeft, FiChevronRight,
  FiPower 
} from "react-icons/fi";
import { 
  getAttendanceStatus, doCheckIn, doCheckOut, getEmployeeAttendanceDetail 
} from "../../API/Service/attendanceServices"; 


export default function AttendancePage() {
  const navigate = useNavigate();
  
  const [isWorking, setIsWorking] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const staffName = localStorage.getItem("fullName") || "Nhân viên";
  const userId = localStorage.getItem("userId"); 

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory, selectedMonth, selectedYear]);

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

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getEmployeeAttendanceDetail(userId, selectedMonth, selectedYear);
      if (Array.isArray(data)) {
        setHistoryData(data);
      } else if (data && data.sessions) {
        setHistoryData(data.sessions);
      } else {
        setHistoryData([]);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
      showToast("Không thể tải lịch sử chấm công", "error");
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };


  const handleLogout = () => {
    

      localStorage.clear(); 

      navigate("/timekeep/login"); 
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Đang kết nối hệ thống...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 relative">
      
      {/* THẺ CHẤM CÔNG CHÍNH */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* HEADER CỦA THẺ */}
        <div className="relative bg-linear-to-br from-teal-600 to-teal-800 p-8 text-white text-center">

          {/* NÚT ĐĂNG XUẤT GÓC TRÁI */}
          <button
            onClick={handleLogout}
            className="absolute top-4 left-4 bg-white/20 hover:bg-red-500 p-2 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm shadow-sm"
            title="Đăng xuất"
          >
            <FiPower className="text-xl" />
          </button>

          {/* NÚT XEM LỊCH SỬ GÓC PHẢI */}
          <button 
            onClick={() => setShowHistory(true)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm shadow-sm"
            title="Xem lịch sử chấm công"
          >
            <FiCalendar className="text-xl" />
          </button>

          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30 mt-2">
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

      {/* MODAL LỊCH SỬ CHẤM CÔNG (Giữ nguyên) */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiCalendar className="text-teal-600" /> Bảng Công Cá Nhân
              </h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-4 flex justify-center items-center gap-6 border-b border-gray-100">
              <button onClick={() => handleMonthChange('prev')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <FiChevronLeft className="text-xl" />
              </button>
              <div className="font-bold text-lg text-gray-700 w-32 text-center">
                Tháng {selectedMonth}/{selectedYear}
              </div>
              <button 
                onClick={() => handleMonthChange('next')} 
                disabled={selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear()}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <FiChevronRight className="text-xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0 bg-white">
              {loadingHistory ? (
                <div className="p-10 text-center text-gray-500 font-medium animate-pulse">Đang tải dữ liệu...</div>
              ) : historyData.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <FiAlertCircle className="text-5xl text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Không có dữ liệu chấm công trong tháng này.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Ngày</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Vào ca</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Ra ca</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Số giờ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyData.map((item, index) => (
                      <tr key={index} className="hover:bg-teal-50/50 transition-colors">
                        <td className="px-6 py-3 font-semibold text-gray-700">
                          {new Date(item.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-3 text-green-600 font-medium">
                          {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                        </td>
                        <td className="px-6 py-3 text-red-600 font-medium">
                          {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                        </td>
                        <td className="px-6 py-3 text-center font-bold text-gray-700">
                          {item.totalHours ? parseFloat(item.totalHours).toFixed(2) + 'h' : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {!loadingHistory && historyData.length > 0 && (
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center px-6">
                <span className="text-sm font-bold text-gray-500">Tổng số ngày đi làm: <span className="text-teal-700 text-lg">{historyData.length}</span></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in-down">
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