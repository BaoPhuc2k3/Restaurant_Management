import React, { useState, useEffect } from "react";
import reportService from "../../API/Service/reportServices"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FiBell, FiUser, FiFilter, FiDollarSign, FiShoppingBag, FiCheckCircle, FiPower } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // Thêm để có thể đăng xuất

const PIE_COLORS_1 = ['#FFBB28', '#00C49F', '#0088FE', '#ff7300']; 
const PIE_COLORS_2 = ['#8884d8', '#ff7300', '#FF8042'];
const BAR_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00C49F'];

const COLORS = {
  primary: '#f97316', // Orange 500
  success: '#10b981', // Emerald 500
  info: '#3b82f6',    // Blue 500
};

export default function AdminReport() {
  const navigate = useNavigate();
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
    
    setTimeout(() => handleFilter(), 100);
  };

  useEffect(() => {
    setQuickDateRange('thisMonth');
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

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.clear();
      navigate("/login");
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Đang tải dữ liệu báo cáo...</div>;

  const { kpi, charts } = dashboardData;

  return (
    <div className="bg-slate-50 min-h-screen overflow-y-auto font-sans text-gray-800 pb-10">
      
      {/* HEADER: Chiếm 100% width */}
      <div className="bg-white h-16 flex justify-between items-center px-8 shadow-sm mb-6 sticky top-0 z-50">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">ADMIN COMMAND CENTER</h1>
        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-orange-500 transition-colors">
            <FiBell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">admin</p>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border border-orange-200">
              AD
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Đăng xuất"
            >
              <FiPower size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 NỘI DUNG CHÍNH: Bỏ max-w-7xl, thay bằng w-full và px-8 */}
      <div className="w-full px-8">
        
        {/* THANH CÔNG CỤ & BỘ LỌC */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 bg-white p-5 rounded-xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">Tổng Quan Hoạt Động</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Lọc và phân tích số liệu kinh doanh toàn hệ thống</p>
          </div>
            
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Quick Filters */}
            <div className="hidden md:flex bg-slate-100 rounded-lg p-1 mr-2">
              <button onClick={() => setQuickDateRange('thisMonth')} className="px-4 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all focus:bg-white focus:text-orange-600 focus:shadow-sm">Tháng này</button>
              <button onClick={() => setQuickDateRange('lastMonth')} className="px-4 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all focus:bg-white focus:text-orange-600 focus:shadow-sm">Tháng trước</button>
              <button onClick={() => setQuickDateRange('thisWeek')} className="px-4 py-1.5 text-xs font-bold rounded-md text-slate-600 hover:bg-white hover:text-orange-600 hover:shadow-sm transition-all focus:bg-white focus:text-orange-600 focus:shadow-sm">Tuần này</button>
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
            
            <button onClick={handleFilter} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md ml-auto xl:ml-0">
              <FiFilter /> Phân Tích
            </button>
          </div>
        </div>

        {/* ROW 1: KPI CARDS */}
        {/* Để full-width đẹp, trên màn hình siêu to (2xl) có thể chia thành 4 hoặc 5 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Tổng Doanh Thu" value={formatCurrency(kpi.totalRevenue)} trend={kpi.trendRevenue > 0 ? `+${kpi.trendRevenue}%` : `${kpi.trendRevenue}%`} isGood={kpi.trendRevenue >= 0} icon={<FiDollarSign />} color="orange" />
          <KpiCard title="Tổng Đơn Hàng" value={kpi.totalOrders} trend={kpi.trendOrders > 0 ? `+${kpi.trendOrders}%` : `${kpi.trendOrders}%`} isGood={kpi.trendOrders >= 0} icon={<FiShoppingBag />} color="blue" />
          <KpiCard title="Khách Hàng Mới" value={kpi.newCustomers} trend={kpi.trendCustomers > 0 ? `+${kpi.trendCustomers}%` : `${kpi.trendCustomers}%`} isGood={kpi.trendCustomers >= 0} icon={<FiUser />} color="emerald" />
          <KpiCard title="Nhân Sự Active" value={kpi.activeStaff} subtitle="Số nhân sự có đi làm" icon={<FiCheckCircle />} color="purple" />
        </div>

        {/* ROW MỚI: Biểu đồ doanh thu cực lớn (Chiếm 100% width) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 w-full">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800">Biểu Đồ Doanh Thu & Đơn Hàng Theo Ngày</h3>
            <span className="text-xs font-bold bg-orange-100 text-orange-600 px-3 py-1 rounded-full">Kỳ báo cáo: {startDate} đến {endDate}</span>
          </div>
          <div className="h-100 w-full">
            {charts.ordersBarData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-lg border border-dashed border-slate-200">Không có dữ liệu trong khoảng thời gian này</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.ordersBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  {/* Tăng barSize lên một chút trên màn hình lớn */}
                  <Bar dataKey="orders" name="Số đơn hàng" fill={COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ROW 3: CƠ CẤU DOANH THU & NHÂN SỰ */}
        {/* Trên màn siêu lớn (2xl) có thể cho cột BarChart ngang dài hơn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: DONUT CHART (Chiếm 1/2 hoặc 1/3) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col 2xl:col-span-1">
            <h3 className="text-base font-bold text-slate-800 mb-6">Cơ Cấu Doanh Thu Theo Danh Mục</h3>
            <div className="flex-1 min-h-[300px]">
              {charts.salesPieData.length === 0 ? <p className="text-center text-slate-400 mt-32 font-medium">Chưa có dữ liệu</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.salesPieData} cx="50%" cy="45%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" labelLine={false}>
                      {charts.salesPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS_1[index % PIE_COLORS_1.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '600', color: '#475569', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: BAR CHART HORIZONTAL (Chiếm 1/2 hoặc 2/3) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col 2xl:col-span-2">
            <h3 className="text-base font-bold text-slate-800 mb-6">Top Nhân Viên (Tổng Giờ Làm Việc)</h3>
            <div className="flex-1 min-h-[300px]">
              {charts.hoursBarData.length === 0 ? <p className="text-center text-slate-400 mt-32 font-medium">Chưa có dữ liệu chấm công</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={charts.hoursBarData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 13, fill: '#334155', fontWeight: 'bold'}} axisLine={false} tickLine={false} width={120} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => `${value} giờ`} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="hours" name="Giờ làm" fill={COLORS.info} radius={[0, 4, 4, 0]} barSize={28} />
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
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[150px]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <h3 className="text-3xl font-black text-slate-800 mb-2 truncate" title={value}>
        {value}
      </h3>
      
      <div className="mt-auto">
        {trend && (
          <p className={`text-[13px] font-bold flex items-center gap-1.5 ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span className={`px-2 py-0.5 rounded-md ${isGood ? 'bg-emerald-100' : 'bg-rose-100'}`}>
               {trend}
            </span>
            <span className="text-slate-400 font-medium">so với kỳ trước</span>
          </p>
        )}
        
        {subtitle && (
          <p className="text-[13px] text-slate-400 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}