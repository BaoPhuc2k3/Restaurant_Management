import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7291/api",// đổi đúng port API của bạn
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
    // Nếu API bị lỗi 401 (Hết hạn token hoặc Token không hợp lệ)
    if (error.response && error.response.status === 401) {
      
      // 1. Dọn dẹp sạch sẽ LocalStorage (giống như nút Đăng xuất)
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("fullName");
      localStorage.removeItem("username");

      // 2. Hiện thông báo cho nhân viên biết
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");

      // 3. Đá văng về trang Login ngay lập tức
      window.location.href = "/login"; 
    }

    return Promise.reject(error);
  }
);

export default api;
