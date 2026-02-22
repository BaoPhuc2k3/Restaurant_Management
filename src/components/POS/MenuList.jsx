import React, { useState, useMemo } from "react";

// Hàm 1: Bóc tách dấu tiếng Việt
const removeVietnameseTones = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
};

// Hàm 2: Thuật toán so sánh thông minh từng ký tự
const smartSearch = (searchTerm, itemName) => {
  const search = searchTerm.toLowerCase().trim();
  const item = itemName.toLowerCase();

  if (!search) return true; // Nếu không nhập gì thì hiện tất cả

  const normSearch = removeVietnameseTones(search);
  const normItem = removeVietnameseTones(item);

  // 1. Tìm vị trí khớp nhau ở dạng không dấu
  const startIndex = normItem.indexOf(normSearch);
  if (startIndex === -1) return false; // Trượt ngay vòng gửi xe

  // 2. Lấy ra đoạn chữ thật trong Database tương ứng với độ dài từ khóa
  const matchedSubstring = item.substr(startIndex, search.length);

  // 3. Soi từng ký tự
  for (let i = 0; i < search.length; i++) {
    const searchChar = search[i];
    const targetChar = matchedSubstring[i];

    // Nếu giống hệt nhau -> Cho qua
    if (searchChar === targetChar) continue;

    const normSearchChar = removeVietnameseTones(searchChar);
    const normTargetChar = removeVietnameseTones(targetChar);

    // Nếu chữ cái gốc giống nhau (vd: 'a' và 'ả' đều có gốc là 'a')
    if (normSearchChar === normTargetChar) {
      // Nếu bạn gõ chữ không dấu (vd: 'a'), nó được phép khớp với chữ có dấu ('ả')
      if (searchChar === normSearchChar) {
        continue;
      }
    }

    // Nếu bạn gõ có dấu (vd: 'ữ') mà Data lại là chữ khác (vd: 'ư'), thì lập tức loại bỏ!
    return false; 
  }

  return true;
};

export default function MenuList({ menuItems, categories, onAddItem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  // Áp dụng thuật toán mới vào lọc dữ liệu
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Gọi hàm smartSearch siêu việt ở trên
      const matchesSearch = smartSearch(searchTerm, item.name);
      
      // Kiểm tra danh mục
      const matchesCategory = selectedCategoryId === 0 || item.menuId === selectedCategoryId;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategoryId, menuItems]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ... Phần giao diện giữ nguyên y hệt bản trước ... */}
      {/* (Ô input tìm kiếm và thanh tab danh mục) */}
      
      <div className="sticky top-0 bg-gray-50 pt-2 space-y-3 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm món (vd: súp hai san, tra sua...)"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        
        {/* ... Tab Categories ... */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategoryId(0)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategoryId === 0
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
          >
            Tất cả
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategoryId === cat.id
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 py-10 italic">
            Không tìm thấy món "{searchTerm}" trong danh mục này.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex-1 pr-4">
                <div className="font-bold text-gray-800 text-lg uppercase leading-tight">
                  {item.name}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-400 line-clamp-1 mb-1">
                    {item.description}
                  </div>
                )}
                <div className="text-teal-600 font-bold">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.price)}
                </div>
              </div>

              <button
                onClick={() => onAddItem(item)}
                className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-lg"
              >
                <span className="text-2xl font-light">+</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}