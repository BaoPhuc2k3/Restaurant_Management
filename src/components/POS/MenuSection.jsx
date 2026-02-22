// import { useState, useMemo } from "react";
// import { FiSearch, FiPlus } from "react-icons/fi";
// import { usePos } from "../../contexts/posContext";

// export default function MenuSection() {
//   const {
//     MENU_CATEGORIES,
//     MENU_ITEMS,
//     selectedTable,
//     addItemToOrder,
//     formatPrice,
//   } = usePos();
//   const [category, setCategory] = useState("all");
//   const [search, setSearch] = useState("");

//   const filteredItems = useMemo(() => {
//     let items = MENU_ITEMS;
//     if (category !== "all") {
//       items = items.filter((i) => i.category === category);
//     }
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       items = items.filter((i) => i.name.toLowerCase().includes(q));
//     }
//     return items;
//   }, [category, search]);

//   const handleAddItem = (item) => {
//     if (!selectedTable) {
//       alert("Vui lòng chọn bàn trước khi thêm món");
//       return;
//     }
//     addItemToOrder(selectedTable, item);
//   };

//   return (
//     <div className="flex flex-col h-full min-w-0">
//       <div className="p-3 border-b space-y-2 shrink-0">
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium whitespace-nowrap">Danh mục:</span>
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="flex-1 border rounded px-3 py-2 text-sm"
//           >
//             {MENU_CATEGORIES.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.name}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="relative">
//           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Tìm kiếm món..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-9 pr-3 py-2 border rounded text-sm"
//           />
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 sticky top-0">
//             <tr>
//               <th className="text-left py-2 px-3 w-12">STT</th>
//               <th className="text-left py-2 px-3">Tên món</th>
//               <th className="text-right py-2 px-3 w-24">Giá</th>
//               <th className="w-16"></th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredItems.map((item, idx) => (
//               <tr
//                 key={item.id}
//                 className="border-b hover:bg-gray-50 transition-colors"
//               >
//                 <td className="py-2 px-3">{idx + 1}</td>
//                 <td className="py-2 px-3">{item.name}</td>
//                 <td className="py-2 px-3 text-right">{formatPrice(item.price)}</td>
//                 <td className="py-2 px-2">
//                   <button
//                     onClick={() => handleAddItem(item)}
//                     className="w-8 h-8 flex items-center justify-center rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
//                   >
//                     <FiPlus className="w-4 h-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
