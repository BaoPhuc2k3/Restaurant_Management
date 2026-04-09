import React, { useState, useEffect } from "react";
import axios from "axios"; 
import { HubConnectionBuilder } from "@microsoft/signalr";
import { toast } from "react-toastify";

export default function OrderApprovalPage() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [connection, setConnection] = useState(null);

  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("Hết món / Đã thanh toán");


  const fetchPendingOrdersFromDB = async () => {
    try {

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

    fetchPendingOrdersFromDB();

    // 3. KẾT NỐI SIGNALR ĐỂ NGHE ĐƠN MỚI
    const conn = new HubConnectionBuilder()
      .withUrl(`https://localhost:7291/kitchenHub`)
      .withAutomaticReconnect()
      .build();

    conn.on("HasNewUnconfirmedOrder", (data) => {
      console.log("Đã nhận đơn mới từ khách:", data);
      
      fetchPendingOrdersFromDB();
      
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
      audio.play().catch(e => console.log("Chặn âm thanh tự động"));
    });

    conn.start()
      .then(() => {
        console.log("SignalR Connected (Approval Page)");
        setConnection(conn);
      })
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      if (conn) {
        conn.off("HasNewUnconfirmedOrder"); 
        conn.stop();
      }
    };
  }, []);

  const handleApprove = async (order) => {
    try {

      await axios.post(`https://localhost:7291/api/orders/approve-order/${order.id}`); 
      

      setPendingOrders(prev => prev.filter(o => o.id !== order.id));
      toast.success("Đã duyệt đơn và đẩy vào POS!");

    } catch (err) {
      const errorMsg = err.response?.data || "Không thể duyệt đơn!";
      toast.error(typeof errorMsg === 'string' ? errorMsg : "Bàn này đã thanh toán hóa đơn trước đó. Vui lòng chờ hoàn thành đơn để gọi thêm!");
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingOrder) return;
    try {
      await axios.post(`https://localhost:7291/api/orders/reject-order/${rejectingOrder.id}`, {
        reason: rejectReason
      });
      setPendingOrders(prev => prev.filter(o => o.id !== rejectingOrder.id));
      toast.info("Đã từ chối đơn và báo cho khách!");
      setRejectingOrder(null);
    } catch (err) {
      toast.error("Lỗi khi từ chối đơn.");
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Danh sách Order chờ duyệt ({pendingOrders.length})
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingOrders.map(order => (
          <div key={order.id} className="bg-white text-slate-800 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-orange-500 text-white p-3 font-bold flex justify-between">
              <span>BÀN {order.tableId}</span>
              <span>{new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="p-4">
              <ul className="space-y-2 mb-4">
                {order.items.map((it, idx) => (
                  <li key={idx} className="flex justify-between pb-1">
                    <span>{it.name}</span>
                    <span className="font-bold text-orange-600">x{it.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button 
                  onClick={() => setRejectingOrder(order)}
                  className="flex-1 py-2 bg-gray-200 rounded font-bold hover:bg-gray-300"
                >
                  HỦY
                </button>
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

      {/* MODAL NHẬP LÝ DO HỦY */}
      {rejectingOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white text-slate-800 p-6 rounded-lg w-96 shadow-2xl">
            <h3 className="font-bold text-xl mb-4 text-red-600">Từ chối đơn Bàn {rejectingOrder.tableId}</h3>
            <p className="text-sm text-gray-600 mb-2">Vui lòng nhập lý do để báo cho khách hàng:</p>
            <input 
              type="text" 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full border rounded p-2 mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectingOrder(null)} className="px-4 py-2 bg-gray-200 rounded font-bold">Quay lại</button>
              <button onClick={handleRejectConfirm} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Từ chối đơn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}