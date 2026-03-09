import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMonitor, FiCoffee, FiSettings, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function PortalPage() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const fullName = localStorage.getItem('fullName');

  // Hàm kiểm tra quyền trước khi mở cửa
  const handleEnterDepartment = (targetPath, allowedRoles, departmentName) => {
    if (allowedRoles.includes(userRole)) {
      navigate(targetPath);
    } else {
      toast.warning(`Cảnh báo: Bạn không có nhiệm vụ ở bộ phận ${departmentName}!`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      
      {/* Lời chào */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-wide">HỆ THỐNG QUẢN LÝ NHÀ HÀNG</h1>
        <p className="text-teal-400 text-lg">Xin chào, <span className="font-bold">{fullName}</span> ({userRole})</p>
        <p className="text-slate-400 mt-1">Vui lòng chọn bộ phận làm việc của bạn</p>
      </div>

      {/* 3 Ô Lựa Chọn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        
        {/* 1. Ô BÁN HÀNG / THU NGÂN */}
        <div 
          onClick={() => handleEnterDepartment('/pos', ['Admin', 'Cashier', 'Staff'], 'Bán Hàng')}
          className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(13,148,136,0.3)] transition-all duration-300 group"
        >
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FiMonitor className="text-5xl text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Bán Hàng (POS)</h2>
          <p className="text-slate-500 text-center mt-2 text-sm">Thu ngân & Phục vụ gọi món</p>
        </div>

        {/* 2. Ô BẾP */}
        <div 
          onClick={() => handleEnterDepartment('/kitchen', ['Admin', 'Kitchen'], 'Bếp')}
          className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all duration-300 group"
        >
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FiCoffee className="text-5xl text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Khu Vực Bếp</h2>
          <p className="text-slate-500 text-center mt-2 text-sm">Nhận Order & Báo món hoàn thành</p>
        </div>

        {/* 3. Ô QUẢN TRỊ ADMIN */}
        <div 
          onClick={() => handleEnterDepartment('/dashboard', ['Admin'], 'Quản Trị')}
          className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(139,92,246,0.3)] transition-all duration-300 group"
        >
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FiSettings className="text-5xl text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Quản Trị Viên</h2>
          <p className="text-slate-500 text-center mt-2 text-sm">Quản lý nhân sự, thực đơn & báo cáo</p>
        </div>

      </div>

      {/* Nút Đăng xuất */}
      <button 
        onClick={handleLogout}
        className="mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-6 py-2 rounded-full hover:bg-slate-800"
      >
        <FiLogOut /> Đăng xuất khỏi hệ thống
      </button>
    </div>
  );
}