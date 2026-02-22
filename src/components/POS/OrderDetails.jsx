// import { FiSearch, FiMinus, FiPlus, FiTrash2, FiX } from "react-icons/fi";
// import { usePos } from "../../contexts/posContext";

// function getTableName(tableId) {
//   const map = {
//     vip1: "BÀN VIP 1",
//     vip2: "BÀN VIP 2",
//     vip3: "BÀN VIP 3",
//     vip4: "BÀN VIP 4",
//     vip5: "BÀN VIP 5",
//     vip6: "BÀN VIP 6",
//     g1: "SÂN VƯỜN 1",
//     g2: "SÂN VƯỜN 2",
//     g3: "SÂN VƯỜN 3",
//     g4: "SÂN VƯỜN 4",
//     g5: "SÂN VƯỜN 5",
//     g6: "SÂN VƯỜN 6",
//   };
//   if (tableId?.startsWith("gf")) {
//     const n = tableId.replace("gf", "");
//     return `TẦNG TRỆT ${n}`;
//   }
//   return map[tableId] || tableId;
// }

// export default function OrderDetails() {
//   const {
//     selectedTable,
//     getOrderForTable,
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
//   } = usePos();

//   const items = selectedTable ? getOrderForTable(selectedTable) : [];
//   const subtotal = selectedTable ? getOrderSubtotal(selectedTable) : 0;
//   const total = selectedTable ? getOrderTotal(selectedTable) : 0;
//   const change = Math.max(0, customerPay - total);

//   const quickAmounts = [50000, 100000, 200000, 500000];

//   const now = new Date();
//   const dateStr = now.toLocaleDateString("vi-VN");
//   const timeStr = now.toLocaleTimeString("vi-VN", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   if (!selectedTable) {
//     return (
//       <div className="w-95 shrink-0 border-l bg-gray-50 flex items-center justify-center text-gray-500">
//         Chọn bàn để xem chi tiết đơn
//       </div>
//     );
//   }

//   return (
//     <div className="w-95 shrink-0 border-l bg-white flex flex-col h-full">
//       <div className="p-4 border-b">
//         <div className="flex justify-between items-start">
//           <div>
//             <h3 className="text-sm text-gray-600">Chi tiết đặt bàn</h3>
//             <h2 className="font-bold text-lg">{getTableName(selectedTable)}</h2>
//           </div>
//           <div className="text-right text-xs text-gray-500">
//             <div>{dateStr}</div>
//             <div>{timeStr}</div>
//           </div>
//         </div>
//         <div className="relative mt-3">
//           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Nhập SĐT để tìm/thêm khách hàng."
//             className="w-full pl-9 pr-3 py-2 border rounded text-sm"
//           />
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b">
//               <th className="text-left py-2 w-8">#</th>
//               <th className="text-left py-2">Món</th>
//               <th className="text-center py-2 w-20">SL</th>
//               <th className="text-right py-2 w-16">ĐG</th>
//               <th className="text-right py-2 w-16">TT</th>
//               <th className="w-8"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, idx) => (
//               <tr key={item.id} className="border-b">
//                 <td className="py-2">{idx + 1}</td>
//                 <td className="py-2">{item.name}</td>
//                 <td className="py-2">
//                   <div className="flex items-center justify-center gap-1">
//                     <button
//                       onClick={() => updateQuantity(selectedTable, item.id, -1)}
//                       className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200"
//                     >
//                       <FiMinus className="w-3 h-3" />
//                     </button>
//                     <span className="min-w-6 text-center">{item.quantity}</span>
//                     <button
//                       onClick={() => updateQuantity(selectedTable, item.id, 1)}
//                       className="w-6 h-6 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200"
//                     >
//                       <FiPlus className="w-3 h-3" />
//                     </button>
//                   </div>
//                 </td>
//                 <td className="py-2 text-right">{formatPrice(item.price)}</td>
//                 <td className="py-2 text-right">
//                   {formatPrice(item.price * item.quantity)}
//                 </td>
//                 <td className="py-2">
//                   <button
//                     onClick={() => removeItem(selectedTable, item.id)}
//                     className="text-red-500 hover:text-red-700 p-1"
//                   >
//                     <FiTrash2 className="w-4 h-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="mt-4 space-y-2">
//           <div className="flex items-center gap-2">
//             <span className="text-sm w-20">Giảm %:</span>
//             <input
//               type="number"
//               min="0"
//               max="100"
//               value={discountPercent}
//               onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
//               className="flex-1 border rounded px-2 py-1 text-sm"
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-sm w-20">Phụ thu:</span>
//             <input
//               type="number"
//               min="0"
//               value={surcharge}
//               onChange={(e) => setSurcharge(Number(e.target.value) || 0)}
//               className="flex-1 border rounded px-2 py-1 text-sm"
//             />
//           </div>
//         </div>

//         <div className="mt-4 space-y-1">
//           <div className="flex justify-between text-sm">
//             <span>Tổng tiền hàng:</span>
//             <span>{formatPrice(subtotal)}</span>
//           </div>
//           <div className="flex justify-between font-bold text-red-600">
//             <span>Khách phải trả:</span>
//             <span>{formatPrice(total)}</span>
//           </div>
//         </div>

//         <div className="mt-4 space-y-2">
//           <div className="flex items-center gap-2">
//             <span className="text-sm w-24">Khách đưa:</span>
//             <input
//               type="number"
//               min="0"
//               value={customerPay || ""}
//               onChange={(e) => setCustomerPay(Number(e.target.value) || 0)}
//               placeholder="0"
//               className="flex-1 border rounded px-2 py-1 text-sm"
//             />
//             <button
//               onClick={() => setCustomerPay(0)}
//               className="p-1 text-red-500 hover:text-red-700"
//             >
//               <FiX className="w-5 h-5" />
//             </button>
//           </div>
//           <div className="flex justify-between text-sm">
//             <span>Tiền thừa:</span>
//             <span>{formatPrice(change)}</span>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {quickAmounts.map((amt) => (
//               <button
//                 key={amt}
//                 onClick={() => setCustomerPay((p) => p + amt)}
//                 className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100"
//               >
//                 +{amt / 1000}k
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="p-4 border-t flex gap-2">
//         <button
//           onClick={() => cancelOrder(selectedTable)}
//           className="flex-1 py-3 bg-red-500 text-white font-semibold rounded hover:bg-red-600"
//         >
//           HỦY ĐƠN
//         </button>
//         <button className="flex-1 py-3 bg-orange-500 text-white font-semibold rounded hover:bg-orange-600 flex items-center justify-center gap-2">
//           CHUYỂN/GỘP
//         </button>
//         <button className="flex-1 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600 flex items-center justify-center gap-2">
//           THANH TOÁN
//         </button>
//       </div>
//     </div>
//   );
// }
