import React, { useState, useEffect } from "react";
import reportService from "../../API/Service/reportServices"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FiBell, FiUser, FiFilter, FiDollarSign, FiShoppingBag, FiCheckCircle } from "react-icons/fi";

const PIE_COLORS_1 = ['#FFBB28', '#00C49F', '#0088FE', '#ff7300']; 
const PIE_COLORS_2 = ['#8884d8', '#ff7300', '#FF8042'];
const BAR_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C49F'];

const COLORS = {
  primary: '#f97316', // Orange 500
  success: '#10b981', // Emerald 500
  info: '#3b82f6',    // Blue 500
};

export default function AdminReport() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpi: { totalOrders: 0, totalRevenue: 0, newCustomers: 0, activeStaff: 0 },
    charts: { salesPieData: [], ordersBarData: [], attendancePieData: [], hoursBarData: [] }
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 🟢 Hàm chọn khoảng thời gian nhanh
  const setQuickDateRange = (type) => {
    const today = new Date();
    let start, end;

    if (type === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (type === 'lastMonth') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (type === 'thisWeek') {
      const firstDay = today.getDate() - today.getDay() + 1; // Bắt đầu từ thứ 2
      start = new Date(today.setDate(firstDay));
      end = new Date(today.setDate(firstDay + 6));
    }

    // Format ngày thành YYYY-MM-DD để đưa vào input type="date"
    const formatDate = (date) => {
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    };

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    
    // Gọi API luôn sau khi set ngày
    setTimeout(() => handleFilter(), 100);
  };

  useEffect(() => {
    // Mặc định load tháng này
    setQuickDateRange('thisMonth');
    // fetchRealData() sẽ được gọi bên trong setQuickDateRange
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Đang tải dữ liệu báo cáo...</div>;

  const { kpi, charts } = dashboardData;

  return (
    <div className="bg-slate-50 h-screen overflow-y-auto font-sans text-gray-800 pb-20">
      
      {/* HEADER */}
      <div className="bg-white h-16 flex justify-between items-center px-6 shadow-sm mb-6 sticky top-0 z-50">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">ADMIN COMMAND CENTER</h1>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700 group-hover:text-orange-500 transition-colors">admin</p>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border border-orange-200">
              AD
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        
        {/* THANH CÔNG CỤ & BỘ LỌC */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">Tổng Quan Hoạt Động</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Lọc và phân tích số liệu kinh doanh toàn hệ thống</p>
          </div>
            
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Quick Filters */}
            <div className="hidden md:flex bg-slate-100 rounded-lg p-1 mr-2">
              <button onClick={() => setQuickDateRange('thisMonth')} className="px-3 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all focus:bg-white focus:text-orange-600 focus:shadow-sm">Tháng này</button>
              <button onClick={() => setQuickDateRange('lastMonth')} className="px-3 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all focus:bg-white focus:text-orange-600 focus:shadow-sm">Tháng trước</button>
              <button onClick={() => setQuickDateRange('thisWeek')} className="px-3 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all focus:bg-white focus:text-orange-600 focus:shadow-sm">Tuần này</button>
            </div>

            {/* Custom Range Filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase">Từ</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer" />
            </div>
            <span className="text-slate-300">-</span>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase">Đến</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} 
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer" />
            </div>
            
            <button onClick={handleFilter} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md ml-auto xl:ml-0">
              <FiFilter /> Phân Tích
            </button>
          </div>
        </div>

        {/* ROW 1: KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Tổng Doanh Thu" value={formatCurrency(kpi.totalRevenue)} trend={kpi.trendRevenue > 0 ? `+${kpi.trendRevenue}%` : `${kpi.trendRevenue}%`} isGood={kpi.trendRevenue >= 0} icon={<FiDollarSign />} color="orange" />
          <KpiCard title="Tổng Đơn Hàng" value={kpi.totalOrders} trend={kpi.trendOrders > 0 ? `+${kpi.trendOrders}%` : `${kpi.trendOrders}%`} isGood={kpi.trendOrders >= 0} icon={<FiShoppingBag />} color="blue" />
          <KpiCard title="Khách Hàng Mới" value={kpi.newCustomers} trend={kpi.trendCustomers > 0 ? `+${kpi.trendCustomers}%` : `${kpi.trendCustomers}%`} isGood={kpi.trendCustomers >= 0} icon={<FiUser />} color="emerald" />
          <KpiCard title="Nhân Sự Active" value={kpi.activeStaff} subtitle="Nhân sự có đi làm" icon={<FiCheckCircle />} color="purple" />
        </div>

        {/* ROW 2: BIỂU ĐỒ DOANH THU CHÍNH */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Biểu Đồ Doanh Thu & Đơn Hàng</h3>
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">Kỳ báo cáo</span>
          </div>
          <div className="h-[350px] w-full">
            {charts.ordersBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">Không có dữ liệu trong khoảng thời gian này</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.ordersBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="orders" name="Số đơn hàng" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ROW 3: CƠ CẤU DOANH THU & NHÂN SỰ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CỘT TRÁI: DONUT CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-6">Cơ Cấu Doanh Thu Theo Danh Mục</h3>
            <div className="flex-1 min-h-[280px]">
              {charts.salesPieData.length === 0 ? <p className="text-center text-slate-400 mt-24 font-medium">Chưa có dữ liệu</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.salesPieData} cx="50%" cy="45%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" labelLine={false}>
                      {charts.salesPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS_1[index % PIE_COLORS_1.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: BAR CHART HORIZONTAL */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-6">Top Nhân Viên (Giờ Làm Việc)</h3>
            <div className="flex-1 min-h-[280px]">
              {charts.hoursBarData.length === 0 ? <p className="text-center text-slate-400 mt-24 font-medium">Chưa có dữ liệu</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={charts.hoursBarData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 12, fill: '#334155', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => `${value} giờ`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="hours" name="Giờ làm" fill={COLORS.info} radius={[0, 4, 4, 0]} barSize={24} />
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

// COMPONENT THẺ KPI
function KpiCard({ title, value, trend, isGood, subtitle, icon, color }) {
  const colorClasses = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-slate-300 transition-all flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <h3 className="text-2xl font-black text-slate-800 mb-2 truncate" title={value}>
        {value}
      </h3>
      
      <div className="mt-auto">
        {trend && (
          <p className={`text-xs font-bold flex items-center gap-1 ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
            <span className={`px-1.5 py-0.5 rounded ${isGood ? 'bg-emerald-100' : 'bg-rose-100'}`}>
               {trend}
            </span>
            <span className="text-slate-400 font-medium ml-1">so với kỳ trước</span>
          </p>
        )}
        
        {subtitle && (
          <p className="text-xs text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}