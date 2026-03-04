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
import AttendancePage from './pages/Attendance/AttendancePage'
import LoginAttendance from './pages/Attendance/LoginAttendance'
import AttendanceManager from './components/AdminManagement/AttendanceManagement' 
import AttendanceDetail from './components/AdminManagement/AttendanceDetails' 
import AdminReport from './components/AdminManagement/AdminReport' 

const ProtectedRoute = ({ children, allowedRoles, loginPath = "/login" }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  //Chưa đăng nhập -> chuyển về login
  if (!token) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng sai quyền
  if (allowedRoles && !allowedRoles.includes(role)) {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to={loginPath} replace />; 
  }

  return children;
};
function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/timekeep/login" element={<LoginAttendance />} />
        <Route path="/register" element={<Register />}></Route>
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
            <ProtectedRoute allowedRoles={["Admin", "Employee"]} loginPath="/timekeep/login">
              <AttendancePage />
            </ProtectedRoute>
          } 
        />

        <Route 
          element={
            <ProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <LayoutApp /> 
            </ProtectedRoute>
          }
        >
          <Route path="/pos" element={<POSPage />}/>
          <Route path="/users" element={<UserManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/categories/:categoryId/menu-items" element={<MenuItemsManagement />} />
          <Route path="/vouchers" element={<VoucherManagement />} />
          <Route path="/attendance" element={<AttendanceManager />} />
          <Route path="/attendance/:userId" element={<AttendanceDetail />} />
          <Route path="/reports" element={<AdminReport />} />
        </Route>
        
      </Routes>
  )
}

export default App