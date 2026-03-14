import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { login } from "../../API/Service/authServices"; 
import bgImage from "../../assets/images/photo-background.jpg"; 

export default function LoginAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/timekeep"; 

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setToast(null);

    if (!username || !password) {
      setToast({ message: "Vui lòng nhập đầy đủ thông tin", type: "error" });
      return;
    }

    try {
      const data = await login(username, password);

      // Lưu thông tin vào LocalStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.id);

      setToast({ message: "Đăng nhập thành công!", type: "success" });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Sai tài khoản hoặc mật khẩu";
      setToast({ message: errorMsg, type: "error" });
    }
  };

  return (
    // 🟢 THAY ĐỔI LỚN Ở ĐÂY: Dùng ảnh làm nền cho toàn bộ trang
    <div 
      className="w-full h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center lg:justify-end lg:pr-32"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Lớp phủ đen mờ để làm nổi bật form */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* FORM ĐĂNG NHẬP (Đặt nổi lên trên lớp nền mờ) */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 mx-4">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
            <FiUser />
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
            Chấm Công
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Đăng nhập để vào ca làm việc của bạn
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative w-full">
            <FiUser className="absolute left-4 top-[50%] -translate-y-1/2 text-xl text-gray-400 pointer-events-none" />
            <Input 
              placeholder="Mã nhân viên / Username"
              className="pl-12 w-full h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:bg-white transition-colors" 
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <FiLock className="absolute left-4 top-[50%] -translate-y-1/2 text-xl text-gray-400 pointer-events-none" />
            <Input 
              placeholder="Mật khẩu" 
              type="password" 
              className="pl-12 w-full h-12 bg-gray-50 border-gray-200 focus:border-orange-500 focus:bg-white transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          

          <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-transform mt-6">
            ĐĂNG NHẬP VÀO CA
          </Button>
        </form>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-medium ${
            toast.type === 'success' ? 'bg-teal-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-2xl" /> : <FiAlertCircle className="text-2xl" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}