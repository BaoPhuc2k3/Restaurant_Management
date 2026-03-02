import api from "../axios";

export const getAllUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const createUser = async (data) => {
  const res = await api.post("/users", data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const toggleUserStatus = async (id) => {
  const res = await api.put(`/users/${id}/toggle`);
  return res.data;
};

export const resetUserPassword = async (id) => {
  const res = await api.put(`/users/${id}/reset-password`);
  return res.data;
};