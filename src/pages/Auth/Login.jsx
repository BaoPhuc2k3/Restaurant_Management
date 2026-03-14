import AuthLayout from "../../layouts/AuthLayout";
import LoginForm from "../../components/Auth/LoginForm";
import bgImage from "../../assets/images/photo-background.jpg";
// import loginBg from "../../assets/images/login-bg.png";

export default function Login() {
  return (
    <AuthLayout image={bgImage}>
      <LoginForm />
    </AuthLayout>
  );
}
