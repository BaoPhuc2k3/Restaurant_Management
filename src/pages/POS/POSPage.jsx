import { useState, useEffect } from "react";
import Sidebar from "../../components/POS/Sidebar";
import TableArea from "../../components/POS/TableArea";
import MenuList from "../../components/POS/MenuList";
import OrderPanel from "../../components/POS/OrderPanel";
import OpenTableModal from "../../components/POS/OpenTableModal";
import PaymentModal from "../../components/POS/PaymentModal";
// import { tables as initialTables, menuItems } from "../../data/mockData";
import { getAllTables, updateTableStatus } from "../../API/Service/tablesService";
import { getAllMenus, getAllMenuItems } from "../../API/Service/menuServices";

export default function POSPage() {

  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]); // State cho Danh mục (Menus)
  const [allMenuItems, setAllMenuItems] = useState([]); // Toàn bộ món ăn từ DB
  const [filteredItems, setFilteredItems] = useState([]); // Món ăn hiển thị sau khi lọc
  const [activeCategoryId, setActiveCategoryId] = useState(0); // Tab đang chọn (0 = Tất cả)

  
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [orders, setOrders] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [tableToOpen, setTableToOpen] = useState(null);

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedOrder = selectedTable
    ? orders[selectedTable.id] || []
    : [];


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
      setAllMenuItems(itemsData);
      setFilteredItems(itemsData); // Mặc định hiện tất cả
    } catch (error) {
      console.error("Lỗi tải dữ liệu hệ thống:", error);
    }
  };
  loadData();
}, []);

  console.log(tables);
  ;
  // ===============================
  // SELECT TABLE
  // ===============================
  const handleSelectTable = (table) => {

    // Nếu click lần 2 cùng 1 bàn
    if (selectedTableId === table.id) {

      const hasOrder =
        orders[table.id] && orders[table.id].length > 0;

      // Nếu bàn trống → hỏi mở
      if (table.status === 1) {
        setTableToOpen(table);
        setIsModalOpen(true);
        return;
      }

      // Nếu bàn đã mở và có hóa đơn → không cho mở lại
      if (table.status === 3 && hasOrder) {
        return;
      }
    }

    setSelectedTableId(table.id);
  };


  const handleSelectCategory = (categoryId) => {
  setActiveCategoryId(categoryId);
  if (categoryId === 0) {
    setFilteredItems(allMenuItems);
  } else {
    setFilteredItems(allMenuItems.filter(item => item.menuId === categoryId));
  }
};

// ===============================
// CONFIRM OPEN TABLE
// ===============================
const handleConfirmOpenTable = () => {

  const hasOrder =
    orders[tableToOpen.id] &&
    orders[tableToOpen.id].length > 0;

  // Nếu đã có hóa đơn → không mở lại
    if (hasOrder) {
      setIsModalOpen(false);
      return;
    }

    setTables(prev =>
      prev.map(t =>
        t.id === tableToOpen.id
          ? { ...t, status: "occupied" }
          : t
      )
    );

    setIsModalOpen(false);
  };

  // ===============================
  // ADD ITEM
  // ===============================
  const handleAddItem = (item) => {
  if (!selectedTable || selectedTable.status === 1) return alert("Bàn chưa mở");

  setOrders(prev => {
    // Lấy dữ liệu cũ của bàn này ra, nếu chưa có thì tạo mới theo cấu trúc chuẩn
    const currentData = prev[selectedTable.id] || { items: [], customerPhone: "", selectedVoucher: null };
    const tableItems = currentData.items;

    const existing = tableItems.find(i => i.id === item.id);
    let updatedItems;

    if (existing) {
      updatedItems = tableItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      updatedItems = [...tableItems, { ...item, quantity: 1 }];
    }

    return {
      ...prev,
      [selectedTable.id]: { ...currentData, items: updatedItems } // Cập nhật lại thuộc tính items
    };
  });
};

  const handleIncrease = (itemId) => {
  setOrders(prev => {
    const currentData = prev[selectedTable.id];
    if (!currentData) return prev;

    const updatedItems = currentData.items.map(item =>
      item.id === itemId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    return {
      ...prev,
      [selectedTable.id]: { ...currentData, items: updatedItems }
    };
  });
};

  const handleDecrease = (itemId) => {
  setOrders(prev => {
    const currentData = prev[selectedTable.id];
    if (!currentData) return prev;

    const updatedItems = currentData.items
      .map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0); // Xóa món nếu số lượng về 0

    return {
      ...prev,
      [selectedTable.id]: { ...currentData, items: updatedItems }
    };
  });
};

  const handleRemoveItem = (itemId) => {
  setOrders(prev => {
    const currentData = prev[selectedTable.id];
    if (!currentData) return prev;

    return {
      ...prev,
      [selectedTable.id]: { 
        ...currentData, 
        items: currentData.items.filter(item => item.id !== itemId) 
      }
    };
  });
};

  // Trong file POSPage.js

