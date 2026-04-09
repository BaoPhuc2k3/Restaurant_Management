import { FiUser, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useState, useEffect } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { login } from "../../API/Service/authServices";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null; 

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

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.id);


      setToast({ message: "Đăng nhập thành công!", type: "success" });

      setTimeout(() => {
        if (from) navigate(from, { replace: true });
        else navigate("/portal", { replace: true });
      }, 1000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "Sai tài khoản hoặc mật khẩu";
      setToast({ message: errorMsg, type: "error" });
    }
  };

  return (
    <div className="w-[90%] mx-auto">
      <h2 className="text-center text-[#ff7b00] mb-5 font-bold uppercase">LOGIN</h2>

      <form onSubmit={handleLogin}>
        <div className="relative w-full mb-4">
          <FiUser className="absolute left-2 top-[37%]  -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
          <Input 
            placeholder="User Name"
            className="pl-9" 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="relative w-full mb-10 ">
          <FiLock className="absolute left-2 top-[37%] -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
          <Input 
            placeholder="Password" 
            type="password" 
            className="pl-9"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* <div className="text-right mb-2">
          <a href="#" className="text-[#ff7b00] text-[15px] hover:underline">Forgot password?</a>
        </div> */}
        
        <div className="text-left mb-4">
          <p className="text-sm text-white/80">
             Vui lòng liên hệ Admin nếu chưa có tài khoản.
          </p>
        </div>

        <Button type="submit">
          LOGIN
        </Button>
      </form>

      {/* <div className="mt-4 text-center">
        <span className="block mb-2 text-white/80">Or</span>
        <Button
          onClick={() => window.location.href = "/auth/google"}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5 block"
            width="24"
            alt="Google"
            style={{ marginRight: "8px" }}
          />
          Login with Google
        </Button>
      </div> */}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in-down">
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