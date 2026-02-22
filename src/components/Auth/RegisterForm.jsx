import { FiUser, FiMail, FiPhone, FiLock} from "react-icons/fi";
import Input from "../UI/Input";
import Button from "../UI/Button";
import InputWithIcon from "../UI/InputWithIcon";
import { useState } from "react";
import { register } from "../../API/Service/authServices";

export default function RegisterForm() {
  const [form, setForm] = useState({
  fullName: "",
  email: "",
  username: "",
  phone: "",
  password: "",
  confirmPassword: ""
});

const [error, setError] = useState("");
const handleChange = e => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    setError("Mật khẩu không khớp");
    return;
  }

  try {
    await register({
      fullName: form.fullName,
      email: form.email,
      username: form.username,
      phone: form.phone,
      password: form.password
    });

    alert("Đăng ký thành công");
  } catch (err) {
    setError(err.response?.data || "Đăng ký thất bại");
  }
};

  return (
    <div className="w-[80%]">
      <h2 className="text-center text-[#ff7b00] mb-5 font-bold text-[20px]">Create Your Account</h2>
      <InputWithIcon icon={<FiUser />} name="fullName" placeholder="Full Name" onChange={handleChange} />
      <InputWithIcon icon={<FiMail />} name="email" placeholder="Email" onChange={handleChange} />
      <InputWithIcon icon={<FiUser />} name="username" placeholder="Username" onChange={handleChange} />
      <InputWithIcon icon={<FiPhone />} name="phone" placeholder="Phone Number" onChange={handleChange} />
      <InputWithIcon icon={<FiLock />} name="password" placeholder="Password" type="password" onChange={handleChange} />
      <InputWithIcon icon={<FiLock />} name="confirmPassword" placeholder="Confirm Password" type="password" onChange={handleChange} />

{error && <p className="text-red-500 text-sm">{error}</p>}

<Button onClick={handleRegister}>Create Account</Button>
    </div>
  );
}
