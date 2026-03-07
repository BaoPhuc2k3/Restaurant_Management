import axios from "axios";

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

      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");

      window.location.href = "/login"; 
    }

    return Promise.reject(error);
  }
);

export default api;
