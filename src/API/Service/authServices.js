import api from "../axios";

export const login = async (username, password) => {
  const res = await api.post("/auth/login", {
    username,
    password
  });
  return res.data; 
};

export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};