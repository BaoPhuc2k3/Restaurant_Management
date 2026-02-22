import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/Auth/RegisterForm";
// import registerBg from "../../assets/images/register-bg.png";

export default function Register() {
  return (
    <AuthLayout >
      <RegisterForm />
    </AuthLayout>
  );
}
