import React, { useState, useMemo, useCallback, memo } from "react";

/* ================================
   UTILS
================================ */

// Remove Vietnamese tones
const removeVietnameseTones = (str = "") =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();

// Smart search
const smartSearch = (searchTerm, itemName) => {
  if (!searchTerm) return true;

  const normSearch = removeVietnameseTones(searchTerm);
  const normItem = removeVietnameseTones(itemName);

  return normItem.includes(normSearch);
};

/* ================================
   ROW COMPONENT (Memo)
================================ */

const MenuRow = memo(({ index, item, onAdd }) => {
  return (
    <div className="grid grid-cols-12 items-center px-3 py-2 border-b hover:bg-gray-50 text-sm">
      
      {/* STT */}
      <div className="col-span-1 text-gray-500 text-xs">
        {index + 1}
      </div>

      {/* Tên món */}
      <div className="col-span-6 font-medium text-gray-800 truncate">
        {item.name}
      </div>

      {/* Giá */}
      <div className="col-span-3 text-teal-700 font-semibold text-right">
        {item.price.toLocaleString()}
      </div>

      {/* Thêm */}
      <div className="col-span-2 flex justify-end">
        <button
          onClick={() => onAdd(item)}
          className="w-8 h-8 bg-teal-600 hover:bg-teal-700 text-white rounded flex items-center justify-center text-lg font-bold active:scale-95 transition"
        >
          +
        </button>
      </div>
    </div>
  );
});

/* ================================
   MAIN COMPONENT
================================ */

export default function MenuList({
  menuItems = [],
  categories = [],
  onAddItem
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);

  /* ================================
     FILTER LOGIC
  ================================= */

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = smartSearch(searchTerm, item.name);
      const matchesCategory =
        selectedCategoryId === 0 || item.menuId === selectedCategoryId;

      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, selectedCategoryId]);

  const handleAdd = useCallback(
    (item) => {
      onAddItem?.(item);
    },
    [onAddItem]
  );

  /* ================================
     RENDER
  ================================= */

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ================= SEARCH + CATEGORY (GIỮ NGUYÊN) ================= */}

      <div className="sticky top-0 bg-gray-50 pt-2 space-y-3 z-10 px-2">

        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm món (vd: tra sua, ca phe...)"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
            🔍
          </span>
        </div>

        {/* CATEGORY */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategoryId(0)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategoryId === 0
                ? "bg-teal-600 text-white shadow"
                : "bg-white text-gray-600 border hover:bg-gray-100"
            }`}
          >
            Tất cả
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategoryId === cat.id
                  ? "bg-teal-600 text-white shadow"
                  : "bg-white text-gray-600 border hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TABLE HEADER ================= */}

      <div className="grid grid-cols-12 px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 border-b">
        <div className="col-span-1">STT</div>
        <div className="col-span-6">Tên món</div>
        <div className="col-span-3 text-right">Giá</div>
        <div className="col-span-2 text-right">Thêm</div>
      </div>

      {/* ================= LIST ================= */}

      <div className="flex-1 overflow-y-auto bg-white">

        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-400 py-10 italic text-sm">
            Không tìm thấy món "{searchTerm}"
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <MenuRow
              key={item.id}
              index={index}
              item={item}
              onAdd={handleAdd}
            />
          ))
        )}
      </div>
    </div>
  );
}