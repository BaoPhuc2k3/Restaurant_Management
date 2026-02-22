// import { createContext, useContext, useState, useCallback } from "react";

// const PosContext = createContext(null);

// // Dữ liệu mẫu - Khu vực và bàn
// const TABLE_AREAS = [
//   {
//     id: "vip",
//     name: "KHU VỰC VIP",
//     tables: [
//       { id: "vip1", name: "BÀN VIP 1", status: "occupied" },
//       { id: "vip2", name: "BÀN VIP 2", status: "empty" },
//       { id: "vip3", name: "BÀN VIP 3", status: "empty" },
//       { id: "vip4", name: "BÀN VIP 4", status: "empty" },
//       { id: "vip5", name: "BÀN VIP 5", status: "empty" },
//       { id: "vip6", name: "BÀN VIP 6", status: "empty" },
//     ],
//   },
//   {
//     id: "garden",
//     name: "SÂN VƯỜN",
//     tables: [
//       { id: "g1", name: "SÂN VƯỜN 1", status: "empty" },
//       { id: "g2", name: "SÂN VƯỜN 2", status: "empty" },
//       { id: "g3", name: "SÂN VƯỜN 3", status: "empty" },
//       { id: "g4", name: "SÂN VƯỜN 4", status: "empty" },
//       { id: "g5", name: "SÂN VƯỜN 5", status: "empty" },
//       { id: "g6", name: "SÂN VƯỜN 6", status: "empty" },
//     ],
//   },
//   {
//     id: "ground",
//     name: "TẦNG TRỆT",
//     tables: Array.from({ length: 15 }, (_, i) => ({
//       id: `gf${i + 1}`,
//       name: `TẦNG TRỆT ${i + 1}`,
//       status: "empty",
//     })),
//   },
// ];

// // Danh mục và món ăn
// const MENU_CATEGORIES = [
//   { id: "all", name: "Tất cả" },
//   { id: "coffee", name: "Cà phê" },
//   { id: "tea", name: "Trà sữa" },
//   { id: "smoothie", name: "Sinh tố" },
// ];

// const MENU_ITEMS = [
//   { id: 1, name: "Cà phê đen", price: 15000, category: "coffee" },
//   { id: 2, name: "Cà phê sữa", price: 20000, category: "coffee" },
//   { id: 3, name: "Bạc xỉu", price: 25000, category: "coffee" },
//   { id: 4, name: "Cà phê cốt dừa", price: 25000, category: "coffee" },
//   { id: 5, name: "Cà phê trứng", price: 30000, category: "coffee" },
//   { id: 6, name: "Cold Brew", price: 35000, category: "coffee" },
//   { id: 7, name: "Trà sữa truyền thống", price: 25000, category: "tea" },
//   { id: 8, name: "Trà sữa matcha", price: 30000, category: "tea" },
//   { id: 9, name: "Trà sữa khoai môn", price: 28000, category: "tea" },
//   { id: 10, name: "Trà sữa nướng", price: 28000, category: "tea" },
//   { id: 11, name: "Sữa tươi trân châu đường đen", price: 30000, category: "tea" },
//   { id: 12, name: "Sinh tố bơ", price: 35000, category: "smoothie" },
//   { id: 13, name: "Sinh tố dâu", price: 30000, category: "smoothie" },
//   { id: 14, name: "Sinh tố xoài", price: 28000, category: "smoothie" },
// ];

// export function PosProvider({ children }) {
//   const [selectedTable, setSelectedTable] = useState(null);
//   const [tableFilter, setTableFilter] = useState("all"); // all, occupied, empty
//   const [orders, setOrders] = useState({
//     vip1: [
//       { id: 1, menuId: 2, name: "Cà phê sữa", price: 20000, quantity: 1 },
//     ],
//   });
//   const [discountPercent, setDiscountPercent] = useState(0);
//   const [surcharge, setSurcharge] = useState(0);
//   const [customerPay, setCustomerPay] = useState(0);

//   const getOrderForTable = useCallback(
//     (tableId) => orders[tableId] || [],
//     [orders]
//   );

//   const addItemToOrder = useCallback((tableId, item) => {
//     if (!tableId) return;
//     setOrders((prev) => {
//       const tableOrder = prev[tableId] || [];
//       const existing = tableOrder.find((o) => o.menuId === item.id);
//       if (existing) {
//         return {
//           ...prev,
//           [tableId]: tableOrder.map((o) =>
//             o.menuId === item.id ? { ...o, quantity: o.quantity + 1 } : o
//           ),
//         };
//       }
//       return {
//         ...prev,
//         [tableId]: [
//           ...tableOrder,
//           {
//             id: Date.now(),
//             menuId: item.id,
//             name: item.name,
//             price: item.price,
//             quantity: 1,
//           },
//         ],
//       };
//     });
//   }, []);

//   const updateQuantity = useCallback((tableId, itemId, delta) => {
//     setOrders((prev) => {
//       const tableOrder = prev[tableId] || [];
//       const updated = tableOrder
//         .map((o) => {
//           if (o.id === itemId) {
//             const newQty = o.quantity + delta;
//             return newQty <= 0 ? null : { ...o, quantity: newQty };
//           }
//           return o;
//         })
//         .filter(Boolean);
//       if (updated.length === 0) {
//         const { [tableId]: _, ...rest } = prev;
//         return rest;
//       }
//       return { ...prev, [tableId]: updated };
//     });
//   }, []);

//   const removeItem = useCallback((tableId, itemId) => {
//     setOrders((prev) => {
//       const tableOrder = (prev[tableId] || []).filter((o) => o.id !== itemId);
//       if (tableOrder.length === 0) {
//         const { [tableId]: _, ...rest } = prev;
//         return rest;
//       }
//       return { ...prev, [tableId]: tableOrder };
//     });
//   }, []);

//   const cancelOrder = useCallback((tableId) => {
//     setOrders((prev) => {
//       const { [tableId]: _, ...rest } = prev;
//       return rest;
//     });
//     setSelectedTable(null);
//     setDiscountPercent(0);
//     setSurcharge(0);
//     setCustomerPay(0);
//   }, []);

//   const formatPrice = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

//   const getOrderTotal = useCallback(
//     (tableId) => {
//       const items = getOrderForTable(tableId);
//       const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
//       const discount = (subtotal * discountPercent) / 100;
//       return Math.max(0, subtotal - discount + surcharge);
//     },
//     [getOrderForTable, discountPercent, surcharge]
//   );

//   const getOrderSubtotal = useCallback(
//     (tableId) => {
//       const items = getOrderForTable(tableId);
//       return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
//     },
//     [getOrderForTable]
//   );

//   const value = {
//     TABLE_AREAS,
//     MENU_CATEGORIES,
//     MENU_ITEMS,
//     selectedTable,
//     setSelectedTable,
//     tableFilter,
//     setTableFilter,
//     orders,
//     getOrderForTable,
//     addItemToOrder,
//     updateQuantity,
//     removeItem,
//     cancelOrder,
//     discountPercent,
//     setDiscountPercent,
//     surcharge,
//     setSurcharge,
//     customerPay,
//     setCustomerPay,
//     formatPrice,
//     getOrderTotal,
//     getOrderSubtotal,
//   };

//   return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
// }

// export function usePos() {
//   const ctx = useContext(PosContext);
//   if (!ctx) throw new Error("usePos must be used within PosProvider");
//   return ctx;
// }
