import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "https://localhost:7291/api",// đổi đúng port API của bạn
  withCredentials: true, // Cho phép gửi cookie nếu cần
  headers: {
    "Content-Type": "application/json"
  } 
});

// Tự động gắn token nếu có
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Nếu API gọi thành công (200 OK) thì cho qua bình thường
    return response; 
  },
  (error) => {
    const isLoginPage = window.location.pathname === "/login";
    // Nếu API bị lỗi 401 (Hết hạn token hoặc Token không hợp lệ)
    if (error.response && error.response.status === 401 && !isLoginPage) {
      
      // 1. Dọn dẹp sạch sẽ LocalStorage (giống như nút Đăng xuất)
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("fullName");
      localStorage.removeItem("username");

      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!", {
        position: "top-right",
        autoClose: 2000, // Đóng sau 2 giây
      });

      setTimeout(() => {
        window.location.href = "/login"; 
      }, 2000); 
    }

    if (error.response && error.response.status === 403) {
      toast.warning("Cảnh báo: Bạn không có quyền thực hiện thao tác này!", {
        position: "top-right",
        autoClose: 2000, // Đóng sau 2 giây
      });
      // Tùy chọn: Có thể đá họ về trang chủ an toàn nếu muốn
      // window.location.href = "/"; 
    }

    return Promise.reject(error);
  }
);

export default api;
