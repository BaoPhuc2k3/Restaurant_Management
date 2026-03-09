import api from "../axios";

/* =========================================================
   A. NHÓM DÀNH CHO NHÂN VIÊN (CHECK-IN / CHECK-OUT)
========================================================= */

/**
 * Kiểm tra trạng thái chấm công hiện tại của nhân viên đang đăng nhập
 * Trả về: Đã check-in chưa, thời gian check-in gần nhất...
 */
export const getAttendanceStatus = async () => {
    const res = await api.get('/attendance/status');
    return res.data;
};

/**
 * Thực hiện chấm công vào làm
 */
export const doCheckIn = async () => {
    const res = await api.post('/attendance/check-in');
    return res.data;
};

/**
 * Thực hiện chấm công ra về
 */
export const doCheckOut = async () => {
    const res = await api.post('/attendance/check-out');
    return res.data;
};


/* =========================================================
   B. NHÓM DÀNH CHO QUẢN LÝ (ADMIN / MANAGER)
========================================================= */

/**
 * Lấy báo cáo tổng hợp giờ làm của toàn bộ nhân viên theo tháng/năm
 * Thường dùng cho trang danh sách chính của Quản lý chấm công
 */
export const getAttendanceReport = async (month, year) => {
    const res = await api.get(`/attendance/report?month=${month}&year=${year}`);
    return res.data;
};

/**
 * Lấy chi tiết lịch sử chấm công của một nhân viên cụ thể
 * Thường dùng khi click vào một dòng nhân viên trong bảng tổng hợp
 */
export const getEmployeeAttendanceDetail = async (userId, month, year) => {
    const res = await api.get(`/attendance/details?userId=${userId}&month=${month}&year=${year}`);
    return res.data;
};


/* =========================================================
   C. CẤU HÌNH HỆ THỐNG (WIFI CHẤM CÔNG)
========================================================= */

/**
 * Lấy địa chỉ IP của mạng WiFi đang được cấu hình làm mạng chấm công
 */
export const getCurrentWifiIp = async () => {
    const res = await api.get("/wifisettings/current-ip");
    return res.data;
};

/**
 * Cập nhật WiFi hiện tại làm mạng chấm công (Lấy IP Public của mạng đang kết nối)
 */
export const updateWifiIp = async () => {
    const res = await api.post("/wifisettings/update-ip");
    return res.data;
};