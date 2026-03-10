import React, { useState, useEffect } from "react";
import axios from "axios"; // 🟢 THÊM AXIOS
import { HubConnectionBuilder } from "@microsoft/signalr";
import { toast } from "react-toastify";

export default function OrderApprovalPage() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [connection, setConnection] = useState(null);

  // 1. 🟢 HÀM KIỂM TRA "NHÀ KHO" (DATABASE)
  const fetchPendingOrdersFromDB = async () => {
    try {
      // Thay URL này bằng đường dẫn API GET danh sách order chưa duyệt của bạn
      // Ví dụ: GET /api/orders/unconfirmed (như tôi đã gợi ý ở bước trước)
      const response = await axios.get("https://localhost:7291/api/orders/unconfirmed");
      
      // Map lại dữ liệu nếu API trả về OrderDetails thay vì items
      const formattedOrders = response.data.map(order => ({
        id: order.id,
        tableId: order.tableId,
        createdAt: order.createdAt || order.orderDate,
        items: order.orderDetails.map(detail => ({
          name: detail.menuItem?.name || "Món chưa rõ",
          quantity: detail.quantity
        }))
      }));

      setPendingOrders(formattedOrders);
    } catch (error) {
      console.error("Lỗi khi tải đơn từ Database:", error);
    }
  };

  useEffect(() => {
    // 2. 🟢 VỪA MỞ TRANG LÀ PHẢI VÀO NHÀ KHO KIỂM TRA NGAY
    fetchPendingOrdersFromDB();

    // 3. KẾT NỐI SIGNALR ĐỂ NGHE ĐƠN MỚI
    const conn = new HubConnectionBuilder()
      .withUrl(`https://localhost:7291/kitchenHub`)
      .withAutomaticReconnect()
      .build();

    conn.on("HasNewUnconfirmedOrder", (data) => {
      console.log("📩 Đã nhận đơn mới từ khách:", data);
      
      // Cách ngon nhất: Khi có báo hiệu đơn mới, ta gọi lại API để load từ DB lên cho chắc cốp
      fetchPendingOrdersFromDB();
      
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
      audio.play().catch(e => console.log("Chặn âm thanh tự động"));
    });

    conn.start()
      .then(() => {
        console.log("📡 SignalR Connected (Approval Page)");
        setConnection(conn);
      })
      .catch(err => console.error("❌ SignalR Connection Error: ", err));

    return () => {
      if (conn) {
        conn.off("HasNewUnconfirmedOrder"); 
        conn.stop();
      }
    };
  }, []);

  const handleApprove = async (order) => {
    try {
      // 4. 🟢 BẠN PHẢI GỌI API ĐỂ DUYỆT ĐƠN (ĐỔI STATUS TRONG DB)
      // Nếu chỉ dùng connection.invoke, DB vẫn sẽ giữ Status = 0 và F5 trang lại nó lại hiện ra
      await axios.post(`https://localhost:7291/api/orders/approve-order/${order.id}`); 
      
      // Duyệt xong thì xóa khỏi giao diện
      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      toast.success("Đã duyệt đơn và đẩy vào POS!");

    } catch (err) {
      console.error("Lỗi gửi xác nhận:", err);
      toast.error("Không thể duyệt đơn!");
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📥 Danh sách Order chờ duyệt ({pendingOrders.length})
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingOrders.map(order => (
          <div key={order.id} className="bg-white text-slate-800 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-orange-500 text-white p-3 font-bold flex justify-between">
              <span>BÀN {order.tableId}</span>
              <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="p-4">
              <ul className="space-y-2 mb-4">
                {order.items.map((it, idx) => (
                  <li key={idx} className="flex justify-between border-b pb-1">
                    <span>{it.name}</span>
                    <span className="font-bold text-orange-600">x{it.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gray-200 rounded font-bold hover:bg-gray-300">HỦY</button>
                <button 
                  onClick={() => handleApprove(order)}
                  className="flex-1 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-colors"
                >
                  XÁC NHẬN 
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}