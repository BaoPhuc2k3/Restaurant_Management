import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import TableArea from "../../components/POS/TableArea";
import MenuList from "../../components/POS/MenuList";
import OrderPanel from "../../components/POS/OrderPanel";
import OpenTableModal from "../../components/POS/OpenTableModal";
import PaymentModal from "../../components/POS/PaymentModal";

// 🔥 BƯỚC 1: IMPORT SIGNALR
import { HubConnectionBuilder } from "@microsoft/signalr";

import { getAllTables, updateTableStatus } from "../../API/Service/tablesService";
import { getAllMenus } from "../../API/Service/menuServices";
import { getAllMenuItems } from "../../API/Service/menuItemServices";
import api from "../../API/axios";
import { FiAlertTriangle, FiAlertCircle, FiXCircle } from "react-icons/fi";

/* ============================================= */
/* CONSTANTS                                     */
/* ============================================= */
const TABLE_STATUS = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
};

const createEmptyOrder = () => ({
  orderId: null, // Thêm orderId để lưu ID hóa đơn thật từ Database
  status: 1, 
  items: [],
  customerPhone: "",
  selectedVoucher: null
});

/* ============================================= */
/* COMPONENT                                     */
/* ============================================= */
export default function POSPage() {

  /* ======================= STATE ======================= */
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [activeCategoryId, setActiveCategoryId] = useState(0);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [orders, setOrders] = useState({});

  const [modalState, setModalState] = useState({
    openTable: false,
    payment: false,
    cancelConfirm: false,
    cancelItem: false // 🔥 Modal Hủy từng món
  });

  const [tableToOpen, setTableToOpen] = useState(null);
  const [toast, setToast] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);

  // State lưu thông tin món đang muốn hủy
  const [itemToCancel, setItemToCancel] = useState({ item: null, reason: "Khách đổi ý" });

  /* ======================= DERIVED ======================= */
  const selectedTable = useMemo(
    () => tables.find(t => t.id === selectedTableId),
    [tables, selectedTableId]
  );

  const selectedOrder = useMemo(() => {
    if (!selectedTableId) return createEmptyOrder();
    return orders[selectedTableId] || createEmptyOrder();
  }, [orders, selectedTableId]);

  const filteredMenuItems = useMemo(() => {
    if (activeCategoryId === 0) return menuItems;
    return menuItems.filter(i => i.menuId === activeCategoryId);
  }, [menuItems, activeCategoryId]);

  /* ======================= LOAD DATA ======================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tablesData, menusData, itemsData] = await Promise.all([
          getAllTables(), getAllMenus(), getAllMenuItems()
        ]);
        setTables(tablesData);
        setCategories(menusData);
        setMenuItems(itemsData);
      } catch (error) {
        console.error("System load error:", error);
      }
    };
    loadData();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  

  /* ======================= ORDER UPDATE ======================= */
  const updateOrder = useCallback((tableId, updater) => {
    setOrders(prev => {
      const current = prev[tableId] || createEmptyOrder();
      const updated = typeof updater === "function" ? updater(current) : { ...current, ...updater };
      return { ...prev, [tableId]: updated };
    });
  }, []);

  /* ======================= TABLE SELECT ======================= */
  // 🔥 BƯỚC 3: Lấy dữ liệu Order thật từ DB khi chọn Bàn
  const handleSelectTable = useCallback(async (table) => {
    if (table.status === TABLE_STATUS.AVAILABLE) {
      setTableToOpen(table);
      setModalState(prev => ({ ...prev, openTable: true }));
      return;
    }

    if (table.status === TABLE_STATUS.OCCUPIED) {
      setSelectedTableId(table.id);
      
      try {
        const res = await api.get(`/orders/table/${table.id}/active`);
        if (res.data) {
          updateOrder(table.id, {
            orderId: res.data.id,
            status: res.data.status, // Cập nhật trạng thái đơn hàng thật từ DB
            items: res.data.orderDetails.map(od => ({
              id: od.menuItemId, 
              orderDetailId: od.id,
              name: od.menuItem?.name || `Món ${od.menuItemId}`,
              price: od.price,
              quantity: od.quantity,
              itemStatus: od.itemStatus,
              isSent: true // Món lấy từ DB lên chắc chắn đã gửi bếp
            }))
          });
        }
      } catch (error) {
        console.log("Bàn chưa có order hoặc lỗi tải:", error);
      }
    }
  }, [updateOrder]);

  /* ======================= SIGNALR (KẾT NỐI BẾP) ======================= */
  // 1. Khai báo một Ref để theo dõi bàn đang chọn mà không làm đứt kết nối
  const selectedTableIdRef = useRef(selectedTableId);

  // 2. Cập nhật Ref mỗi khi State thay đổi
  useEffect(() => {
    selectedTableIdRef.current = selectedTableId;
  }, [selectedTableId]);

  // 3. Kết nối SignalR (CHỈ CHẠY ĐÚNG 1 LẦN)
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      // LƯU Ý: Vẫn phải đảm bảo port 7291 này khớp với Backend C# của bạn nhé
      .withUrl("https://localhost:7291/kitchenHub") 
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => {
        console.log("📡 POS đã kết nối bộ đàm với Bếp thành công!");
        
        connection.on("ItemStatusChanged", (data) => {
          const { tableId, orderDetailId, newStatus } = data;
    
          // Nếu POS đang mở đúng bàn mà Bếp vừa cập nhật
          if (selectedTableIdRef.current === tableId) {
            setOrders(prev => {
              const current = prev[tableId];
              if (!current) return prev;

              // Chỉ cập nhật trạng thái của duy nhất món đó trong State
              const updatedItems = current.items.map(item => 
                item.orderDetailId === orderDetailId 
                ? { ...item, itemStatus: newStatus } 
                : item
              );

              return { ...prev, [tableId]: { ...current, items: updatedItems } };
            });
          }
        });

        connection.on("TableClosed", (data) => {
            const { tableId } = data;
            
            // Tự động dọn bàn trên sơ đồ
            setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: TABLE_STATUS.AVAILABLE } : t));
            
            // Xóa rác dữ liệu của bàn đó
            setOrders(prev => {
                const newOrders = { ...prev };
                delete newOrders[tableId];
                return newOrders;
            });

            // Nếu thu ngân đang mở đúng bàn đó để xem, tự động đóng form luôn
            if (selectedTableIdRef.current === tableId) {
                setSelectedTableId(null);
            }
            
            showToast(`Bếp đã lên đủ món. Bàn ${tableId} tự động đóng!`);
        });
      })
      .catch(err => {
        // Bỏ qua lỗi AbortError ảo của React khi unmount nhanh
        if (err.name !== 'AbortError') {
          console.error("SignalR Lỗi kết nối: ", err);
        }
      });

    // Cleanup: Chỉ ngắt kết nối khi thu ngân tắt hẳn trang POS
    return () => {
      connection.stop();
    };
  }, [handleSelectTable]); // <--- QUAN TRỌNG: Mảng phụ thuộc không còn selectedTableId nữa!

  /* ======================= OPEN TABLE ======================= */
  const handleConfirmOpenTable = useCallback(async () => {
    if (!tableToOpen) return;
    try {
      await updateTableStatus(tableToOpen.id, TABLE_STATUS.OCCUPIED);
      setTables(prev => prev.map(t => t.id === tableToOpen.id ? { ...t, status: TABLE_STATUS.OCCUPIED } : t));
      setSelectedTableId(tableToOpen.id);
      setModalState(prev => ({ ...prev, openTable: false }));
    } catch (err) {
      showToast("Mở bàn thất bại!");
    }
  }, [tableToOpen]);

  /* ======================= CANCEL TABLE (HỦY CẢ BÀN) ======================= */
  const handleCancelOrder = useCallback(async () => {
    // 1. Kiểm tra xem có đang chọn bàn nào không
    if (!selectedTable) return;

    // 2. Xác nhận với người dùng (Tránh bấm nhầm)
    const confirmCancel = window.confirm(
        `Bạn có chắc chắn muốn HỦY TOÀN BỘ đơn hàng của ${selectedTable.tableName} không?`
    );
    if (!confirmCancel) return;

    try {
        // 3. Gọi API Delete đã viết ở Backend
        const res = await api.delete(`/orders/${selectedTable.id}/cancel`);

        setTables(prev => prev.map(t => 
            t.id === selectedTable.id 
                ? { ...t, status: TABLE_STATUS.AVAILABLE } 
                : t
        ));

        // 4. Nếu thành công, xóa trắng dữ liệu của bàn đó trong State của React
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[selectedTable.id]; // Xóa bỏ entry của bàn này
            return newOrders;
        });

        setSelectedTableId(null);
        // 5. Thông báo cho người dùng
        showToast("Đã hủy bàn và thông báo tới bếp!");

    } catch (err) {
        // 6. Xử lý lỗi (Ví dụ: Bếp đang nấu không cho hủy)
        const errorMsg = err.response?.data || "Không thể hủy bàn này.";
        // Nếu Backend trả về BadRequest kèm string, ta hiển thị nó
        alert(typeof errorMsg === 'string' ? errorMsg : "Bàn có món đang nấu, không thể hủy!");
        console.error("Cancel order error:", err);
    }
}, [selectedTable, setOrders, setSelectedTableId]);

  /* ======================= CART ACTIONS (MÓN ĂN) ======================= */
  // 🔥 BƯỚC 4: Ràng buộc logic isSent
  const handleAddItem = useCallback((item) => {
    if (!selectedTable || selectedTable.status !== TABLE_STATUS.OCCUPIED) {
      showToast("Vui lòng mở bàn trước khi thêm món!");
      return;
    }

    if (selectedOrder.status === 4 || selectedOrder.status === "Paid") {
      showToast("Bàn này đã thanh toán! Vui lòng mở bàn mới nếu khách muốn gọi thêm.");
      return;
    }
    updateOrder(selectedTable.id, current => {
      const existingUnsentIndex = current.items.findIndex(i => i.id === item.id && !i.isSent);
      let newItems = [...current.items];

      if (existingUnsentIndex >= 0) {
        newItems[existingUnsentIndex].quantity += 1;
      } else {
        newItems.push({ ...item, quantity: 1, isSent: false, itemStatus: 0 });
      }
      return { ...current, items: newItems };
    });
  }, [selectedTable, updateOrder]);

  const handleIncrease = useCallback((itemId) => {
    if (!selectedTable) return;
    updateOrder(selectedTable.id, current => ({
      ...current,
      items: current.items.map(i => (i.id === itemId && !i.isSent) ? { ...i, quantity: i.quantity + 1 } : i)
    }));
  }, [selectedTable, updateOrder]);

  const handleDecrease = useCallback((itemId) => {
    if (!selectedTable) return;
    updateOrder(selectedTable.id, current => ({
      ...current,
      items: current.items
        .map(i => (i.id === itemId && !i.isSent) ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0 || i.isSent)
    }));
  }, [selectedTable, updateOrder]);

  const handleRemoveItem = useCallback((itemId) => {
    if (!selectedTable) return;
    updateOrder(selectedTable.id, current => ({
      ...current,
      items: current.items.filter(i => !(i.id === itemId && !i.isSent))
    }));
  }, [selectedTable, updateOrder]);

  const handleUpdateOrderInfo = useCallback((info) => {
    if (!selectedTable) return;
    updateOrder(selectedTable.id, info);
  }, [selectedTable, updateOrder]);

  /* ======================= GỬI BẾP VÀ HỦY TỪNG MÓN ======================= */
  // 🔥 BƯỚC 5: Gửi món xuống bếp
  const handleSendToKitchen = useCallback(async () => {
    if (!selectedTable || !selectedOrder) return;
    const unsentItems = selectedOrder.items.filter(i => !i.isSent);
    
    try {
        let res;
        if (selectedOrder.orderId) {
            res = await api.post(`/orders/${selectedOrder.orderId}/add-items`, unsentItems.map(i => ({
                menuItemId: i.id, quantity: i.quantity, price: i.price
            })));
        } else {
            res = await api.post(`/orders`, {
                tableId: selectedTable.id,
                items: unsentItems.map(i => ({ menuItemId: i.id, quantity: i.quantity, price: i.price }))
            });
        }

        // 🔥 CẬP NHẬT CHUẨN PRODUCTION: 
        // Dùng dữ liệu Server trả về để ghi đè State tại chỗ
        if (res.data) {
            updateOrder(selectedTable.id, {
                orderId: res.data.id,
                items: res.data.orderDetails.map(od => ({
                    id: od.menuItemId,
                    orderDetailId: od.id,
                    name: od.menuItem?.name || "Món ăn",
                    price: od.price,
                    quantity: od.quantity,
                    itemStatus: od.itemStatus,
                    isSent: true // Chắc chắn là true vì đã vào DB
                }))
            });
        }
        
        showToast("Đã báo bếp thành công!");
    } catch (err) {
        console.error(err);
        showToast("Lỗi báo bếp!");
    }
}, [selectedTable, selectedOrder, updateOrder]);

  // 🔥 Xử lý yêu cầu Hủy 1 món ĐÃ GỬI BẾP
  const handleRequestCancelItem = useCallback((item) => {
    setItemToCancel({ item, reason: "Khách đổi ý" });
    setModalState(prev => ({ ...prev, cancelItem: true }));
  }, []);

  const confirmCancelItem = useCallback(async () => {
    try {
      await api.put(`/orders/cancel-item/${itemToCancel.item.orderDetailId}?reason=${encodeURIComponent(itemToCancel.reason)}`);
      showToast(`Đã hủy món ${itemToCancel.item.name}`);
      setModalState(prev => ({ ...prev, cancelItem: false }));
      handleSelectTable(selectedTable); // Refresh lại DB
    } catch (err) {
      const msg = err.response?.data || "Hủy thất bại. Vui lòng gọi Quản lý!";
      alert(msg);
    }
  }, [itemToCancel, selectedTable, handleSelectTable]);

  /* ======================= PAYMENT ======================= */
  const handleOpenPayment = useCallback((paymentData) => {
    if (!selectedTable || selectedOrder.items.length === 0) {
      alert("Không có hóa đơn để thanh toán"); return;
    }
    setPaymentSummary(paymentData); 
    setModalState(prev => ({ ...prev, payment: true }));
  }, [selectedTable, selectedOrder]);

  const handleFinalPayment = useCallback(async ({ paymentMethod }) => {
    if (!selectedTable || !paymentSummary) return;
    try {
      const totalDiscount = paymentSummary.summary.percentDiscount + paymentSummary.summary.voucherDiscount;
      const checkoutPayload = {
        tableId: selectedTable.id,
        phoneNumber: selectedOrder.customerPhone || null, 
        usedVoucherId: selectedOrder.selectedVoucher?.id || null,
        paymentMethod: paymentMethod, 
        totalAmount: paymentSummary.summary.subtotal,
        discountAmount: totalDiscount,
        finalAmount: paymentSummary.summary.finalAmount,
        // Chỉ thanh toán các món không bị hủy (ItemStatus != 4)
        items: selectedOrder.items.filter(i => i.itemStatus !== 4).map(i => ({
          menuItemId: i.id, quantity: i.quantity, price: i.price
        }))
      };

      const response = await api.post("/orders/checkout", checkoutPayload);
      const {earnedPoints, isClosed} = response.data;

      
      setPaymentSummary(null);
      setModalState(prev => ({ ...prev, payment: false }));
      if (isClosed) {
        await updateTableStatus(selectedTable.id, TABLE_STATUS.AVAILABLE);
        setOrders(prev => { const clone = { ...prev }; delete clone[selectedTable.id]; return clone; });
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: TABLE_STATUS.AVAILABLE } : t));
        setSelectedTableId(null);
        showToast("Thanh toán thành công và Đã đóng bàn!");
      }else {
        // TRƯỜNG HỢP 2: Bếp CHƯA xong -> Giữ bàn màu đỏ, chỉ cập nhật trạng thái đơn thành Paid (4)
        updateOrder(selectedTable.id, current => ({
            ...current,
            status: 4 // Để giao diện (OrderPanel) biết mà khóa nút Báo bếp / Thanh toán lại
        }));
        // KHÔNG xóa order, KHÔNG đổi status bàn
        showToast("Thanh toán thành công. Bàn đang chờ bếp phục vụ nốt!");
      }

      if (checkoutPayload.phoneNumber && earnedPoints > 0) {
        alert(`Thanh toán thành công!\nKhách hàng được cộng ${earnedPoints} điểm.`);
      } else { alert("Thanh toán thành công!"); }

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi kết nối tới hệ thống.";
      alert("Thanh toán thất bại: " + errorMsg);
    }
  }, [selectedTable, selectedOrder, paymentSummary]);

  /* ======================= RENDER ======================= */
  return (
    <div className="h-full flex bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[27%] bg-white p-3 border-r">
          <TableArea tables={tables} selectedTableId={selectedTableId} onSelectTable={handleSelectTable} />
        </div>

        <div className="w-[31%] bg-gray-50 p-3 border-r">
          <MenuList
            menuItems={filteredMenuItems}
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            onAddItem={handleAddItem}
          />
        </div>

        <div className="flex-1 bg-white p-4">
          <OrderPanel
            table={selectedTable}
            order={selectedOrder.items}
            orderStatus={selectedOrder.status}
            customerPhone={selectedOrder.customerPhone}
            selectedVoucher={selectedOrder.selectedVoucher}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemoveItem}
            onUpdateOrderInfo={handleUpdateOrderInfo}
            onPayment={(summary) => handleOpenPayment(summary)}
            onCancelOrder={handleCancelOrder}
            onSendToKitchen={handleSendToKitchen} 
            onRequestCancelItem={handleRequestCancelItem}
          />
        </div>
      </div>

      {/* MODALS CŨ CỦA BẠN */}
      {modalState.openTable && (
        <OpenTableModal table={tableToOpen} onConfirm={handleConfirmOpenTable} onCancel={() => setModalState(prev => ({ ...prev, openTable: false }))} />
      )}

      {modalState.payment && (
        <PaymentModal
          table={selectedTable} order={selectedOrder.items} summary={paymentSummary?.summary}          
          customerPhone={selectedOrder.customerPhone} cashGiven={paymentSummary?.cashGiven}       
          change={paymentSummary?.change}             
          onClose={() => setModalState(prev => ({ ...prev, payment: false }))}
          onConfirm={handleFinalPayment}
        />
      )}

      {/* MODAL XÁC NHẬN HỦY CẢ BÀN */}
      {modalState.cancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-100 overflow-hidden transform transition-all">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiAlertTriangle className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hủy đơn hàng?</h3>
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn hủy đơn và đóng <span className="font-bold text-gray-800">{selectedTable?.name || 'bàn này'}</span> không?<br/>
                Toàn bộ các món đã chọn sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={() => setModalState(prev => ({ ...prev, cancelConfirm: false }))} className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                Không, giữ lại
              </button>
              <button onClick={executeCancelOrder} className="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm">
                Có, hủy đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 MODAL MỚI: XÁC NHẬN HỦY 1 MÓN */}
      {modalState.cancelItem && itemToCancel.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-red-600 flex items-center gap-2"><FiXCircle className="text-xl" /> Yêu cầu hủy món</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700 text-sm mb-4">Bạn đang yêu cầu hủy món <span className="font-bold text-teal-700">{itemToCancel.item.name}</span> đã gửi xuống bếp.</p>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Lý do hủy:</label>
              <input 
                type="text" 
                value={itemToCancel.reason}
                onChange={e => setItemToCancel(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" 
                placeholder="VD: Khách đợi lâu, Khách đổi ý..."
              />
              {itemToCancel.item.itemStatus === 1 && (
                 <p className="text-xs text-red-500 mt-3 font-semibold bg-red-50 p-2 rounded">Cảnh báo: Bếp ĐANG NẤU món này. Việc hủy có thể cần Quản lý xác nhận!</p>
              )}
            </div>
            <div className="flex gap-3 px-5 py-4 bg-gray-50 border-t">
              <button onClick={() => setModalState(prev => ({ ...prev, cancelItem: false }))} className="flex-1 px-4 py-2 bg-white border rounded-lg text-sm text-gray-700 font-medium">Quay lại</button>
              <button onClick={confirmCancelItem} className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-sm text-white font-medium hover:bg-red-700">Xác nhận Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-70 animate-fade-in-down">
          <div className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
            <FiAlertCircle className="text-xl" />
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}