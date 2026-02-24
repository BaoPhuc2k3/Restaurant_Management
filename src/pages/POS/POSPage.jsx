import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "../../components/POS/Sidebar";
import TableArea from "../../components/POS/TableArea";
import MenuList from "../../components/POS/MenuList";
import OrderPanel from "../../components/POS/OrderPanel";
import OpenTableModal from "../../components/POS/OpenTableModal";
import PaymentModal from "../../components/POS/PaymentModal";

import { getAllTables, updateTableStatus } from "../../API/Service/tablesService";
import { getAllMenus, getAllMenuItems } from "../../API/Service/menuServices";
import api from "../../API/axios";

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
    payment: false
  });

  const [tableToOpen, setTableToOpen] = useState(null);
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
    alert("Mở bàn thất bại");
  }

}, [tableToOpen]);

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
      alert("Bàn chưa mở");
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
    <div className="h-screen flex bg-gray-100">

      <div className="w-20 bg-teal-800 text-white">
        <Sidebar />
      </div>

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

    </div>
  );
}