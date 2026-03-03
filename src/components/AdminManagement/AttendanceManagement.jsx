import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../API/axios";
import { FiWifi, FiClock, FiCalendar, FiDownload, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import * as XLSX from 'xlsx';

export default function AttendanceManager() {
  const [wifiIp, setWifiIp] = useState("Đang tải...");
  const [loadingWifi, setLoadingWifi] = useState(false);
  
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  // --- STATE CHO POPUP CHI TIẾT NHÂN VIÊN ---
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    employee: null,
    data: [],
    loading: false
  });

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: "info", 
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    fetchWifiIp();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const fetchWifiIp = async () => {
    try {
      const res = await api.get("/wifisettings/current-ip");
      setWifiIp(res.data.ip);
    } catch (err) {
      setWifiIp("Lỗi kết nối");
    }
  };

  const fetchReport = async () => {
    setLoadingReport(true); 
    try {
      const res = await api.get(`/attendance/report?month=${selectedMonth}&year=${selectedYear}`);
      setReportData(res.data);
    } catch (err) {
      console.error("Lỗi lấy báo cáo", err);
    } finally {
      setLoadingReport(false);
    }
  };

  // --- HÀM MỞ CHI TIẾT 1 NHÂN VIÊN KHI CLICK VÀO DÒNG ---
  const handleRowClick = async (employee) => {
    // setDetailModal({ isOpen: true, employee, data: [], loading: true });
    // try {
    //   // Gọi API C# vừa viết ở Bước 1
    //   const res = await api.get(`/attendance/details?userId=${employee.id}&month=${selectedMonth}&year=${selectedYear}`);
    //   setDetailModal({ isOpen: true, employee, data: res.data, loading: false });
    // } catch (err) {
    //   console.error("Lỗi tải chi tiết", err);
    //   setDetailModal(prev => ({ ...prev, loading: false }));
    //   openDialog("error", "Lỗi", "Không thể tải chi tiết chấm công của nhân viên này.");
    // }
    navigate(`/attendance/${employee.id}?month=${selectedMonth}&year=${selectedYear}`);
  };

  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, employee: null, data: [], loading: false });
  };

  const openDialog = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  const handleUpdateWifiClick = () => {
    openDialog("confirm", "Xác nhận mạng WiFi", "Bạn có chắc chắn muốn dùng mạng WiFi hiện tại làm mạng chấm công không?", executeWifiUpdate);
  };

  const executeWifiUpdate = async () => {
    closeDialog(); 
    setLoadingWifi(true);
    try {
      const res = await api.post("/wifisettings/update-ip");
      setWifiIp(res.data.ip);
      openDialog("success", "Thành công!", `Mạng chấm công mới đã được thiết lập. (IP: ${res.data.ip})`);
    } catch (err) {
      openDialog("error", "Cập nhật thất bại", "Có lỗi xảy ra trong quá trình cấu hình. Vui lòng thử lại!");
    } finally {
      setLoadingWifi(false);
    }
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) {
      openDialog("error", "Không có dữ liệu", `Tháng ${selectedMonth}/${selectedYear} chưa có dữ liệu chấm công để xuất file.`);
      return;
    }

    const excelData = reportData.map((row, index) => ({
      "STT": index + 1,
      "Mã Nhân Viên": row.username,
      "Tên Nhân Viên": row.fullName,
      "Tổng Số Giờ (h)": Number(row.totalHours).toFixed(2)
    }));

    const totalHours = excelData.reduce((sum, row) => sum + Number(row["Tổng Số Giờ (h)"]), 0);
    excelData.push({
      "STT": "",
      "Mã Nhân Viên": "",
      "Tên Nhân Viên": "TỔNG CỘNG CẢ QUÁN:",
      "Tổng Số Giờ (h)": totalHours.toFixed(2)
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 15 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Bảng Công T${selectedMonth}`);
    XLSX.writeFile(workbook, `Bang_Cham_Cong_Thang_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const totalRestaurantHours = reportData.reduce((sum, item) => sum + (Number(item.totalHours) || 0), 0);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Hàm hỗ trợ format ngày giờ
  const formatDateTime = (dateString) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 uppercase">Quản lý Chấm Công</h1>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
          <FiCalendar className="text-teal-600 text-lg" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Tháng:</span>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg outline-none cursor-pointer p-1.5">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>Tháng {month}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-6 bg-gray-300 mx-1"></div> 
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Năm:</span>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg outline-none cursor-pointer p-1.5">
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full"><FiWifi className="text-2xl" /></div>
            <div>
              <h3 className="font-bold text-gray-800">Mạng WiFi Chấm Công</h3>
              <p className="text-sm text-gray-500">IP: <span className="font-mono text-blue-600 font-bold">{wifiIp}</span></p>
            </div>
          </div>
          <button onClick={handleUpdateWifiClick} disabled={loadingWifi} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400">
            {loadingWifi ? "Đang xử lý..." : "Lấy WiFi hiện tại làm mặc định"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 flex items-center justify-center rounded-full"><FiClock className="text-2xl" /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng giờ làm cả quán (Tháng {selectedMonth})</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1">{totalRestaurantHours.toFixed(2)} <span className="text-base font-normal text-gray-500">giờ</span></h3>
            </div>
        </div>
      </div>

      {/* BẢNG TỔNG KẾT GIỜ LÀM NHÂN VIÊN */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b bg-white flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FiCalendar className="text-teal-600" /> Bảng tính công Tháng {selectedMonth}/{selectedYear}
          </h3>
          <button onClick={handleExportExcel} className="text-sm bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100 flex items-center gap-2 font-medium transition-colors">
            <FiDownload /> Xuất Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b">
              <tr>
                <th className="p-4 font-bold">Mã NV</th>
                <th className="p-4 font-bold">Tên Nhân viên</th>
                <th className="p-4 font-bold text-right">Tổng giờ làm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingReport ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Không có dữ liệu.</td></tr>
              ) : (
                reportData.map(row => (
                  <tr 
                    key={row.id} 
                    onClick={() => handleRowClick(row)} // Gọi hàm khi click
                    className="hover:bg-teal-50 transition-colors cursor-pointer group" // Đổi màu nền khi hover báo hiệu có thể click
                    title="Click để xem chi tiết"
                  >
                    <td className="p-4 font-mono text-sm text-gray-500 group-hover:text-teal-600">{row.username}</td>
                    <td className="p-4 font-medium text-gray-800 group-hover:text-teal-600">{row.fullName}</td>
                    <td className="p-4 text-right">
                      <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-bold border border-teal-100">
                        {Number(row.totalHours).toFixed(2)} h
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* POPUP CHI TIẾT CHẤM CÔNG CỦA 1 NHÂN VIÊN                 */}
      {/* ======================================================== */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 transition-opacity backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-w-[95%] max-h-[90vh] flex flex-col transform transition-transform scale-100 animate-fade-in-up">
            
            {/* Header của Popup */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Chi tiết chấm công</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Nhân viên: <span className="font-bold text-teal-600">{detailModal.employee?.fullName}</span> 
                  <span className="mx-2">|</span> Tháng {selectedMonth}/{selectedYear}
                </p>
              </div>
              <button onClick={closeDetailModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Nội dung bảng chi tiết */}
            <div className="p-5 overflow-y-auto flex-1">
              {detailModal.loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 text-sm">Đang tải chi tiết ca làm...</p>
                </div>
              ) : detailModal.data.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  Nhân viên này chưa có lịch sử check-in trong tháng này.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-600 sticky top-0">
                    <tr>
                      <th className="p-3 font-semibold rounded-tl-lg">Giờ vào (Check-in)</th>
                      <th className="p-3 font-semibold">Giờ ra (Check-out)</th>
                      <th className="p-3 font-semibold text-right rounded-tr-lg">Số giờ làm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detailModal.data.map(session => (
                      <tr key={session.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">
                          {formatDateTime(session.checkInTime)}
                        </td>
                        <td className="p-3 text-gray-600">
                          {session.checkOutTime ? (
                            formatDateTime(session.checkOutTime)
                          ) : (
                            <span className="text-orange-500 font-medium italic text-xs px-2 py-1 bg-orange-50 rounded">Chưa Check-out</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-bold text-teal-600">
                            {session.totalHours ? Number(session.totalHours).toFixed(2) + " h" : "---"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer của Popup */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-2xl">
              <button onClick={closeDetailModal} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors">
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENT DIALOG TÙY CHỈNH */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[6060] flex items-center justify-center bg-black/50 transition-opacity">
          {/* ... Giữ nguyên như cũ ... */}
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] max-w-[90%] transform transition-transform scale-100 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              {dialog.type === 'success' && <FiCheckCircle className="text-2xl text-teal-500" />}
              {dialog.type === 'error' && <FiAlertTriangle className="text-2xl text-red-500" />}
              {dialog.type === 'confirm' && <FiInfo className="text-2xl text-blue-500" />}
              <h3 className={`text-lg font-bold ${dialog.type === 'error' ? 'text-red-600' : dialog.type === 'success' ? 'text-teal-600' : 'text-gray-800'}`}>{dialog.title}</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">{dialog.message}</p>
            <div className="flex justify-end gap-3 mt-4">
              {dialog.type === 'confirm' && (
                <button onClick={closeDialog} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors text-sm">Hủy bỏ</button>
              )}
              <button onClick={() => { if (dialog.onConfirm) { dialog.onConfirm(); } else { closeDialog(); } }} className={`px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm ${dialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200'}`}>
                {dialog.type === 'confirm' ? 'Xác nhận' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}