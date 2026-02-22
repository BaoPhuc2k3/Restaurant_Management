import api from "../axios"; // Import cái file "cố định" ở trên

export const getAllTables = async () => {
    const res = await api.get("/tables"); // URL này sẽ nối vào baseURL thành https://localhost:7291/api/tables
    return res.data;
};

export const updateTableStatus = async (id, status) => {
    // Truyền id vào URL và status vào Body
    const res = await api.put(`/tables/${id}`, status);
    return res.data;
};

export const getTableById = async (id) => {
    const res = await api.get(`/tables/${id}`);
    return res.data;
};