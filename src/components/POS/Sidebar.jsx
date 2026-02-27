import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Import các icon từ thư viện react-icons/fi
import { 
  FiShoppingCart, 
  FiUsers, 
  FiCoffee, 
  FiPieChart, 
  FiUser 
} from "react-icons/fi";

export default function Sidebar() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Lấy tên nhân viên (Mặc định là Nhân viên nếu null)
  const fullName = localStorage.getItem("fullName") || "Nhân viên";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center py-6 h-full bg-gray-800 text-white relative">
      
      {/* PHẦN TRÊN: LOGO & MENU CHÍNH */}
      <div className="flex flex-col items-center space-y-6 w-full">
        <div className="text-xl font-bold mb-4 text-[#ff7b00]">PL RES</div>

        <button className="flex flex-col items-center text-sm hover:text-[#ff7b00] transition-colors">
          <FiShoppingCart className="text-2xl mb-1" />
          <span>Bán hàng</span>
        </button>

        <button className="flex flex-col items-center text-sm hover:text-[#ff7b00] transition-colors">
          <FiUsers className="text-2xl mb-1" />
          <span>Khách hàng</span>
        </button>

        <button className="flex flex-col items-center text-sm hover:text-[#ff7b00] transition-colors">
          <FiCoffee className="text-2xl mb-1" />
          <span>Thực đơn</span>
        </button>

        <button className="flex flex-col items-center text-sm hover:text-[#ff7b00] transition-colors">
          <FiPieChart className="text-2xl mb-1" />
          <span>Báo cáo</span>
        </button>
      </div>

      {/* PHẦN DƯỚI ĐÁY: THÔNG TIN ĐĂNG NHẬP (PROFILE) */}
      <div className="mt-auto relative flex flex-col items-center w-full">
        
        {/* Nút bấm hiển thị Popup */}
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)} 
          className="flex flex-col items-center text-sm hover:text-[#ff7b00] transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-1 border border-gray-500 group-hover:border-[#ff7b00] transition-colors">
            <FiUser className="text-xl" />
          </div>
          <span className="text-xs truncate w-16 text-center">{fullName}</span>
        </button>

        {/* POPUP MENU (Cửa sổ nhỏ) */}
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