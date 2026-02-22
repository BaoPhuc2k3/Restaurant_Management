import { FiUser, FiLock } from "react-icons/fi";
import { useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { login } from "../../API/Service/authServices";
import { useNavigate , useLocation} from "react-router-dom";
export default function LoginForm() {
   const navigate = useNavigate();
   const location = useLocation();

   const from = location.state?.from || "/home";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
    setError("Vui lòng nhập đầy đủ thông tin");
    return;
    }

    try {
      const data = await login(username, password);

      localStorage.setItem("token", data.token);
      // localStorage.setItem("user", JSON.stringify(data.user));
      alert("Đăng nhập thành công");

      navigate(from, { replace: true });
    } catch (err) {
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };
  return (
    <div className="w-[80%]">
      <h2 className="text-center text-[#ff7b00] mb-5 font-bold">LOGIN</h2>

        <div className="relative w-full">
          <FiUser className="absolute left-2 top-[35%] -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
          <Input placeholder="User Name"
                 className="pl-7.5" 
                 value={username}
                 onChange={e => setUsername(e.target.value)}
                 />
        </div>
        <div className="relative w-full">
          <FiLock className="absolute left-2 top-[35%] -translate-y-1/2 text-[18px] text-[#666] pointer-events-none" />
          <Input placeholder="Password" type="password" className="pl-7.5"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 />
        </div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="text-right mb-2">
        <a href="#" className="text-[#ff7b00] text-[17px] hover:underline">Forgot password?</a>
      </div>
      <div className="text-left">
        <p>Don't have an account? <a href="#" className="text-[#ff7b00] text-[17px] hover:underline">Register</a></p>
      </div>

      <Button onClick={handleLogin}>
        LOGIN
      </Button>
      <div className="mt-2 text-center">
        <span  className="block mb-2 text-gray-500">Or</span>
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