const handleUpdateOrderInfo = (tableId, info) => {
  setOrders(prev => {
    // Lấy order hiện tại của bàn này, nếu chưa có thì tạo object mặc định
    const currentData = prev[tableId] || { items: [], customerPhone: "", selectedVoucher: null };
    
    return {
      ...prev,
      [tableId]: { ...currentData, ...info } // Ghi đè SĐT hoặc Voucher mới vào
    };
  });
};

  // ===============================
  // PAYMENT
  // ===============================
  // const handlePayment = () => {

  //   if (!selectedTable) return;

  //   const hasOrder =
  //     orders[selectedTable.id] &&
  //     orders[selectedTable.id].length > 0;

  //   if (!hasOrder) {
  //     alert("Không có hóa đơn để thanh toán");
  //     return;
  //   }

  //   // Xóa order
  //   setOrders(prev => {
  //     const updated = { ...prev };
  //     delete updated[selectedTable.id];
  //     return updated;
  //   });

  //   // Trả bàn về trống
  //   setTables(prev =>
  //     prev.map(t =>
  //       t.id === selectedTable.id
  //         ? { ...t, status: "available" }
  //         : t
  //     )
  //   );

  //   // Bỏ chọn bàn
  //   setSelectedTableId(null);
  // };

  const handleOpenPaymentModal = () => {
    if (!selectedTable || selectedOrder.length === 0) {
      alert("Không có gì để thanh toán!");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleFinalPayment = async (paymentData) => {
    try {
      // 1. Gọi API lưu hóa đơn (Ví dụ)
      const response = await fetch("https://localhost:72917291/api/order/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutPayload)
    });

      if (response.ok) {
        // 2. Cập nhật trạng thái bàn về Trống (1)
      await updateTableStatus(selectedTable.id, 1);

      // 3. Xóa order local
      setOrders(prev => {
        const newOrders = { ...prev };
        delete newOrders[selectedTable.id];
        return newOrders;
      });

      // 4. Cập nhật giao diện bàn
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 1 } : t));
      
      setIsPaymentModalOpen(false);
      setSelectedTableId(null);
      alert("Thanh toán hoàn tất!");
      }
    } catch (error) {
      alert("Lỗi kết nối server khi xử lý thanh toán");
    }
  };
  return (
    <div className="h-screen flex bg-gray-100">

      <div className="w-20 bg-teal-800 text-white">
        <Sidebar />
      </div>

      <div className="flex flex-1">

        <div className="w-1/3 bg-white p-4">
          <TableArea
            tables={tables}
            selectedTableId={selectedTableId}
            onSelectTable={handleSelectTable}
          />
        </div>

        <div className="w-1/3 bg-gray-50 p-4 border-l border-r">
          <MenuList
            menuItems={filteredItems}
            categories={categories}
            onAddItem={handleAddItem}
          />
        </div>

        <div className="w-1/3 bg-white p-4">
          <OrderPanel
            table={selectedTable}
            order={orders[selectedTableId]?.items || []}
            customerPhone={orders[selectedTableId]?.customerPhone || ""}
            selectedVoucher={orders[selectedTableId]?.selectedVoucher || null}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemoveItem}
            onUpdateOrderInfo={(info) =>
              handleUpdateOrderInfo(selectedTableId, info)
            }
            onPayment={handleOpenPaymentModal}
          />

        </div>

      </div>

      {isModalOpen && (
        <OpenTableModal
          table={tableToOpen}
          onConfirm={handleConfirmOpenTable}
          onCancel={() => setIsModalOpen(false)}
        />
      )}

      {/* Hiển thị Modal khi cần */}
      {isPaymentModalOpen && (
        <PaymentModal 
          table={selectedTable}
          order={orders[selectedTableId]?.items || []}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleFinalPayment}
        />
      )}

    </div>
  );
}
