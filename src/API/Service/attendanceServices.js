import api from '../axios';

export const getAttendanceStatus = async () => {
    const res = await api.get('/attendance/status');
    return res.data;
};

export const doCheckIn = async () => {
    const res = await api.post('/attendance/check-in');
    return res.data;
};

export const doCheckOut = async () => {
    const res = await api.post('/attendance/check-out');
    return res.data;
};