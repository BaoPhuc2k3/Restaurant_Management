import React, { useEffect, useState, useRef, useMemo } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { toast } from "react-toastify";
import { FiClock, FiCheckCircle, FiPlayCircle, FiAlertCircle, FiList, FiX, FiChevronDown, FiChevronUp, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { 
  getPendingKitchenItems, 
  getKitchenHistoryToday, 
  updateKitchenItemStatus 
} from "../../API/Service/kitchenServices";

const removeVietnameseTones = (str = "") =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

export default function KitchenPage() {
  const navigate = useNavigate();

  const [pendingOrders, setPendingOrders] = useState([]);
  
  // 🔥 STATE MỚI CHO LỊCH SỬ
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  
  // STATE TÌM KIẾM & LỌC LỊCH SỬ
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTable, setFilterTable] = useState("ALL");
  

  const [expandedOrders, setExpandedOrders] = useState({});

  const connectionRef = useRef(null);

  // Hàm xử lý khi bấm vào 1 dòng Order trong lịch sử
  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId] // Đang mở thì đóng, đang đóng thì mở
    }));
  };

  // 1. Lấy danh sách món đang chờ từ API
  const fetchPendingItems = async () => {
    try {
      const data = await getPendingKitchenItems();
      const grouped = groupByTableAndBatch(data) || [];
      setPendingOrders(grouped);
    } catch (err) {
      console.error("Lỗi tải danh sách bếp:", err);
    }
  };

  //  1.5. Lấy danh sách Lịch sử hôm nay
  const fetchHistoryItems = async () => {
    try {
      const data = await getKitchenHistoryToday();
      setHistoryItems(data);
      setShowHistory(true); 
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
      toast.error("Không thể tải dữ liệu lịch sử!");
    }
  };

  const groupByTableAndBatch = (items) => {
    const groups = items.reduce((acc, item) => {
      const key = `${item.tableId}-${item.batchNumber}`;
      if (!acc[key]) {
        acc[key] = {
          tableId: item.tableId,
          batchNumber: item.batchNumber,
          // orderTime: item.orderTime,
          sendTime: item.sendTime + "Z",
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    } , {});
    return Object.values(groups).sort((a, b) => new Date(a.sendTime) - new Date(b.sendTime));
  };

  // 2. Kết nối SignalR để nhận thông báo thời gian thực
  useEffect(() => {
    fetchPendingItems();

    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7291/kitchenHub") 
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      console.log("Bếp đã sẵn sàng nhận lệnh!");
      
      // Nghe lệnh khi có món mới hoặc có món bị hủy
      connection.on("KitchenDataUpdated", fetchPendingItems);
      connection.on("ReceiveNewOrder", () => {
        new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3").play().catch(() => {});
        fetchPendingItems();
      });
    });

    connectionRef.current = connection;
    return () => connection.stop();
  }, []);

  // 3. Cập nhật trạng thái món
  const updateStatus = async (orderDetailId, nextStatus) => {
    try {
      await updateKitchenItemStatus(orderDetailId, nextStatus);
      fetchPendingItems(); // Load lại danh sách
      
      // Nếu đang mở bảng lịch sử, cập nhật luôn bảng lịch sử để nó real-time
      if (showHistory) fetchHistoryItems();
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái!");
    }
  };


  const processedHistory = useMemo(() => {
    let filtered = historyItems;
    
    // Lọc theo Bàn
    if (filterTable !== "ALL") {
      filtered = filtered.filter(item => item.tableName === filterTable);
    }
    
    // Lọc theo Tên món
    if (searchTerm.trim() !== "") {
        const normalizedSearchTerm = removeVietnameseTones(searchTerm.toLowerCase());
      filtered = filtered.filter(item => 
        removeVietnameseTones(item.menuName.toLowerCase()).includes(normalizedSearchTerm)
      );
    }

    // Gom nhóm theo OrderId (Mỗi OrderId là 1 lượt khách)
    const groups = filtered.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = {
          orderId: item.orderId,
          tableName: item.tableName,
          orderTime: item.orderTime, 
          items: []
        };
      }
      acc[item.orderId].items.push(item);
      return acc;
    }, {});

    // Sắp xếp các lượt khách: Mới nhất lên đầu
    return Object.values(groups).sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
  }, [historyItems, searchTerm, filterTable]);

  // Lấy danh sách các bàn duy nhất để làm Dropdown lọc
  const uniqueTables = [...new Set(historyItems.map(item => item.tableName))].sort();

  return (
    <div className="min-h-screen bg-slate-900 p-6 relative">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/portal')}
            className="flex flex-col items-center justify-center w-12 h-12 bg-slate-800 hover:bg-orange-500 text-slate-400 hover:text-white rounded-xl transition-all duration-300 border border-slate-700 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] group"
            title="Thoát về màn hình chọn phòng"
          >
            <FiHome className="text-xl group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1">Thoát</span>
          </button>

          {/* TIÊU ĐỀ TRANG BẾP */}
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="w-4 h-4 bg-orange-500 rounded-full animate-ping"></span>
            HỆ THỐNG ĐIỀU PHỐI BẾP (KDS)
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          
          
          {/* NÚT LỊCH SỬ */}
          <button 
            onClick={fetchHistoryItems}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg border border-slate-600"
          >
            <FiList className="text-lg" /> Lịch sử hôm nay
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pendingOrders.map((ticket, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border-t-8 border-orange-500">
            {/* Header của Ticket */}
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Bàn</span>
                <h2 className="text-3xl font-black text-slate-800">{ticket.tableId}</h2>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-orange-600 font-bold text-sm">
                  <FiClock /> {new Date(ticket.sendTime).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="text-[10px] text-slate-400">Lượt gọi: #{ticket.batchNumber}</div>
              </div>
            </div>

            {/* Danh sách món trong Ticket */}
            <div className="flex-1 p-4 space-y-3">
              {ticket.items.map((item) => (
                <div 
                  key={item.orderDetailId} 
                  className={`p-3 rounded-lg border flex justify-between items-center transition-all ${
                    item.itemStatus === 1 ? 'bg-orange-50 border-orange-200' : 
                    item.itemStatus === 2 ? 'bg-green-100 border-green-300 shadow-inner' : 
                    'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <div className={`font-bold text-lg ${item.itemStatus === 2 ? 'text-green-800' : 'text-slate-800'}`}>
                      <span className={item.itemStatus === 2 ? 'text-green-600' : 'text-orange-600'}>
                        x{item.quantity}
                      </span> {item.menuName}
                    </div>
                  </div>

                  {/* Nút điều khiển trạng thái (3 Nấc) */}
                  <div className="flex gap-2">
                    {item.itemStatus === 0 && (
                      <button onClick={() => updateStatus(item.orderDetailId, 1)} className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-full transition-colors" title="Bắt đầu nấu">
                        <FiPlayCircle size={28} />
                      </button>
                    )}
                    
                    {item.itemStatus === 1 && (
                      <button onClick={() => updateStatus(item.orderDetailId, 2)} className="text-orange-500 hover:text-orange-700 p-2 bg-orange-100 rounded-full transition-colors animate-pulse" title="Nấu xong">
                        <FiCheckCircle size={28} />
                      </button>
                    )}

                    {item.itemStatus === 2 && (
                      <button 
                        onClick={() => updateStatus(item.orderDetailId, 3)} 
                        className="text-white hover:bg-green-700 p-2 bg-green-600 rounded-full transition-colors flex items-center gap-1 px-4" 
                        title="Đã mang lên bàn"
                      >
                         <FiCheckCircle size={20} /> <span className="text-sm font-bold">Lên bàn</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-800 text-center">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Đang chế biến</span>
            </div>
          </div>
        ))}

        {pendingOrders.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">
            <FiCheckCircle className="mx-auto text-6xl mb-4 opacity-20" />
            <p className="text-xl">Bếp đang trống. Hãy nghỉ ngơi một chút!</p>
          </div>
        )}
      </div>

      
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl border border-slate-600 overflow-hidden">
            
            {/* Modal Header & Controls */}
            <div className="p-5 border-b border-slate-700 bg-slate-900">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FiList className="text-teal-400" /> LỊCH SỬ MÓN (HÔM NAY)
                </h2>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-red-400 bg-slate-800 p-2 rounded-full transition-colors">
                  <FiX size={24} />
                </button>
              </div>

              {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="🔍 Tìm tên món ăn..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                />
                <select 
                  value={filterTable}
                  onChange={(e) => setFilterTable(e.target.value)}
                  className="w-48 bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                >
                  <option value="ALL">-- Tất cả các Bàn --</option>
                  {uniqueTables.map(t => (
                    <option key={t} value={t}>Bàn {t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Body - Danh sách đã gom nhóm */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-800/50 space-y-3">
              {processedHistory.length === 0 ? (
                <div className="py-20 text-center text-slate-500">
                  Không tìm thấy dữ liệu phù hợp.
                </div>
              ) : (
                processedHistory.map((group) => {
                  // Kiểm tra xem đơn này có đang được bấm mở không
                  const isExpanded = expandedOrders[group.orderId];
                  // Tính tổng số lượng đĩa của đơn này
                  const totalPlates = group.items.reduce((sum, i) => sum + i.quantity, 0);

                  return (
                    <div key={group.orderId} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm transition-all">

                      <div
                        onClick={() => toggleOrder(group.orderId)}
                        className="bg-slate-700/40 hover:bg-slate-700/80 px-4 py-3 flex justify-between items-center cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="bg-orange-500/20 text-orange-400 font-bold px-3 py-1.5 rounded-md text-sm border border-orange-500/20">
                            BÀN {group.tableName}
                          </span>
                          <span className="text-slate-300 font-bold text-lg tracking-wide">
                            Đơn #{group.orderId}
                          </span>
                          <span className="text-slate-400 text-sm flex items-center gap-1.5 ml-2 border-l border-slate-600 pl-4">
                            <FiClock /> {new Date(group.orderTime).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <span className="text-teal-400 font-semibold bg-teal-400/10 px-3 py-1 rounded-full text-sm">
                            {group.items.length} món ({totalPlates} đĩa)
                          </span>
                          <div className="text-slate-400 bg-slate-800 p-1.5 rounded-full">
                            {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {/* NỘI DUNG CHI TIẾT (CHỈ HIỆN KHI BẤM MỞ) */}
                      {isExpanded && (
                        <div className="border-t border-slate-700 bg-slate-900/30">
                          <table className="w-full text-left text-slate-300">
                            <thead className="bg-slate-900/60">
                              <tr>
                                <th className="px-5 py-3 font-semibold text-slate-400 uppercase text-xs w-1/2">Tên món</th>
                                <th className="px-5 py-3 font-semibold text-slate-400 uppercase text-xs text-center w-1/4">Số lượng</th>
                                <th className="px-5 py-3 font-semibold text-slate-400 uppercase text-xs text-right w-1/4">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                              {group.items.map((item) => (
                                <tr key={item.orderDetailId} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="px-5 py-3 font-medium text-white">{item.menuName}</td>
                                  <td className="px-5 py-3 text-center font-bold text-xl text-teal-400">x{item.quantity}</td>
                                  <td className="px-5 py-3 text-right">
                                    {item.itemStatus === 2 ? (
                                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded text-xs font-bold inline-block">
                                        Chờ bưng món
                                      </span>
                                    ) : (
                                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-xs font-bold inline-block">
                                        Đã lên bàn ✓
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-slate-900 p-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-slate-500 text-sm">Hiển thị {processedHistory.length} lượt khách</span>
              <span className="text-slate-400 text-sm">
                Tổng số lượng đĩa (theo bộ lọc): <strong className="text-white text-xl ml-2">{processedHistory.reduce((acc, curr) => acc + curr.items.reduce((sum, i) => sum + i.quantity, 0), 0)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}