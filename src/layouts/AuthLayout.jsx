import "../styles/auth.css";

export default function AuthLayout({ children, image }) {
  return (
    // Container chính: Tràn màn hình, dùng Flexbox để đẩy form sang phải (justify-end)
    <div className="relative w-full h-screen flex items-center justify-end md:pr-16 lg:pr-32">
      
      {/* 🟢 ẢNH NỀN TOÀN MÀN HÌNH */}
      {/* absolute inset-0: Kéo căng ảnh ra 4 góc, -z-10: Đẩy ảnh chìm xuống lớp dưới cùng */}
      <img 
        src={image} 
        className="absolute inset-0 w-full h-full object-cover -z-10" 
        alt="Restaurant Background" 
      />

      {/* 🟢 LỚP PHỦ MỜ (OVERLAY) - Tùy chọn */}
      {/* Giúp làm dịu bức ảnh nền, làm cho cái form màu trắng nổi bật và dễ đọc hơn */}
      <div className="absolute inset-0 bg-black/30 -z-10"></div>

      {/* 🟢 KHUNG CHỨA FORM (NỔI LÊN TRÊN) */}
      <div className="relative z-10 flex justify-center items-center
                      w-[90%] md:w-100 lg:w-100 h-auto min-h-[400px] py-10 px-6
                      bg-white/10 backdrop-blur-md rounded-[10px] 
                      shadow-[0_10px_40px_rgba(0,0,0,0.7)]
                      mx-auto md:mx-0">
        {children}
      </div>
    </div>
  );
}