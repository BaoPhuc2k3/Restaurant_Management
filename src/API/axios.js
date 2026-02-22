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

export default api;
