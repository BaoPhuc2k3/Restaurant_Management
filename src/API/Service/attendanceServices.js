import api from "../axios";


export const getAttendanceStatus = async () => {
    const res = await api.get('/attendance/status');
    return res.data;
};


export const doCheckIn = async () => {
    const res = await api.post('/attendance/check-in');
    return res.data;
};

export const doCheckOut = async () => {
    const res = await api.post('/attendance/check-out');
    return res.data;
};



//  NHÓM DÀNH CHO QUẢN LÝ (ADMIN / MANAGER)



export const getAttendanceReport = async (month, year) => {
    const res = await api.get(`/attendance/report?month=${month}&year=${year}`);
    return res.data;
};


export const getEmployeeAttendanceDetail = async (userId, month, year) => {
    const res = await api.get(`/attendance/details?userId=${userId}&month=${month}&year=${year}`);
    return res.data;
};



//    C. CẤU HÌNH HỆ THỐNG (WIFI CHẤM CÔNG)


//  Lấy địa chỉ IP của mạng WiFi đang được cấu hình làm mạng chấm công

export const getCurrentWifiIp = async () => {
    const res = await api.get("/wifisettings/current-ip");
    return res.data;
};

//   Cập nhật WiFi hiện tại làm mạng chấm công (Lấy IP Public của mạng đang kết nối)

export const updateWifiIp = async () => {
    const res = await api.post("/wifisettings/update-ip");
    return res.data;
};