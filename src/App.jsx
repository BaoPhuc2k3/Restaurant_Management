import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
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

function App() {
  return (
      <Routes>
        <Route path="/pos" element={<POSPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeCustomer />} />
        <Route path="/booking" element={<BookingLayout />}>
          <Route path="date" element={<BookingDate />} />
          <Route path="time" element={<BookingTime />} />
          <Route path="table" element={<BookingTable />} />
          <Route path="preorder" element={<BookingPreOrder />} />
        </Route>
      </Routes>
  )
}
export default App
