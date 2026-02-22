// import { useState } from "react";
// import { FiCoffee } from "react-icons/fi";
// import { usePos } from "../../contexts/posContext";

// export default function TableSection() {
//   const {
//     TABLE_AREAS,
//     selectedTable,
//     setSelectedTable,
//     tableFilter,
//     setTableFilter,
//     orders,
//   } = usePos();
//   const [collapsedAreas, setCollapsedAreas] = useState({ ground: true });

//   const toggleArea = (areaId) => {
//     setCollapsedAreas((prev) => ({ ...prev, [areaId]: !prev[areaId] }));
//   };

//   const getTableStatus = (tableId) => {
//     return orders[tableId]?.length > 0 ? "occupied" : "empty";
//   };

//   const filteredAreas = TABLE_AREAS.map((area) => ({
//     ...area,
//     tables: area.tables.map((t) => ({
//       ...t,
//       status: getTableStatus(t.id),
//     })),
//   }));

//   const allTables = filteredAreas.flatMap((a) => a.tables);
//   const totalCount = allTables.length;
//   const occupiedCount = allTables.filter((t) => t.status === "occupied").length;
//   const emptyCount = totalCount - occupiedCount;

//   const filterCounts = {
//     all: totalCount,
//     occupied: occupiedCount,
//     empty: emptyCount,
//   };

//   const filterTables = (tables) => {
//     if (tableFilter === "all") return tables;
//     if (tableFilter === "occupied") return tables.filter((t) => t.status === "occupied");
//     return tables.filter((t) => t.status === "empty");
//   };

//   return (
//     <div className="flex flex-col h-full min-w-0">
//       {/* Tabs filter */}
//       <div className="flex gap-2 p-3 border-b shrink-0">
//         <button
//           onClick={() => setTableFilter("all")}
//           className={`px-4 py-2 rounded font-medium text-sm ${
//             tableFilter === "all" ? "bg-teal-500 text-white" : "bg-gray-100 hover:bg-gray-200"
//           }`}
//         >
//           TẤT CẢ ({filterCounts.all})
//         </button>
//         <button
//           onClick={() => setTableFilter("occupied")}
//           className={`px-4 py-2 rounded font-medium text-sm ${
//             tableFilter === "occupied" ? "bg-teal-500 text-white" : "bg-gray-100 hover:bg-gray-200"
//           }`}
//         >
//           CÓ KHÁCH ({filterCounts.occupied})
//         </button>
//         <button
//           onClick={() => setTableFilter("empty")}
//           className={`px-4 py-2 rounded font-medium text-sm ${
//             tableFilter === "empty" ? "bg-teal-500 text-white" : "bg-gray-100 hover:bg-gray-200"
//           }`}
//         >
//           TRỐNG ({filterCounts.empty})
//         </button>
//       </div>

//       {/* Table areas */}
//       <div className="flex-1 overflow-y-auto p-3 space-y-4">
//         {filteredAreas.map((area) => {
//           const filtered = filterTables(area.tables);
//           if (filtered.length === 0) return null;

//           const isCollapsed = collapsedAreas[area.id];
//           return (
//             <div key={area.id} className="border rounded-lg overflow-hidden">
//               <button
//                 onClick={() => toggleArea(area.id)}
//                 className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 text-left font-semibold text-sm"
//               >
//                 <span>{area.name}</span>
//                 <span className="text-gray-500 font-normal">
//                   {area.tables.length} bàn
//                 </span>
//               </button>
//               {!isCollapsed && (
//                 <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
//                   {filtered.map((table) => {
//                     const isSelected = selectedTable === table.id;
//                     return (
//                       <button
//                         key={table.id}
//                         onClick={() => setSelectedTable(table.id)}
//                         className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
//                           isSelected
//                             ? "border-orange-500 bg-orange-50"
//                             : "border-gray-200 bg-white hover:border-gray-300"
//                         }`}
//                       >
//                         <FiCoffee className="w-6 h-6 text-gray-600 mb-1" />
//                         <span className="text-xs font-semibold text-center">
//                           {table.name}
//                         </span>
//                         <span className="text-[10px] text-gray-500 mt-0.5">
//                           {table.status === "occupied" ? "Có khách" : "Trống"}
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
