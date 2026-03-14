import { FiUser, FiMail, FiPhone, FiLock, FiShield } from "react-icons/fi"; // 🔥 Bổ sung FiShield
import Input from "../UI/Input";
import Button from "../UI/Button";
import InputWithIcon from "../UI/InputWithIcon";
import { useState } from "react";
import { register } from "../../API/Service/authServices";
import { useNavigate } from "react-router-dom"; // 🔥 Dùng để chuyển trang sau khi thành công


export default function RegisterForm() {
  const navigate = useNavigate();

  // 🔥 1. Bổ sung thêm roleId vào State (Mặc định là 4 - Phục vụ)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleId: 4 
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    // Nếu là trường roleId thì ép kiểu về số nguyên, ngược lại giữ nguyên chuỗi
    const value = e.target.name === "roleId" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleRegister = async () => {
    // Validate cơ bản
    if (!form.username || !form.fullName || !form.password) {
      setError("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    try {
      // 🔥 2. Gửi thêm roleId xuống API
      await register({
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        phone: form.phone,
        password: form.password,
        roleId: form.roleId 
      });

      alert("Thêm tài khoản thành công!");
      
      // 🔥 3. Điều hướng người dùng về lại trang Quản lý nhân viên
      navigate("/users"); 

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Đăng ký thất bại");
    }
  };

  return (
    <div className="w-[90%] mx-auto">
      <h2 className="text-center text-[#ff7b00] mb-6 font-bold text-[22px] uppercase">
        Tạo Tài Khoản Nhân Viên
      </h2>
      
      <InputWithIcon icon={<FiUser />} name="fullName" placeholder="Họ và tên *" onChange={handleChange} />
      <InputWithIcon icon={<FiMail />} name="email" placeholder="Email (Không bắt buộc)" onChange={handleChange} />
      <InputWithIcon icon={<FiUser />} name="username" placeholder="Tên đăng nhập *" onChange={handleChange} />
      <InputWithIcon icon={<FiPhone />} name="phone" placeholder="Số điện thoại" onChange={handleChange} />
      
      {/* 🔥 KHỐI DROPDOWN CHỌN VAI TRÒ */}
      <div className="relative mb-4">
        {/* Icon nằm đè lên góc trái của Select */}
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
          <FiShield />
        </span>
        <select
          name="roleId"
          value={form.roleId}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff7b00] focus:border-transparent transition-all"
        >
          <option value={1}>Quản trị viên (Admin)</option>
          <option value={2}>Phục vụ (Staff)</option>
          <option value={3}>Thu ngân (Cashier)</option>
          <option value={4}>Bếp (Kitchen)</option>
        </select>
      </div>

      <InputWithIcon icon={<FiLock />} name="password" placeholder="Mật khẩu *" type="password" onChange={handleChange} />
      <InputWithIcon icon={<FiLock />} name="confirmPassword" placeholder="Xác nhận mật khẩu *" type="password" onChange={handleChange} />

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded border border-red-200">
          {error}
        </p>
      )}

      <div className="mt-2">
        <Button onClick={handleRegister}>Tạo Tài Khoản</Button>
      </div>
      
      {/* Nút Hủy để quay về trang quản lý nếu đổi ý */}
      <div className="mt-4 text-center">
        <button 
          onClick={() => navigate("/users")}
          className="text-gray-500 hover:text-[#ff7b00] text-sm underline transition-colors"
        >
          Hủy và quay lại
        </button>
      </div>
    </div>
  );
}