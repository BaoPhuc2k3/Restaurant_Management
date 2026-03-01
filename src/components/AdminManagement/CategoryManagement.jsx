import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit } from "react-icons/fi";

// Import thêm 2 hàm mới từ service
import { 
  getAllMenus, // Dùng hàm mới này thay cho getAllMenus
  createMenu, 
  updateMenu, 
  toggleMenuStatus // Hàm mới
} from "../../API/Service/menuServices";

export default function CategoryManagement() {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); 
  const [categoryName, setCategoryName] = useState("");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      // Gọi hàm lấy TẤT CẢ danh mục (kể cả đã tắt)
      const data = await getAllMenus(); 
      setCategories(data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRowClick = (categoryId) => {
    navigate(`/categories/${categoryId}/menu-items`); 
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      if (editingCategory) {
        await updateMenu(editingCategory.id, categoryName);
        alert("Cập nhật thành công!");
      } else {
        await createMenu(categoryName);
        alert("Thêm danh mục thành công!");
      }
      setIsModalOpen(false);
      fetchCategories(); 
    } catch (error) {
      console.error("Lỗi lưu danh mục:", error);
      alert("Có lỗi xảy ra khi lưu danh mục.");
    }
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : "");
    setIsModalOpen(true);
  };

  // HÀM XỬ LÝ BẬT / TẮT (TOGGLE)
  const handleToggle = async (e, id) => {
    e.stopPropagation(); // Ngăn click nhầm vào dòng (tránh chuyển trang)
    
    try {
      await toggleMenuStatus(id);
      fetchCategories(); // Load lại data để nút tự động gạt sang màu khác
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể cập nhật trạng thái.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-teal-700"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold text-teal-800">Quản lý Danh mục</h1>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          <FiPlus className="text-lg" />
          Thêm danh mục
        </button>
      </div>

      {/* NỘI DUNG BẢNG */}
      <div className="flex-1 overflow-auto p-6 bg-gray-100">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600">
                <th className="px-6 py-3 font-medium w-20">ID</th>
                <th className="px-6 py-3 font-medium">Tên danh mục</th>
                {/* Thêm cột trạng thái */}
                <th className="px-6 py-3 font-medium text-center w-32">Trạng thái</th>
                <th className="px-6 py-3 font-medium w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">Chưa có danh mục nào.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr 
                    key={cat.id} 
                    onClick={() => handleRowClick(cat.id)} 
                    // Nếu đã tắt (isActive = false) thì đổi màu nền cho dễ nhận biết
                    className={`border-b cursor-pointer transition-colors ${cat.isActive ? 'hover:bg-teal-50 bg-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    <td className="px-6 py-4">#{cat.id}</td>
                    <td className="px-6 py-4 font-medium">{cat.name}</td>
                    
                    {/* Cột hiển thị Nút Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => handleToggle(e, cat.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${cat.isActive ? 'bg-teal-600' : 'bg-gray-400'}`}
                        title={cat.isActive ? "Nhấn để Tắt" : "Nhấn để Bật"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.isActive ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            openModal(cat);
                          }}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-100 rounded transition-colors"
                          title="Sửa"
                        >
                          <FiEdit className="text-lg" />
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

      {/* MODAL THÊM / SỬA GIỮ NGUYÊN... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-100 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
              </h2>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="VD: Cà phê, Trà sữa..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors font-medium"
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