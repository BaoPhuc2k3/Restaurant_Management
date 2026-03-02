import api from "../axios";



// (Tùy chọn) Lấy danh mục menu để làm filter
export const getAllMenus = async () => {
    const res = await api.get("/menus");
    return res.data;
};

export const createMenu = async (name) => {
  const res = await api.post("/menus", { name: name }); 
  return res.data;
};

export const updateMenu = async (id, name) => {
  const res = await api.put(`/menus/${id}`, { name: name });
  return res.data;
};

// Thêm hàm gọi API Bật/Tắt
export const toggleMenuStatus = async (id) => {
  const res = await api.put(`/menus/${id}/toggle`);
  return res.data;
};

// Kiểm tra trước khi xóa
export const checkDeleteMenuStatus = async (id) => {
  const res = await api.get(`/menus/${id}/check-delete`);
  return res.data; // Trả về { status: 1|2|3, message: "..." }
};

// Gọi lệnh xóa thật (Có thêm tham số query deleteItems)
export const deleteMenu = async (id, deleteItems = false) => {
  const res = await api.delete(`/menus/${id}?deleteItems=${deleteItems}`);
  return res.data;
};

// export const deleteMenu = async (id) => {
//   const res = await api.delete(`/menus/${id}`);
//   return res.data;
// };