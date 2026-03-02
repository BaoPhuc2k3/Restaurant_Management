import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import { 
  FiShoppingCart, 
  FiUsers, 
  FiCoffee, 
  FiPieChart, 
  FiUser 
} from "react-icons/fi";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn URL hiện tại
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fullName = localStorage.getItem("fullName") || "Nhân viên";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Hàm phụ trợ để kiểm tra xem nút nào đang được chọn
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex flex-col items-center py-6 h-full bg-gray-800 text-white relative">
      
      {/* LOGO */}
      <div className="text-xl font-bold mb-8 text-[#ff7b00]">PL RES</div>

      {/* CÁC NÚT CHỨC NĂNG CHÍNH */}
      <div className="flex flex-col items-center space-y-6 w-full">
        
        {/* Nút Bán hàng -> Chuyển sang /pos */}
        <button 
          onClick={() => navigate('/pos')}
          className={`flex flex-col items-center text-sm transition-colors w-full ${isActive('/pos') ? 'text-[#ff7b00]' : 'text-gray-300 hover:text-white'}`}
        >
          <FiShoppingCart className="text-2xl mb-1" />
          <span>Bán hàng</span>
        </button>

        {/* Nút Khách hàng -> Tạm thời để trống hoặc chuyển sang /customers */}
        <button 
          onClick={() => navigate('/users')}
          className={`flex flex-col items-center text-sm transition-colors w-full ${isActive('/users') ? 'text-[#ff7b00]' : 'text-gray-300 hover:text-white'}`}
        >
          <FiUsers className="text-2xl mb-1" />
          <span>User</span>
        </button>

        {/* Nút Thực đơn -> Chuyển sang /categories */}
        <button 
          onClick={() => navigate('/categories')}
          className={`flex flex-col items-center text-sm transition-colors w-full ${isActive('/categories') || isActive('/menu-items') ? 'text-[#ff7b00]' : 'text-gray-300 hover:text-white'}`}
        >
          <FiCoffee className="text-2xl mb-1" />
          <span>Thực đơn</span>
        </button>

        {/* Nút Báo cáo -> Chuyển sang /reports */}
        <button 
          onClick={() => navigate('/reports')}
          className={`flex flex-col items-center text-sm transition-colors w-full ${isActive('/reports') ? 'text-[#ff7b00]' : 'text-gray-300 hover:text-white'}`}
        >
          <FiPieChart className="text-2xl mb-1" />
          <span>Báo cáo</span>
        </button>
      </div>

      {/* PHẦN PROFILE DƯỚI ĐÁY (Giữ nguyên) */}
      <div className="mt-auto relative flex flex-col items-center w-full">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)} 
          className="flex flex-col items-center text-sm text-gray-300 hover:text-white transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-1 border border-gray-500 group-hover:border-gray-300 transition-colors">
            <FiUser className="text-xl" />
          </div>
          <span className="text-xs truncate w-16 text-center">{fullName}</span>
        </button>

        {showProfileMenu && (
          <div className="absolute bottom-2 left-full ml-4 w-48 bg-white text-gray-800 rounded-lg shadow-xl border overflow-hidden z-50">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-xs text-gray-500">Đang đăng nhập</p>
              <p className="font-bold text-sm truncate">{fullName}</p>
            </div>
            <div className="flex flex-col">
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  // navigate("/change-password"); 
                }}
                className="text-left px-4 py-2 text-sm hover:bg-gray-100 font-medium transition-colors"
              >
                Đổi mật khẩu
              </button>
              <button 
                onClick={handleLogout}
                className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors border-t"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}