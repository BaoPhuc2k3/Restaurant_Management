import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiGrid, FiTag, FiClock, FiPieChart, FiLayout,
  FiTrendingUp, FiFileText 
} from 'react-icons/fi';

export default function AdminDashboard() {
  const navigate = useNavigate();

  
  const managementModules = [
    { 
      id: 1, title: "Tài Khoản", description: "Quản lý nhân viên & phân quyền", 
      icon: <FiUsers className="text-4xl" />, path: "/users", 
      color: "bg-blue-50 text-blue-600 hover:shadow-blue-200", iconBg: "bg-blue-100" 
    },
    { 
      id: 2, title: "Sơ Đồ Bàn", description: "Quản lý khu vực & bàn ăn", 
      icon: <FiLayout className="text-4xl" />, path: "/tables", 
      color: "bg-emerald-50 text-emerald-600 hover:shadow-emerald-200", iconBg: "bg-emerald-100" 
    },
    { 
      id: 3, title: "Danh Mục Món", description: "Thêm/sửa danh mục & thực đơn", 
      icon: <FiGrid className="text-4xl" />, path: "/categories", 
      color: "bg-orange-50 text-orange-600 hover:shadow-orange-200", iconBg: "bg-orange-100" 
    },
    { 
      id: 4, title: "Khuyến Mãi", description: "Quản lý Voucher & giảm giá", 
      icon: <FiTag className="text-4xl" />, path: "/vouchers", 
      color: "bg-pink-50 text-pink-600 hover:shadow-pink-200", iconBg: "bg-pink-100" 
    },
    { 
      id: 5, title: "Chấm Công", description: "Kiểm tra giờ làm nhân viên", 
      icon: <FiClock className="text-4xl" />, path: "/attendance", 
      color: "bg-indigo-50 text-indigo-600 hover:shadow-indigo-200", iconBg: "bg-indigo-100" 
    },
    
    { 
      id: 6, title: "Lịch Sử Đơn", description: "Tra cứu hóa đơn & in lại Bill", 
      icon: <FiFileText className="text-4xl" />, path: "/history", 
      color: "bg-rose-50 text-rose-600 hover:shadow-rose-200", iconBg: "bg-rose-100" 
    },
    { 
      id: 7, title: "Báo Cáo Ngày", description: "Theo dõi doanh thu trong ngày", 
      icon: <FiTrendingUp className="text-4xl" />, path: "/dashboard/daily-summary", 
      color: "bg-teal-50 text-teal-600 hover:shadow-teal-200", iconBg: "bg-teal-100" 
    },
    { 
      id: 88, title: "Báo Cáo Tổng", description: "Doanh thu & Thống kê dài hạn", 
      icon: <FiPieChart className="text-4xl" />, path: "/reports", 
      color: "bg-purple-50 text-purple-600 hover:shadow-purple-200", iconBg: "bg-purple-100" 
    },
    
    
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Trung Tâm Quản Trị</h1>
        <p className="text-gray-500 mt-2">Chọn một phân hệ bên dưới để bắt đầu quản lý hệ thống</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {managementModules.map((module) => (
          <div
            key={module.id}
            onClick={() => navigate(module.path)}
            className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-white shadow-sm ${module.color}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${module.iconBg}`}>
              {module.icon}
            </div>
            <h2 className="text-xl font-bold mb-1">{module.title}</h2>
            <p className="text-sm opacity-80">{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}