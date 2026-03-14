import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { 
  FiShoppingCart, 
  FiUser,
  FiHome,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiCheckSquare
} from "react-icons/fi";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Lấy thông tin user từ LocalStorage và dọn dẹp chuỗi (đề phòng dính dấu ngoặc kép)
  const fullName = localStorage.getItem("fullName")?.replace(/['"]/g, '') || "Nhân viên";
  const role = localStorage.getItem("role")?.replace(/['"]/g, '').trim();

  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch token, role, info... cho an toàn tuyệt đối
    navigate("/login");
  };

  // Hàm kiểm tra active linh hoạt
  const isActive = (path) => location.pathname === path;
  
  // Nút Quản trị sẽ sáng lên nếu user đang ở trong MỘT TRONG CÁC trang quản lý
  const adminRoutes = ['/dashboard', '/users', '/categories', '/menu-items', '/vouchers', '/reports', '/attendance', '/tables'];
  const isAdminActive = adminRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="flex flex-col items-center py-6 h-full bg-gray-900 text-white relative w-20 shadow-xl z-50">
      
      {/* LOGO */}
      <div 
        onClick={() => navigate('/portal')}
        className="text-xl font-black mb-8 text-[#ff7b00] cursor-pointer hover:scale-110 transition-transform"
        title="Về cổng chính"
      >
        PL
      </div>

      <div className="flex flex-col items-center space-y-8 w-full">
        
        {/* Nút 1: Về Cổng Chọn Bộ Phận (Portal) */}
        <button 
          onClick={() => navigate('/portal')}
          className={`flex flex-col items-center text-sm transition-all w-full group
          ${isActive('/portal') ? 'text-[#ff7b00]' : 'text-gray-400 hover:text-white'}`}
          title="Màn hình chính"
        >
          <FiHome className={`text-2xl mb-1 group-hover:scale-110 transition-transform ${isActive('/portal') && 'drop-shadow-[0_0_8px_rgba(255,123,0,0.5)]'}`} />
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Cổng</span>
        </button>

        {/* Nút 2: Không gian Bán hàng (POS) */}
        <button 
          onClick={() => navigate('/pos')}
          className={`flex flex-col items-center text-sm transition-all w-full group
          ${isActive('/pos') ? 'text-[#ff7b00]' : 'text-gray-400 hover:text-white'}`}
          title="Bán hàng"
        >
          <FiShoppingCart className={`text-2xl mb-1 group-hover:scale-110 transition-transform ${isActive('/pos') && 'drop-shadow-[0_0_8px_rgba(255,123,0,0.5)]'}`} />
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">POS</span>
        </button>
        
        <button 
          onClick={() => navigate('/order-approvals')}
          className={`flex flex-col items-center text-sm transition-all w-full group
          ${isActive('/order-approvals') ? 'text-[#ff7b00]' : 'text-gray-400 hover:text-white'}`}
          title="Phê duyệt Order"
        >
          <FiCheckSquare className={`text-2xl mb-1 group-hover:scale-110 transition-transform ${isActive('/order-approvals') && 'drop-shadow-[0_0_8px_rgba(255,123,0,0.5)]'}`} />
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Duyệt</span>
        </button>

        {/* Nút 3: Không gian Quản trị (Admin Dashboard) */}
        {/* 🔥 TÍNH NĂNG BẢO MẬT: Chỉ hiển thị nút này nếu role là Admin */}
        {role === "Admin" && (
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center text-sm transition-all w-full group
            ${isAdminActive ? 'text-[#ff7b00]' : 'text-gray-400 hover:text-white'}`}
            title="Quản trị hệ thống"
          >
            <FiGrid className={`text-2xl mb-1 group-hover:scale-110 transition-transform ${isAdminActive && 'drop-shadow-[0_0_8px_rgba(255,123,0,0.5)]'}`} />
            <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Quản lý</span>
          </button>
        )}

      </div>

      {/* KHU VỰC CÁ NHÂN (PROFILE) */}
      <div className="mt-auto relative flex flex-col items-center w-full">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)} 
          className="flex flex-col items-center transition-all cursor-pointer group"
        >
          {/* Avatar thu gọn */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 border-2 transition-colors
            ${showProfileMenu ? 'bg-gray-700 border-[#ff7b00] text-[#ff7b00]' : 'bg-gray-800 border-gray-600 text-gray-300 group-hover:border-gray-400 group-hover:text-white'}`}
          >
            <FiUser className="text-xl" />
          </div>
          <span className="text-[10px] font-medium truncate w-16 text-center text-gray-400 group-hover:text-white">
            {/* Lấy chữ cái đầu hoặc tên ngắn gọn để không bị tràn */}
            {fullName.split(' ').pop()} 
          </span>
        </button>

        {/* Popup Menu Nổi (Sửa lại UI để sang trọng hơn) */}
        {showProfileMenu && (
          <div className="absolute bottom-4 left-16 ml-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
            <div className="px-5 py-4 border-b bg-slate-50">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Tài khoản</p>
              <p className="font-bold text-sm truncate text-slate-800">{fullName}</p>
              <p className="text-xs text-[#ff7b00] font-bold mt-1">{role}</p>
            </div>
            <div className="flex flex-col py-2">
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  // navigate("/change-password"); 
                }}
                className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-slate-100 font-medium transition-colors text-slate-700"
              >
                <FiSettings className="text-slate-400" />
                Đổi mật khẩu
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-red-50 font-medium transition-colors text-red-600"
              >
                <FiLogOut className="text-red-400" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}