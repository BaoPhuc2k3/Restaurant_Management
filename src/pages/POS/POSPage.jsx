import { useState, useEffect, useMemo, useCallback } from "react";
import TableArea from "../../components/POS/TableArea";
import MenuList from "../../components/POS/MenuList";
import OrderPanel from "../../components/POS/OrderPanel";
import OpenTableModal from "../../components/POS/OpenTableModal";
import PaymentModal from "../../components/POS/PaymentModal";

import { getAllTables, updateTableStatus } from "../../API/Service/tablesService";
import { getAllMenus } from "../../API/Service/menuServices";
import { getAllMenuItems } from "../../API/Service/menuItemServices";
import api from "../../API/axios";
import { FiAlertTriangle, FiAlertCircle } from "react-icons/fi";

/* ============================================= */
/* CONSTANTS                                     */
/* ============================================= */

const TABLE_STATUS = {
  AVAILABLE: 1,
  OCCUPIED: 2,
  // RESERVED: 3
};

const createEmptyOrder = () => ({
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
    cancelConfirm: false
  });

  const [tableToOpen, setTableToOpen] = useState(null);
  const [toast, setToast] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);


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
          getAllTables(),
          getAllMenus(),
          getAllMenuItems()
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
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };
  /* ======================= TABLE SELECT ======================= */

  const handleSelectTable = useCallback((table) => {

    if (selectedTableId === table.id) {
      const hasOrder = orders[table.id]?.items?.length > 0;

      if (table.status === TABLE_STATUS.AVAILABLE) {
        setTableToOpen(table);
        setModalState(prev => ({ ...prev, openTable: true }));
        return;
      }

      if (table.status === TABLE_STATUS.OCCUPIED && hasOrder) {
        return;
      }
    }

    setSelectedTableId(table.id);

  }, [selectedTableId, orders]);

  /* ======================= OPEN TABLE ======================= */

  const handleConfirmOpenTable = useCallback(async () => {

  if (!tableToOpen) return;

  try {

    await updateTableStatus(tableToOpen.id, TABLE_STATUS.OCCUPIED);

    setTables(prev =>
      prev.map(t =>
        t.id === tableToOpen.id
          ? { ...t, status: TABLE_STATUS.OCCUPIED }
          : t
      )
    );

    setSelectedTableId(tableToOpen.id);

    setModalState(prev => ({ ...prev, openTable: false }));

  } catch (err) {
    showToast("Mở bàn thất bại!");
  }

}, [tableToOpen]);

