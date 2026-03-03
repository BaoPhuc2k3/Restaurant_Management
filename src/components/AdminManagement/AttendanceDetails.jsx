import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../API/axios";
import { FiArrowLeft, FiClock, FiCalendar, FiUser, FiInfo, FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx'; // Import thư viện Excel

export default function AttendanceDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const month = searchParams.get("month") || new Date().getMonth() + 1;
  const year = searchParams.get("year") || new Date().getFullYear();

  const [data, setData] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [userId, month, year]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/details?userId=${userId}&month=${month}&year=${year}`);
      setData(res.data.sessions || []);
      setEmployeeInfo(res.data.fullName);
      if (res.data.length > 0) setEmployeeInfo(res.data[0].fullName);
    } catch (err) {
      console.error("Lỗi tải chi tiết", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 HÀM XUẤT EXCEL CHI TIẾT
  const handleExportExcel = () => {
    if (data.length === 0) return;

    // Chuẩn bị dữ liệu để đưa vào Excel
    const excelData = data.map((session, index) => ({
      "STT": index + 1,
      "Ngày làm": new Date(session.checkInTime).toLocaleDateString('vi-VN'),
      "Giờ vào": formatDateTime(session.checkInTime),
      "Giờ ra": session.checkOutTime ? formatDateTime(session.checkOutTime) : "Chưa Check-out",
      "Số giờ làm (h)": session.totalHours ? Number(session.totalHours).toFixed(2) : "0.00"
    }));

    // Tính tổng giờ ở cuối file
    const totalHours = data.reduce((sum, s) => sum + (Number(s.totalHours) || 0), 0);
    excelData.push({
      "STT": "",
      "Ngày làm": "",
      "Giờ vào": "",
      "Giờ ra": "TỔNG CỘNG:",
      "Số giờ làm (h)": totalHours.toFixed(2)
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    worksheet['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    const sheetName = `Chi tiet T${month}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    const fileName = `Bang_Cong_Chi_Tiet_${employeeInfo?.replace(/\s/g, '_') || userId}_T${month}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-[#ff7b00] transition-colors font-medium"
        >
          <FiArrowLeft /> Quay lại danh sách
        </button>

        {/* NÚT XUẤT EXCEL CHI TIẾT */}
        <button 
          onClick={handleExportExcel}
          disabled={data.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FiDownload /> Xuất báo cáo cá nhân
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#fff5e6] text-[#ff7b00] rounded-full flex items-center justify-center text-3xl shadow-inner">
            <FiUser />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
                {employeeInfo ? `Nhân viên: ${employeeInfo}` : "Đang tải tên..."}
            </h1>
            <p className="text-gray-500">
               Mã NV: <span className="font-bold text-gray-700">{userId}</span> | Tháng {month}/{year}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 font-medium">Tổng số ca làm</p>
          <p className="text-3xl font-black text-[#ff7b00]">{data.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
          <FiInfo className="text-blue-500" /> Chi tiết các phiên làm việc
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
              <tr>
                <th className="p-4 font-semibold">Ngày làm việc</th>
                <th className="p-4 font-semibold">Giờ vào (Check-in)</th>
                <th className="p-4 font-semibold">Giờ ra (Check-out)</th>
                <th className="p-4 font-semibold text-right">Số giờ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 animate-pulse">Đang tải dữ liệu...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">Không có dữ liệu trong tháng này.</td></tr>
              ) : (
                data.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-700">
                      {new Date(session.checkInTime).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-gray-600 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {formatDateTime(session.checkInTime)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {session.checkOutTime ? (
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-red-500"></div>
                           {formatDateTime(session.checkOutTime)}
                        </div>
                      ) : (
                        <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded text-xs font-bold animate-pulse">Đang làm việc...</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-gray-800">
                        {session.totalHours ? Number(session.totalHours).toFixed(2) + " h" : "---"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}