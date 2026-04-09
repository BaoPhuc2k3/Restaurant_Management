import api from "../axios"; 

// 1. LẤY TẤT CẢ BÀN
export const getAllTables = async () => {
    const res = await api.get("/tables"); 
    return res.data;
};

// 2. LẤY THÔNG TIN 1 BÀN BẰNG ID
export const getTableById = async (id) => {
    const res = await api.get(`/tables/${id}`);
    return res.data;
};

//  3. THÊM BÀN MỚI (MỚI)
export const createTable = async (tableData) => {
    // tableData chứa: { name, capacity, area }
    const res = await api.post("/tables", tableData);
    return res.data;
};

//  4. CẬP NHẬT THÔNG TIN BÀN (MỚI)
export const updateTable = async (id, tableData) => {
    // tableData chứa: { name, capacity, area }
    const res = await api.put(`/tables/${id}`, tableData);
    return res.data;
};

// 5. CẬP NHẬT TRẠNG THÁI BÀN (Lúc khách vào ngồi / thanh toán xong)
export const updateTableStatus = async (id, status) => {
    const res = await api.put(`/tables/${id}/status`, JSON.stringify(status), { 
        headers: { 'Content-Type': 'application/json' } 
    });
    return res.data;
};

//  6. XÓA BÀN (MỚI)
export const deleteTable = async (id) => {
    const res = await api.delete(`/tables/${id}`);
    return res.data;
};