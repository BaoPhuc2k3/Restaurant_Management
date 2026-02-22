import "../styles/auth.css";

export default function AuthLayout({ children, image }) {
  return (
    <div className="w-full flex h-screen bg-[#fff5e6]">
      <div className="flex-[1.2] flex items-center justify-center">
        <img src={image} className="w-[85%] object-contain" />
      </div>

      <div className="flex-1 flex justify-center items-center bg-[#f7f4f4]">
        <div className="  flex justify-center items-center
                          w-[60%] h-[80%]
                          bg-white
                          rounded-[10px]
                          shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                            {children}
                          </div>
      </div>
    </div>
  );
}
