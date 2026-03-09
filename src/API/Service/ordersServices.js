import api from "../axios";

/* =========================================================
   A. NHÓM API DÀNH CHO MÀN HÌNH BÁN HÀNG (POS)
========================================================= */

// 1. Lấy đơn hàng đang hoạt động của một bàn (chưa thanh toán)
export const getActiveOrderByTable = async (tableId) => {
    const res = await api.get(`/orders/table/${tableId}/active`);
    return res.data;
};

// 2. Tạo đơn hàng mới (Khi bàn trống và gửi món lần đầu)
export const createNewOrder = async (payload) => {
    const res = await api.post(`/orders`, payload);
    return res.data;
};

// 3. Thêm món vào đơn hàng đã tồn tại (Khi khách gọi thêm món)
export const addItemsToExistingOrder = async (orderId, items) => {
    const res = await api.post(`/orders/${orderId}/add-items`, items);
    return res.data;
};

// 4. Hủy toàn bộ đơn hàng của một bàn (Hủy bàn)
export const cancelOrder = async (tableId) => {
    const res = await api.delete(`/orders/${tableId}/cancel`);
    return res.data;
};

// 5. Hủy 1 món ăn đã gửi xuống bếp
export const cancelItemInOrder = async (orderDetailId, reason) => {
    const res = await api.put(`/orders/cancel-item/${orderDetailId}?reason=${encodeURIComponent(reason)}`);
    return res.data;
};

// 6. Thanh toán hóa đơn (Checkout)
// Lưu ý: Đổi tên thành checkoutOrder cho khớp với POSPage. 
// Chức năng hoàn toàn giống hàm createOrder cũ của bạn.
export const checkoutOrder = async (payload) => {
    const res = await api.post("/orders/checkout", payload);
    return res.data;
};


/* =========================================================
   B. NHÓM API DÀNH CHO MÀN HÌNH QUẢN LÝ / BÁO CÁO
========================================================= */

// 7. Lấy danh sách tất cả hóa đơn (Dùng cho trang Quản lý hóa đơn / Lịch sử)
export const getAllOrders = async () => {
    const res = await api.get("/orders");
    return res.data;
};

// 8. Lấy chi tiết một hóa đơn cụ thể theo ID
export const getOrderById = async (orderId) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
};

// Lấy lịch sử hóa đơn theo khoảng thời gian
export const getInvoiceHistory = async (startDate, endDate) => {
    const res = await api.get(`/orders/history?startDate=${startDate}&endDate=${endDate}`);
    return res.data;
};