/* ======================= CANCEL ORDER ======================= */

  /* ======================= CANCEL ORDER ======================= */

  // 1. Hàm này chỉ làm nhiệm vụ mở Hộp thoại ở giữa màn hình
  const handleCancelOrder = useCallback(() => {
    if (!selectedTable) return;
    setModalState(prev => ({ ...prev, cancelConfirm: true }));
  }, [selectedTable]);

  // 2. Hàm này là thao tác XÓA THẬT (Chỉ chạy khi người dùng bấm nút "Có, hủy đơn" trên hộp thoại)
  const executeCancelOrder = useCallback(async () => {
    if (!selectedTable) return;

    try {
      await updateTableStatus(selectedTable.id, TABLE_STATUS.AVAILABLE);

      setTables(prev =>
        prev.map(t =>
          t.id === selectedTable.id ? { ...t, status: TABLE_STATUS.AVAILABLE } : t
        )
      );

      setOrders(prev => {
        const clone = { ...prev };
        delete clone[selectedTable.id];
        return clone;
      });

      setSelectedTableId(null);
      // Đóng hộp thoại sau khi hủy xong
      setModalState(prev => ({ ...prev, cancelConfirm: false })); 

    } catch (err) {
      console.error("Lỗi hủy đơn:", err);
      alert("Hủy đơn thất bại. Vui lòng kiểm tra lại kết nối mạng.");
    }
  }, [selectedTable]);
  /* ======================= ORDER UPDATE ======================= */

  const updateOrder = useCallback((tableId, updater) => {
    setOrders(prev => {
      const current = prev[tableId] || createEmptyOrder();
      const updated = typeof updater === "function"
        ? updater(current)
        : { ...current, ...updater };

      return { ...prev, [tableId]: updated };
    });
  }, []);

  /* ======================= ADD ITEM ======================= */

  const handleAddItem = useCallback((item) => {

    if (!selectedTable) return;

    if (selectedTable.status !== TABLE_STATUS.OCCUPIED) {
      showToast("Vui lòng mở bàn trước khi thêm món!");
      return;
    }

    updateOrder(selectedTable.id, current => {

      const existing = current.items.find(i => i.id === item.id);

      let newItems;

      if (existing) {
        newItems = current.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newItems = [...current.items, { ...item, quantity: 1 }];
      }

      return { ...current, items: newItems };
    });

  }, [selectedTable, updateOrder]);

  /* ======================= ITEM MODIFY ======================= */

  const handleIncrease = useCallback((itemId) => {
    if (!selectedTable) return;

    updateOrder(selectedTable.id, current => ({
      ...current,
      items: current.items.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    }));

  }, [selectedTable, updateOrder]);

  const handleDecrease = useCallback((itemId) => {
    if (!selectedTable) return;

    updateOrder(selectedTable.id, current => ({
      ...current,
      items: current.items
        .map(i =>
          i.id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0)
    }));

  }, [selectedTable, updateOrder]);

  const handleRemoveItem = useCallback((itemId) => {
    if (!selectedTable) return;

    updateOrder(selectedTable.id, current => ({
      ...current,
      items: current.items.filter(i => i.id !== itemId)
    }));

  }, [selectedTable, updateOrder]);

  /* ======================= UPDATE ORDER INFO ======================= */

  const handleUpdateOrderInfo = useCallback((info) => {
    if (!selectedTable) return;
    updateOrder(selectedTable.id, info);
  }, [selectedTable, updateOrder]);

  /* ======================= PAYMENT ======================= */

  const handleOpenPayment = useCallback((paymentData) => {
  if (!selectedTable || selectedOrder.items.length === 0) {
    alert("Không có hóa đơn để thanh toán");
    return;
  }
  // paymentData ở đây chính là object { summary, cashGiven, change } từ OrderPanel gửi lên
  setPaymentSummary(paymentData); 
  setModalState(prev => ({ ...prev, payment: true }));
}, [selectedTable, selectedOrder]);

  // Thay thế hàm handleFinalPayment (khoảng dòng 240)
