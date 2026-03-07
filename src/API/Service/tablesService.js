    import api from "../axios";

    export const getAllTables = async () => {
        const res = await api.get("/tables"); 
        return res.data;
    };

    export const updateTableStatus = async (id, status) => {
        const res = await api.put(`/tables/${id}`, JSON.stringify(status),
    { headers: { 'Content-Type': 'application/json' } });
        return res.data;
    };

    export const getTableById = async (id) => {
        const res = await api.get(`/tables/${id}`);
        return res.data;
    };