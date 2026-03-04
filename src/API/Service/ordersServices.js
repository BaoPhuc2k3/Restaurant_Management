import api from "../axios";

// 1. API: Lưu hóa đơn mới khi thanh toán (Checkout)
export const createOrder = async (orderData) => {
    const res = await api.post("/orders/checkout", orderData);
    return res.data;
};

export const getAllOrders = async () => {
    const res = await api.get("/orders");
    return res.data;
};

export const getOrderById = async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
};