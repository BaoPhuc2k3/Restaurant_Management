import axios from '../axios'; // Hoặc đường dẫn file cấu hình axios của bạn

// const API_URL = '/api/vouchers';

export const getAllVouchers = async () => {
  const response = await axios.get('/vouchers');
  return response.data;
};

export const createVoucher = async (data) => {
  const response = await axios.post('/vouchers', data);
  return response.data;
};

export const updateVoucher = async (id, data) => {
  const response = await axios.put(`${'/vouchers'}/${id}`, data);
  return response.data;
};

export const toggleVoucherStatus = async (id) => {
  const response = await axios.put(`${'/vouchers'}/${id}/toggle`);
  return response.data;
};

export const deleteVoucher = async (id) => {
  const response = await axios.delete(`${'/vouchers'}/${id}`);
  return response.data;
};