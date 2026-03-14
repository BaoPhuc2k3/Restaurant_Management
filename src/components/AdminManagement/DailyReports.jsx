import React, { useState, useEffect } from "react";
import { 
  FiShoppingBag, FiCreditCard, FiDollarSign, FiTag, 
  FiCheckCircle, FiXCircle, FiCalendar, FiActivity 
} from "react-icons/fi";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import reportService from "../../API/Service/reportServices";

export default function DailyDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    summary: { totalOrders: 0, subTotal: 0, finalTotal: 0, vouchersUsed: 0 },
    completedItems: [],
    canceledItems: [],
    hourlyData: [] // Dữ liệu cho biểu đồ
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyReport = async () => {
      setLoading(true);
      try {
        const resData = await reportService.getDailySummary(selectedDate);
        
        // 🟢 NỐI TRỰC TIẾP DỮ LIỆU TỪ BACKEND
        setData({
          summary: {
            totalOrders: resData.summary?.totalOrders || 0,
            subTotal: resData.summary?.subTotal || 0,
            finalTotal: resData.summary?.finalTotal || 0,
            vouchersUsed: resData.summary?.vouchersUsed || 0
          },
          completedItems: resData.completedItems || [],
          canceledItems: resData.canceledItems || [],
          // Lấy mảng HourlyData từ C# gửi xuống (mặc định mảng rỗng nếu không có dữ liệu)
          hourlyData: resData.hourlyData || [] 
        });
      } catch (error) {
        console.error("Lỗi tải báo cáo ngày", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyReport();
  }, [selectedDate]);

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Đang tải báo cáo ngày...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Báo Cáo Tổng Hợp Trong Ngày</h1>
          <p className="text-slate-500 text-sm mt-1">Chi tiết doanh thu và sản phẩm bán ra</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <FiCalendar className="text-slate-400 mr-2" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* 4 THẺ CHỈ SỐ KINH DOANH TRỌNG TÂM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng đơn hàng</p>
            <h3 className="text-3xl font-black text-slate-800">{data.summary.totalOrders}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">
            <FiShoppingBag />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gốc (Chưa trừ Voucher)</p>
            <h3 className="text-2xl font-black text-slate-700">{data.summary.subTotal.toLocaleString()}đ</h3>
          </div>
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-2xl">
            <FiCreditCard />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Thực thu (Đã trừ)</p>
            <h3 className="text-3xl font-black text-emerald-700">{data.summary.finalTotal.toLocaleString()}đ</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Voucher đã dùng</p>
            <h3 className="text-3xl font-black text-purple-700">{data.summary.vouchersUsed}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl">
            <FiTag />
          </div>
        </div>
      </div>

      {/* 🟢 KHU VỰC BIỂU ĐỒ TRỰC TIẾP TỪ BACKEND */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6">
          <FiActivity className="text-emerald-500 text-xl" />
          <h3 className="font-bold text-slate-800 text-lg">Lưu lượng đơn hàng đến theo giờ</h3>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#334155' }}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                name="Số đơn hàng"
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorOrders)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DANH SÁCH MÓN ĂN (2 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        
        {/* CỘT 1: TẤT CẢ MÓN ĐÃ HOÀN THÀNH */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-emerald-50/50">
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600" /> Món Đã Hoàn Thành
            </h3>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
              Tổng SL: {data.completedItems.reduce((acc, curr) => acc + curr.qty, 0)}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Tên món</th>
                  <th className="px-4 py-3 text-center">Số lượng</th>
                  <th className="px-4 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.completedItems.length === 0 ? (
                  <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">Chưa có món nào được hoàn thành.</td></tr>
                ) : (
                  data.completedItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-slate-400 font-normal text-xs">{index + 1}.</span> {item.name}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">
                        x{item.qty}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium">
                        {item.totalAmount.toLocaleString()}đ
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT 2: TẤT CẢ MÓN BỊ HỦY */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-rose-50/50">
            <h3 className="font-bold text-rose-800 flex items-center gap-2">
              <FiXCircle className="text-rose-600" /> Món Bị Hủy
            </h3>
            <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded">
              Tổng SL: {data.canceledItems.reduce((acc, curr) => acc + curr.qty, 0)}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0">
            <table className="w-full text-sm text-left relative">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Tên món</th>
                  <th className="px-4 py-3 text-center">Số lượng</th>
                  <th className="px-4 py-3 text-right">Thất thoát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.canceledItems.length === 0 ? (
                  <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">Không có món nào bị hủy.</td></tr>
                ) : (
                  data.canceledItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-rose-50">
                      <td className="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                         <span className="text-slate-400 font-normal text-xs">{index + 1}.</span> {item.name}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-rose-600">
                        x{item.qty}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-medium">
                        {item.loss.toLocaleString()}đ
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}