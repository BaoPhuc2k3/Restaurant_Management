import api from "../axios";

const reportService = {
  // 1. API thống kê tổng quan (Dashboard chính)
  getSummary: async (startDate, endDate) => {
    try {
      // Đính kèm params nếu có, nếu không truyền nó sẽ tự lấy 30 ngày gần nhất
      let url = `/dashboard/summary`;
      
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API Dashboard:", error);
      throw error;
    }
  },

  // 2. API thống kê trong ngày (Daily Dashboard)
  getDailySummary: async (date) => {
    try {
      let url = `/dashboard/daily-summary`;
      
      // Đính kèm tham số ngày nếu có, nếu không Backend sẽ tự lấy ngày hôm nay
      if (date) {
        url += `?date=${date}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi gọi API Daily Summary:", error);
      throw error;
    }
  }
};

export default reportService;