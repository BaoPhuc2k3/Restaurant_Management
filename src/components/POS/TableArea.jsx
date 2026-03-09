import TableCard from "./TableCard";

export default function TableArea({
  tables,
  selectedTable,
  onSelectTable
}) {
  
  // 🔥 1. THUẬT TOÁN GOM NHÓM BÀN THEO KHU VỰC
  const groupedTables = tables.reduce((group, table) => {
    // Nếu bàn không có khu vực, cho nó vào "Khu vực khác"
    const areaName = table.area || "Khu vực khác"; 
    
    // Nếu cái nhóm này chưa tồn tại, tạo một mảng rỗng cho nó
    if (!group[areaName]) {
      group[areaName] = [];
    }
    
    // Nhét cái bàn vào đúng mảng khu vực của nó
    group[areaName].push(table);
    
    return group;
  }, {});

  // Lấy ra danh sách tên các khu vực (Ví dụ: ["Tầng 1", "Phòng VIP", "Sân vườn"])
  const areaNames = Object.keys(groupedTables);

  return (
    <div className="space-y-6 pb-20 h-full overflow-y-auto"> {/* Khoảng cách giữa các khu vực */}
      
      {areaNames.length === 0 ? (
        <div className="text-center text-gray-500 py-10">Chưa có bàn nào được tạo.</div>
      ) : (
        areaNames.map((area) => (
          <div key={area} className="bg-slate-300 p-4 rounded-xl border border-slate-200 ">
            
            {/* 🔥 2. TIÊU ĐỀ KHU VỰC */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
                {area}
              </h3>
              <span className="bg-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">
                {groupedTables[area].length} bàn
              </span>
            </div>

            {/* 🔥 3. LƯỚI BÀN CỦA RIÊNG KHU VỰC ĐÓ */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {groupedTables[area].map(table => (
                <TableCard
                  key={table.id}
                  table={table}
                  selected={selectedTable?.id === table.id}
                  onClick={onSelectTable}
                />
              ))}
            </div>

          </div>
        ))
      )}
      
    </div>
  );
}