import { useState } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom' 
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// --- CÁC COMPONENT CỦA BẠN ---
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
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

// 🔥 CÁC COMPONENT CHẤM CÔNG MỚI THÊM
import AttendancePage from './pages/Attendance/AttendancePage'
import LoginAttendance from './pages/Attendance/LoginAttendance'
import AttendanceManager from './components/AdminManagement/AttendanceManagement' // Đảm bảo bạn đã tạo file này
import AttendanceDetail from './components/AdminManagement/AttendanceDetails' // Đảm bảo bạn đã tạo file này

/* ======================================================== */
/* COMPONENT BẢO VỆ ROUTE (GÁC CỔNG)                        */
/* ======================================================== */
// 🔥 MỚI: Thêm tham số loginPath (Mặc định là "/login")
const ProtectedRoute = ({ children, allowedRoles, loginPath = "/login" }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // 1. Khách vãng lai (Chưa đăng nhập) -> Đá về trang Login tương ứng
  if (!token) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng sai quyền
  if (allowedRoles && !allowedRoles.includes(role)) {
    alert("Bạn không có quyền truy cập trang này!");
    // Nếu sai quyền, ưu tiên đá về màn hình chính của họ
    return <Navigate to={loginPath} replace />; 
  }

  // 3. Đầy đủ quyền hạn -> Cho qua
  return children;
};

/* ======================================================== */
/* APP ROUTER CHÍNH                                         */
/* ======================================================== */
function App() {
  return (
      <Routes>
        {/* === CÁC TRANG PUBLIC (Ai cũng vào được) === */}
        <Route path="/login" element={<Login />} />
        
        {/* 🔥 1. CÁNH CỬA 1: LOGIN CHO PHẦN MỀM CHẤM CÔNG */}
        <Route path="/timekeep/login" element={<LoginAttendance />} />

        {/* <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeCustomer />} />
        
        <Route path="/booking" element={<BookingLayout />}>
          <Route path="date" element={<BookingDate />} />
          <Route path="time" element={<BookingTime />} />
          <Route path="table" element={<BookingTable />} />
          <Route path="preorder" element={<BookingPreOrder />} />
        </Route> */}


        {/* 🔥 2. CÁNH CỬA 1: TRANG CHECK-IN CHẤM CÔNG (ĐỘC LẬP) */}
        {/* Trang này không nằm trong LayoutApp vì nó chiếm Full màn hình */}
        <Route 
          path="/timekeep" 
          element={
            // Nếu chưa đăng nhập, đá về "/timekeep/login" thay vì "/login" của POS
            <ProtectedRoute allowedRoles={["Admin", "Employee"]} loginPath="/timekeep/login">
              <AttendancePage />
            </ProtectedRoute>
          } 
        />


        {/* === CÁNH CỬA 2: CÁC TRANG BẢO MẬT CỦA POS (CÓ SIDEBAR) === */}
        <Route 
          element={
            <ProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <LayoutApp /> {/* Hiển thị cái khung có Sidebar */}
            </ProtectedRoute>
          }
        >
          <Route path="/pos" element={<POSPage />}/>
          <Route path="/users" element={<UserManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/categories/:categoryId/menu-items" element={<MenuItemsManagement />} />
          <Route path="/vouchers" element={<VoucherManagement />} />

          {/* 🔥 TRANG QUẢN LÝ CHẤM CÔNG DÀNH CHO ADMIN NẰM TRONG POS */}
          {/* Tùy bạn quyết định Employee có được xem bảng này không. Nếu chỉ Admin, hãy bọc ProtectedRoute lẻ ở đây */}
          <Route path="/attendance" element={<AttendanceManager />} />
          <Route path="/attendance/:userId" element={<AttendanceDetail />} />
        </Route>
        
      </Routes>
  )
}

export default App