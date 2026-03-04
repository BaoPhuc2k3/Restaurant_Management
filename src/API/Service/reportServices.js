import api from "../axios";

const reportService = {
  getSummary: async (startDate, endDate) => {
    try {
      // Đính kèm params nếu có, nếu không truyền nó sẽ tự lấy 30 ngày gần nhất (nhờ code backend)
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
  }
};

export default reportService;