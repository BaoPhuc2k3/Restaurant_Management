import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

// Import các hàm Service vừa tạo
import { 
  getItemsByCategory, 
  createMenuItem, 
  updateMenuItem, 
  toggleMenuItem, 
  deleteMenuItem 
} from "../../API/Service/menuItemServices";

export default function MenuItems() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Thêm/Sửa (Đã thêm description)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "", description: "" });

  // 1. LẤY DỮ LIỆU KHI VÀO TRANG
  const fetchItems = async () => {
    if (!categoryId) return;
    try {
      setIsLoading(true);
      const data = await getItemsByCategory(categoryId);
      setItems(data);
    } catch (error) {
      console.error("Lỗi lấy món ăn:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!categoryId) {
      navigate("/categories");
    } else {
      fetchItems();
    }
  }, [categoryId, navigate]);

  // 2. XỬ LÝ LƯU (THÊM/SỬA)
  const handleSave = async () => {
    if (!formData.name.trim() || formData.price === "") {
      alert("Vui lòng nhập đủ tên và giá món!");
      return;
    }

    try {
      if (editingItem) {
        // SỬA
        await updateMenuItem(editingItem.id, {
          name: formData.name.trim(),
          price: parseFloat(formData.price),
          description: formData.description.trim()
        });
        alert("Cập nhật thành công!");
      } else {
        // THÊM MỚI
        await createMenuItem({
          menuId: parseInt(categoryId),
          name: formData.name.trim(),
          price: parseFloat(formData.price),
          description: formData.description.trim() 
        });
        alert("Thêm món thành công!");
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error("Lỗi lưu món ăn:", error);
      alert("Thao tác thất bại.");
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    // Nếu có item (đang sửa), điền sẵn mô tả. Nếu không thì để rỗng.
    setFormData(item 
      ? { name: item.name, price: item.price, description: item.description || "" } 
      : { name: "", price: "", description: "" }
    );
    setIsModalOpen(true);
  };

  // 3. XỬ LÝ BẬT/TẮT (HẾT MÓN/CÒN MÓN)
  const handleToggle = async (id) => {
    try {
      await toggleMenuItem(id);
      fetchItems();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  // HÀM XỬ LÝ XÓA THÔNG MINH
  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    
    // Lưu ý: Đoạn code xóa thông minh của bạn đang gọi hàm kiểm tra Menu (Danh mục). 
    // Tôi giữ nguyên logic của bạn, nhưng hãy chắc chắn rằng bạn đang gọi đúng API xóa Món ăn (MenuItem) nhé!
    try {
      const confirmNormal = window.confirm("Bạn có chắc chắn muốn xóa món này?");
      if (confirmNormal) {
        await deleteMenuItem(id);
        alert("Đã xóa món ăn.");
        fetchItems();
      }
    } catch (error) {
      console.error("Lỗi khi xóa món:", error);
      alert("Hệ thống gặp sự cố, không thể xóa món này.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/categories')} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-teal-700"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-teal-800">
            Danh sách Món ăn
          </h1>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          <FiPlus className="text-lg" />
          Thêm Món
        </button>
      </div>

      {/* NỘI DUNG BẢNG */}
      <div className="flex-1 overflow-auto p-6 bg-gray-100">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600">
                <th className="px-6 py-3 font-medium w-20">ID</th>
                <th className="px-6 py-3 font-medium">Tên món & Mô tả</th>
                <th className="px-6 py-3 font-medium">Giá tiền</th>
                <th className="px-6 py-3 font-medium text-center w-32">Còn món</th>
                <th className="px-6 py-3 font-medium w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Chưa có món ăn nào trong danh mục này.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className={`border-b transition-colors ${item.isActive ? 'hover:bg-teal-50 bg-white' : 'bg-gray-100 text-gray-400'}`}>
                    <td className="px-6 py-4">#{item.id}</td>
                    
                    {/* Cột Tên & Mô tả */}
                    <td className="px-6 py-4">
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1" title={item.description}>
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-orange-600 font-semibold">
                      {item.price.toLocaleString()}đ
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(item.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.isActive ? 'bg-teal-600' : 'bg-gray-400'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openModal(item)}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-100 rounded transition-colors"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, item.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM/SỬA MÓN ĂN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingItem ? "Sửa món ăn" : "Thêm món mới"}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên món <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá tiền (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả (Tùy chọn)
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Mô tả món ăn..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-medium"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}