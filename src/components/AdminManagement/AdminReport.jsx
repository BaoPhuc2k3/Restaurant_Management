import React, { useState, useEffect } from "react";
import reportService from "../../API/Service/reportServices"; // Đảm bảo bạn đã tạo file này và export đúng
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FiBell, FiUser, FiFilter } from "react-icons/fi";

const PIE_COLORS_1 = ['#FFBB28', '#00C49F', '#0088FE', '#ff7300']; 
const PIE_COLORS_2 = ['#8884d8', '#ff7300', '#FF8042'];
const BAR_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C49F'];

export default function AdminReport() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpi: { totalOrders: 0, totalRevenue: 0, newCustomers: 0, activeStaff: 0 },
    charts: { salesPieData: [], ordersBarData: [], attendancePieData: [], hoursBarData: [] }
  });

    const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const data = await reportService.getSummary(startDate, endDate);
      if(data) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleFilter = () => {
    fetchRealData();
}
  // Hàm format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu thật từ Database...</div>;

  const { kpi, charts } = dashboardData;

  return (
    <div className="bg-[#f4f7f6] min-h-screen font-sans text-gray-800">
      
      <div className="bg-white h-16 flex justify-between items-center px-6 shadow-sm mb-6">
        <h1 className="text-xl font-bold text-gray-700">Admin Dashboard <FiBell className="inline ml-2 text-gray-400" /></h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-700">admin</p>
            <p className="text-xs text-orange-500 font-bold uppercase">Admin</p>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><FiUser size={20} /></div>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded shadow-sm">
            <h2 className="text-lg font-bold text-gray-700 mb-4 md:mb-0">
                Báo cáo kinh doanh 
                <span className="text-sm font-normal text-gray-500 ml-2">
                </span>
            </h2>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Từ:</span>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500 text-gray-700 cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Đến:</span>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500 text-gray-700 cursor-pointer"
                    />
                </div>
                <button 
                    onClick={handleFilter}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <FiFilter /> Lọc
                </button>
            </div>
        </div>

        {/* ROW 1: KPI CARDS (Dữ liệu thật) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Tổng đơn hàng" value={kpi.totalOrders} />
          <KpiCard title="Tổng doanh thu" value={formatCurrency(kpi.totalRevenue)} highlight />
          <KpiCard title="Khách hàng mới" value={kpi.newCustomers} />
          <KpiCard title="Nhân viên đi làm" value={kpi.activeStaff} />
        </div>

        {/* ROW 2: KINH DOANH */}
        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Business Statistics (Kinh doanh)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-white p-5 rounded shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Phân bổ doanh thu theo danh mục</h3>
            <div className="h-62.5">
              {charts.salesPieData.length === 0 ? <p className="text-center text-gray-400 mt-20">Chưa có dữ liệu bán hàng</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.salesPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {charts.salesPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS_1[index % PIE_COLORS_1.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Đơn hàng theo ngày (7 ngày qua)</h3>
            <div className="h-62.5">
              {charts.ordersBarData.length === 0 ? <p className="text-center text-gray-400 mt-20">Chưa có dữ liệu bán hàng</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.ordersBarData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f4f7f6'}} />
                    <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                      {charts.ordersBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: NHÂN SỰ */}
        <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Human Resources (Nhân sự & Chấm công)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white p-5 rounded shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Tỷ lệ chuyên cần (Mô phỏng)</h3>
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.attendancePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {charts.attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS_2[index % PIE_COLORS_2.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Top Nhân viên (Theo tổng giờ làm)</h3>
            <div className="h-62.5">
              {charts.hoursBarData.length === 0 ? <p className="text-center text-gray-400 mt-20">Chưa có dữ liệu chấm công</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.hoursBarData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f4f7f6'}} formatter={(value) => `${value} giờ`} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {charts.hoursBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[(index + 3) % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, highlight }) {
  return (
    <div className="bg-white p-5 rounded shadow-sm border-l-4 border-transparent hover:border-orange-500 transition-colors">
      <p className="text-sm text-gray-500 font-medium mb-2">{title}</p>
      <h3 className={`text-2xl font-bold ${highlight ? 'text-orange-500' : 'text-gray-800'}`}>
        {value}
      </h3>
    </div>
  );
}