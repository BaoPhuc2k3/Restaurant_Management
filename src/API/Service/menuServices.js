import api from "../axios";

// Lấy tất cả món ăn
export const getAllMenuItems = async () => {
    const res = await api.get("/menuitems"); // Đảm bảo Backend có route này
    return res.data;
};

// (Tùy chọn) Lấy danh mục menu để làm filter
export const getAllMenus = async () => {
    const res = await api.get("/menus");
    return res.data;
};