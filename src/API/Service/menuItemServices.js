import api from "../axios";

// Lấy tất cả món ăn
export const getAllMenuItems = async () => {
    const res = await api.get("/menuitems"); // Đảm bảo Backend có route này
    return res.data;
};

export const getItemsByCategory = async (categoryId) => {
  const res = await api.get(`/menuitems/category/${categoryId}`);
  return res.data;
};

export const createMenuItem = async (data) => {
  // data gồm: { menuId, name, price }
  const res = await api.post("/menuitems", data);
  return res.data;
};

export const updateMenuItem = async (id, data) => {
  const res = await api.put(`/menuitems/${id}`, data);
  return res.data;
};

export const toggleMenuItem = async (id) => {
  const res = await api.put(`/menuitems/${id}/toggle`);
  return res.data;
};

export const deleteMenuItem = async (id) => {
  const res = await api.delete(`/menuitems/${id}`);
  return res.data;
};