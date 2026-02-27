import { FiUser, FiLock } from "react-icons/fi";
import { useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { login } from "../../API/Service/authServices";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Có thể dùng để quay lại trang trước đó nếu bị văng ra lúc đang làm dở
  const from = location.state?.from || null; 

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt load lại trang khi bấm Enter
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const data = await login(username, password);

      // 1. LƯU TOÀN BỘ DỮ LIỆU BACKEND TRẢ VỀ
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("fullName", data.fullName);
      localStorage.setItem("username", data.username);

      alert("Đăng nhập thành công!");

      // 2. ĐIỀU HƯỚNG DỰA THEO QUYỀN (ROLE)
      if (from) {
        navigate(from, { replace: true });
      } else if (data.role === "Admin") {
        navigate("/pos", { replace: true }); // Đổi URL này theo trang admin của bạn
      } else {
        navigate("/pos", { replace: true }); // Mặc định Employee vào POS
      }

    } catch (err) {
      // Bắt lỗi chính xác từ C# ném về (Ví dụ: "Account disabled" hoặc "Invalid account")
      setError(err.response?.data || "Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="w-[80%]">
      <h2 className="text-center text-[#ff7b00] mb-5 font-bold">LOGIN</h2>

      {/* Dùng thẻ form để hỗ trợ bấm phím Enter */}
      <form onSubmit={handleLogin}>
        <div className="relative w-full mb-4">
          <FiUser className="absolute left-2 top-[50%] -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
          <Input 
            placeholder="User Name"
            className="pl-8" 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        <div className="relative w-full mb-4">
          <FiLock className="absolute left-2 top-[50%] -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
          <Input 
            placeholder="Password" 
            type="password" 
            className="pl-8"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-2 text-center font-medium">{error}</p>}

        <div className="text-right mb-2">
          <a href="#" className="text-[#ff7b00] text-[15px] hover:underline">Forgot password?</a>
        </div>
        
        {/* Phần Register đã được ẩn/xóa đi hoặc chỉ hiện thông báo, vì Admin mới được tạo tài khoản */}
        <div className="text-left mb-4">
          <p className="text-sm text-gray-600">
             Vui lòng liên hệ Admin nếu chưa có tài khoản.
          </p>
        </div>

        {/* Nút bấm tự trigger onSubmit của form */}
        <Button type="submit">
          LOGIN
        </Button>
      </form>

      <div className="mt-4 text-center">
        <span className="block mb-2 text-gray-500">Or</span>
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
      </div>
    </div>
  );
}