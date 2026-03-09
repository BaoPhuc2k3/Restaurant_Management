import api from "../axios"; // Đường dẫn này trỏ tới file axios.js cấu hình chung của bạn

// 1. LẤY DANH SÁCH MÓN ĐANG CHỜ (ĐANG NẤU)
export const getPendingKitchenItems = async () => {
  const res = await api.get("/kitchen/pending-items");
  return res.data;
};

// 2. LẤY DANH SÁCH LỊCH SỬ NẤU TRONG NGÀY
export const getKitchenHistoryToday = async () => {
  const res = await api.get("/kitchen/history-today");
  return res.data;
};

// 3. CẬP NHẬT TRẠNG THÁI MÓN ĂN (0: Chờ nấu -> 1: Đang nấu -> 2: Nấu xong -> 3: Lên bàn)
export const updateKitchenItemStatus = async (orderDetailId, nextStatus) => {
  // Axios sẽ tự động cấu hình header cho số nguyên (int)
  const res = await api.put(`/kitchen/update-status/${orderDetailId}`, nextStatus, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};