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
  
  // Lấy categoryId từ URL (VD: /menu-items?categoryId=1)
  const { categoryId } = useParams();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "" });

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
    // Nếu ai đó gõ URL thẳng mà không có categoryId, đá về trang Danh mục
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
          name: formData.name,
          price: parseFloat(formData.price)
        });
        alert("Cập nhật thành công!");
      } else {
        // THÊM MỚI (Nhớ gửi kèm MenuId)
        await createMenuItem({
          menuId: parseInt(categoryId),
          name: formData.name,
          price: parseFloat(formData.price)
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
    setFormData(item ? { name: item.name, price: item.price } : { name: "", price: "" });
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

  // HÀM XỬ LÝ XÓA THÔNG MINH (3 TRƯỜNG HỢP)
  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    
    try {
      // 1. BẮT ĐẦU GỌI API HỎI THĂM TRẠNG THÁI
      const checkInfo = await checkMenuDeleteStatus(id);

      // 2. XỬ LÝ DỰA TRÊN CÂU TRẢ LỜI CỦA BACKEND
      if (checkInfo.status === 3) {
        // CASE 3: Đã từng bán hàng
        alert("CẢNH BÁO: Danh mục này đang chứa các món ăn đã từng được Order. Hệ thống sẽ CHỈ ẨN danh mục này đi để bảo toàn dữ liệu doanh thu.");
        
        // Gọi API xóa (Backend sẽ tự hiểu status 3 và tự động chuyển sang Ẩn)
        await deleteMenu(id, false); 
        fetchCategories(); // Load lại bảng

      } 
      else if (checkInfo.status === 2) {
        // CASE 2: Có món ăn nhưng chưa bán bao giờ
        const confirmDeleteItems = window.confirm(
          "Danh mục này đang có chứa món ăn bên trong.\n\nBạn có muốn XÓA LUÔN TẤT CẢ các món ăn thuộc danh mục này không?\n\n- Chọn OK: Xóa danh mục + Xóa món ăn\n- Chọn Cancel: Hủy thao tác"
        );

        if (confirmDeleteItems) {
           await deleteMenu(id, true); // true = Đồng ý xóa items
           alert("Đã xóa danh mục và các món ăn liên quan.");
           fetchCategories();
        } else {
           // User bấm Cancel -> Hủy, không làm gì cả
           return; 
        }

      } 
      else if (checkInfo.status === 1) {
        // CASE 1: Rỗng hoàn toàn
        const confirmNormal = window.confirm("Bạn có chắc chắn muốn xóa danh mục này?");
        if (confirmNormal) {
          await deleteMenu(id, false);
          alert("Đã xóa danh mục.");
          fetchCategories();
        }
      }

    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      alert("Hệ thống gặp sự cố, không thể kiểm tra hoặc xóa danh mục này.");
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
                <th className="px-6 py-3 font-medium">Tên món</th>
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
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-orange-600 font-semibold">
                      {item.price.toLocaleString()}đ
                    </td>
                    
                    {/* Nút Toggle Trạng thái */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(item.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.isActive ? 'bg-teal-600' : 'bg-gray-400'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>

                    {/* Nút Sửa / Xóa */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openModal(item)}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-100 rounded transition-colors"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
          <div className="bg-white w-100 rounded-lg shadow-xl overflow-hidden">
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500"
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