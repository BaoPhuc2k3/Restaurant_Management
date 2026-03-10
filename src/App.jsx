import { useState } from 'react'
import { Route, Routes, Navigate, useLocation, Outlet } from 'react-router-dom' 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

// --- CÁC COMPONENT CỦA BẠN ---
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import PortalPage from './pages/Portal/PortalPage' // 🔥 IMPORT TRANG PORTAL VÀO ĐÂY
// (Nếu bạn để thư mục khác thì sửa lại đường dẫn nhé)

import HomeCustomer from './pages/HomeCustomer/HomeCustomer'
import BookingLayout from './layouts/BookingLayout'
import BookingDate from './pages/Booking/BookingDate'
import BookingTime from './pages/Booking/BookingTime'
import BookingTable from './pages/Booking/BookingTable'
import BookingPreOrder from './pages/Booking/BookingPreOrder'

import POSPage from './pages/POS/POSPage'
import UserManagement from './components/AdminManagement/UserManagement'
import CategoryManagement from './components/AdminManagement/CategoryManagement'
import MenuItemsManagement from './components/AdminManagement/MenuItemsManagement'
import VoucherManagement from './components/AdminManagement/VoucherManagement'
import LayoutApp from './layouts/LayoutApp'
import AttendancePage from './pages/Attendance/AttendancePage'
import LoginAttendance from './pages/Attendance/LoginAttendance'
import AttendanceManager from './components/AdminManagement/AttendanceManagement' 
import AttendanceDetail from './components/AdminManagement/AttendanceDetails' 
import AdminReport from './components/AdminManagement/AdminReport' 
import KitchenPage from './pages/Kitchen/KitchenPage'
import AdminDashboard from './components/AdminManagement/AdminDashboard'
import TableManagement from './components/AdminManagement/TableManagement'
import DailyDashboard from './components/AdminManagement/DailyReports';
import HistoryManagement from './components/AdminManagement/HistoryManagement';
import CustomerOrder from './pages/CustomerOrder/CustomerOrder';
import OrderApprovalPage from './pages/OrderApprove/OrderApprovePage';

// 🔥 COMPONENT BẢO VỆ ĐƯỜNG DẪN (Người gác cổng)
const ProtectedRoute = ({ children, allowedRoles, loginPath = "/login" }) => {
  const token = localStorage.getItem("token");
  
  // Xóa khoảng trắng và dấu ngoặc kép thừa (nếu có)
  let role = localStorage.getItem("role");
  if (role) role = role.replace(/['"]/g, '').trim(); 

  const location = useLocation();

  // 1. Chưa đăng nhập -> chuyển về login
  if (!token) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng sai quyền
  if (allowedRoles && !allowedRoles.includes(role)) {
    toast.warning(`Cảnh báo: Bạn không có nhiệm vụ ở khu vực này!`, { autoClose: 3000 });

    // 🔥 TỐI ƯU HÓA: Mọi trường hợp sai quyền đều trả về Portal để người dùng tự chọn lại
    return <Navigate to="/portal" replace />; 
  }

  // 3. Nếu hợp lệ -> Trả về children (nếu bọc thẻ) hoặc Outlet (nếu dùng Route lồng nhau)
  return children ? children : <Outlet />;
};

function App() {
  return (
    <>
      <ToastContainer theme="colored" />
      <Routes>
        
        {/* ==========================================
            1. KHU VỰC CÔNG CỘNG (Không cần đăng nhập) 
        ========================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/timekeep/login" element={<LoginAttendance />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order/:tableId" element={<CustomerOrder />} />
        
        {/* 🔥 ĐỔI HƯỚNG MẶC ĐỊNH: Gõ domain gốc sẽ phi thẳng vào Portal */}
        <Route path="/" element={<Navigate to="/portal" replace />} />


        {/* ==========================================
            2. CỔNG ĐIỀU HƯỚNG TRUNG TÂM (PORTAL) 
        ========================================== */}
        {/* Ai đã đăng nhập đều vào được trang này để chọn phòng ban */}
        <Route 
          path="/portal" 
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier", "Staff", "Kitchen"]}>
              <PortalPage />
            </ProtectedRoute>
          } 
        />


        {/* ==========================================
            3. KHU VỰC BẾP (Chỉ Bếp và Admin) 
        ========================================== */}
        <Route element={<ProtectedRoute allowedRoles={["Admin", "Kitchen"]} />}>
          <Route path="/kitchen" element={<KitchenPage />} />
        </Route>


        {/* ==========================================
            4. KHU VỰC CHẤM CÔNG (Tất cả nhân viên) 
        ========================================== */}
        <Route 
          path="/timekeep" 
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier", "Staff", "Kitchen"]} loginPath="/timekeep/login">
              <AttendancePage />
            </ProtectedRoute>
          } 
        />


        {/* ==========================================
            5. KHU VỰC CÓ GIAO DIỆN CHUNG (LayoutApp) 
        ========================================== */}
        {/* Chặn 1: Bếp không được vào Layout này */}
        <Route element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier", "Staff"]}>
              <LayoutApp /> 
            </ProtectedRoute>
        }>
          
          {/* -- Tuyến đường cho Thu Ngân / Phục Vụ / Admin -- */}
          <Route path="/pos" element={<POSPage />}/>
            <Route path="/order-approvals" element={<OrderApprovalPage />} />
          
          {/* -- Tuyến đường QUẢN TRỊ (CHỈ ADMIN MỚI VÀO ĐƯỢC) -- */}
          {/* Chặn 2: Phục vụ/Thu ngân gõ link quản lý sẽ bị đá về Portal */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/daily-reports" element={<DailyDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/tables" element={<TableManagement />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/categories/:categoryId/menu-items" element={<MenuItemsManagement />} />
            <Route path="/vouchers" element={<VoucherManagement />} />
            <Route path="/attendance" element={<AttendanceManager />} />
            <Route path="/attendance/:userId" element={<AttendanceDetail />} />
            <Route path="/reports" element={<AdminReport />} />
            <Route path="/history" element={<HistoryManagement />} />
          </Route>
          
        </Route>
        
      </Routes>
    </>
  )
}

export default App