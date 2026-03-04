import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { login } from "../../API/Service/authServices"; 


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
    <div className="w-full flex h-screen bg-[#fff5e6] relative">
      <div className="flex-[1.2] flex items-center justify-center">
        <img 
          src="https://cdni.iconscout.com/illustration/premium/thumb/time-management-illustration-download-in-svg-png-gif-file-formats--business-stopwatch-task-pack-illustrations-3317079.png" 
          alt="Attendance Illustration"
          className="w-[85%] object-contain" 
        />
      </div>

      {/* FORM ĐĂNG NHẬP */}
      <div className="flex-1 flex justify-center items-center bg-[#f7f4f4]">
        <div className="flex justify-center items-center w-[60%] h-[80%] bg-white rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
          
          <div className="w-[80%]">
            <h2 className="text-center text-[#ff7b00] mb-5 font-bold uppercase text-xl">
              ĐĂNG NHẬP CHẤM CÔNG
            </h2>

            <form onSubmit={handleLogin}>
              <div className="relative w-full mb-4">
                <FiUser className="absolute left-2 top-[50%] -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
                <Input 
                  placeholder="Mã nhân viên / Username"
                  className="pl-8" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>

              <div className="relative w-full mb-4">
                <FiLock className="absolute left-2 top-[50%] -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
                <Input 
                  placeholder="Mật khẩu" 
                  type="password" 
                  className="pl-8"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div className="text-right mb-2">
                <a href="#" className="text-[#ff7b00] text-[15px] hover:underline">Quên mật khẩu?</a>
              </div>
              
              <div className="text-left mb-4">
                <p className="text-sm text-gray-600">
                  Dùng tài khoản nội bộ để điểm danh ca làm.
                </p>
              </div>

              <Button type="submit">
                VÀO CA
              </Button>
            </form>
          </div>

        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl text-white ${
            toast.type === 'success' ? 'bg-teal-500' : 'bg-red-500'
          }`}>
            {toast.type === 'success' ? <FiCheckCircle className="text-xl" /> : <FiAlertCircle className="text-xl" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}