const handleFinalPayment = useCallback(async ({ paymentMethod }) => {
  if (!selectedTable || !paymentSummary) return;

  try {
    // 1. CHUẨN BỊ PAYLOAD KHỚP VỚI C# BACKEND
    // Tính tổng số tiền được giảm từ % và Voucher
    const totalDiscount = paymentSummary.summary.percentDiscount + paymentSummary.summary.voucherDiscount;

    const checkoutPayload = {
      tableId: selectedTable.id,
      phoneNumber: selectedOrder.customerPhone || null, // Tự động xử lý có hoặc không có SĐT
      usedVoucherId: selectedOrder.selectedVoucher?.id || null,
      paymentMethod: paymentMethod, 
      totalAmount: paymentSummary.summary.subtotal,
      discountAmount: totalDiscount,
      finalAmount: paymentSummary.summary.finalAmount,
      items: selectedOrder.items.map(i => ({
        menuItemId: i.id,
        quantity: i.quantity,
        price: i.price
      }))
    };

    // 2. GỌI API ĐẾN BACKEND
    // Import `api` từ axios của bạn lên đầu file nếu chưa có
    const response = await api.post("/orders/checkout", checkoutPayload);

    // 3. XÓA BÀN VÀ RESET GIAO DIỆN
    await updateTableStatus(selectedTable.id, TABLE_STATUS.AVAILABLE);

    setOrders(prev => {
      const clone = { ...prev };
      delete clone[selectedTable.id];
      return clone;
    });

    setTables(prev =>
      prev.map(t =>
        t.id === selectedTable.id ? { ...t, status: TABLE_STATUS.AVAILABLE } : t
      )
    );

    setSelectedTableId(null);
    setPaymentSummary(null);
    setModalState(prev => ({ ...prev, payment: false }));

    // 4. HIỂN THỊ THÔNG BÁO DỰA VÀO C# TRẢ VỀ
    const earnedPoints = response.data.earnedPoints;
    if (checkoutPayload.phoneNumber && earnedPoints > 0) {
      alert(`Thanh toán thành công!\nKhách hàng được cộng ${earnedPoints} điểm.`);
    } else {
      alert("Thanh toán thành công!");
    }

  } catch (err) {
    console.error("Lỗi thanh toán:", err);
    // Bắt lỗi từ Backend trả về (ví dụ: Không đủ điểm, voucher hết hạn)
    const errorMsg = err.response?.data?.message || "Lỗi kết nối tới hệ thống.";
    alert("Thanh toán thất bại: " + errorMsg);
  }
}, [selectedTable, selectedOrder, paymentSummary]);

  /* ======================= RENDER ======================= */

  return (
    <div className="h-full flex bg-gray-100">

      {/* <div className="w-20 bg-teal-800 text-white">
        <Sidebar />
      </div> */}

      <div className="flex flex-1 overflow-hidden">

        <div className="w-[27%] bg-white p-3 border-r">
          <TableArea
            tables={tables}
            selectedTableId={selectedTableId}
            onSelectTable={handleSelectTable}
          />
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
            customerPhone={selectedOrder.customerPhone}
            selectedVoucher={selectedOrder.selectedVoucher}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemoveItem}
            onUpdateOrderInfo={handleUpdateOrderInfo}
            onPayment={(summary) => handleOpenPayment(summary)}
            onCancelOrder={handleCancelOrder}
          />
        </div>

      </div>

      {modalState.openTable && (
        <OpenTableModal
          table={tableToOpen}
          onConfirm={handleConfirmOpenTable}
          onCancel={() =>
            setModalState(prev => ({ ...prev, openTable: false }))
          }
        />
      )}

      {modalState.payment && (
  <PaymentModal
    table={selectedTable}
    order={selectedOrder.items}
    summary={paymentSummary?.summary}           // ĐÃ SỬA
    customerPhone={selectedOrder.customerPhone}
    cashGiven={paymentSummary?.cashGiven}       // ĐÃ SỬA
    change={paymentSummary?.change}             // ĐÃ SỬA
    onClose={() => setModalState(prev => ({ ...prev, payment: false }))}
    onConfirm={handleFinalPayment}
  />
)};

{/* ================= MODAL XÁC NHẬN HỦY ĐƠN ================= */}
      {modalState.cancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 backdrop-blur-sm transition-opacity">
          
          <div className="bg-white rounded-xl shadow-2xl w-100 overflow-hidden transform transition-all">
            
            {/* Nội dung hộp thoại */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiAlertTriangle className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hủy đơn hàng?
              </h3>
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn hủy đơn và đóng <span className="font-bold text-gray-800">{selectedTable?.name || 'bàn này'}</span> không?<br/>
                Toàn bộ các món đã chọn sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            {/* Khu vực nút bấm */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setModalState(prev => ({ ...prev, cancelConfirm: false }))}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Không, giữ lại
              </button>
              <button
                onClick={executeCancelOrder}
                className="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
              >
                Có, hủy đơn
              </button>
            </div>

          </div>
          
        </div>
      )}

      {/* ================= TOAST NOTIFICATION ================= */}
      {toast && (
        <div className="fixed top-6 right-6 z-70 animate-fade-in-down">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
            <FiAlertCircle className="text-xl" />
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}
      
    
    </div>
  );
}