import api from "../axios";

// 1. API: Lưu hóa đơn mới khi thanh toán (Checkout)
export const createOrder = async (orderData) => {
    // Gọi method POST lên endpoint của Backend (ví dụ: /api/orders/checkout)
    const res = await api.post("/orders/checkout", orderData);
    return res.data;
};

// 2. API: (Tùy chọn) Lấy lịch sử các hóa đơn đã thanh toán
export const getAllOrders = async () => {
    const res = await api.get("/orders");
    return res.data;
};

// 3. API: (Tùy chọn) Lấy chi tiết 1 hóa đơn theo ID
export const getOrderById = async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
};