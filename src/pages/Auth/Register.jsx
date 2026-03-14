import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/Auth/RegisterForm";
import bgImage from "../../assets/images/photo-background.jpg";

export default function Register() {
  return (
    <AuthLayout image={bgImage}>
      <RegisterForm />
    </AuthLayout>
  );
}
