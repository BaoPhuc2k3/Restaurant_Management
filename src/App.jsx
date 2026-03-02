import { useState } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom' // Bổ sung Navigate và useLocation
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
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
import LayoutApp from './layouts/LayoutApp'

/* ======================================================== */
/* COMPONENT BẢO VỆ ROUTE (GÁC CỔNG)                        */
/* ======================================================== */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // 1. Khách vãng lai (Chưa đăng nhập) -> Đá về trang Login
  if (!token) {
    // Lưu lại vị trí họ đang muốn vào (location) để Login xong trả về đúng chỗ đó
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng sai quyền (Ví dụ: Customer cố mò vào link POS) -> Đá về trang chủ
  if (allowedRoles && !allowedRoles.includes(role)) {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/login" replace />;
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
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeCustomer />} />
        
        <Route path="/booking" element={<BookingLayout />}>
          <Route path="date" element={<BookingDate />} />
          <Route path="time" element={<BookingTime />} />
          <Route path="table" element={<BookingTable />} />
          <Route path="preorder" element={<BookingPreOrder />} />
        </Route>

        {/* === CÁC TRANG BẢO MẬT (Phải có Token và Role hợp lệ) === */}
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
        </Route>
        
        
        {/* Sau này bạn có thêm trang Admin thì copy mẫu này:
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        */}
      </Routes>
  )
}

export default App