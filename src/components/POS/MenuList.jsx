export default function MenuList({ menuItems, onAddItem }) {
  // 1. Kiểm tra nếu dữ liệu chưa load xong hoặc mảng rỗng
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10 italic">
        Không có món ăn nào trong danh mục này.
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {menuItems.map(item => (
        <div
          key={item.id}
          className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex-1 pr-4">
            <div className="font-bold text-gray-800 text-lg uppercase">{item.name}</div>
            

            {item.description && (
              <div className="text-xs text-gray-400 line-clamp-1 mb-1">
                {item.description}
              </div>
            )}

            <div className="text-teal-600 font-bold">
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(item.price)}
            </div>
          </div>

          <button
            onClick={() => onAddItem(item)}
            className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-lg"
            title="Thêm vào hóa đơn"
          >
            <span className="text-2xl font-light">+</span>
          </button>
        </div>
      ))}
    </div>
  );
}