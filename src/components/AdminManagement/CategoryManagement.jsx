import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

import { 
  getAllMenus, 
  createMenu, 
  updateMenu, 
  toggleMenuStatus,
  checkDeleteMenuStatus, 
  deleteMenu
} from "../../API/Service/menuServices";

export default function CategoryManagement() {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. STATE CHO MODAL THÊM / SỬA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); 
  const [categoryName, setCategoryName] = useState("");

  // 2. STATE CHO MODAL THÔNG BÁO (DIALOG CHUNG)
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'info', // Gồm: 'success', 'error', 'warning', 'confirm'
    title: '',
    message: '',
    onConfirm: null // Hàm sẽ chạy nếu người dùng bấm "Đồng ý"
  });

  // HÀM TIỆN ÍCH ĐỂ GỌI DIALOG NHANH GỌN
  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };
  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
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

  // ==========================================
  // XỬ LÝ LƯU (THÊM / SỬA)
  // ==========================================
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      showDialog('warning', 'Thiếu thông tin', 'Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      if (editingCategory) {
        await updateMenu(editingCategory.id, categoryName);
        showDialog('success', 'Thành công', 'Cập nhật danh mục thành công!');
      } else {
        await createMenu(categoryName);
        showDialog('success', 'Thành công', 'Thêm danh mục mới thành công!');
      }
      setIsModalOpen(false);
      fetchCategories(); 
    } catch (error) {
      showDialog('error', 'Lỗi thao tác', 'Có lỗi xảy ra khi lưu danh mục.');
    }
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : "");
    setIsModalOpen(true);
  };

  // ==========================================
  // XỬ LÝ BẬT / TẮT (TOGGLE)
  // ==========================================
  const handleToggle = async (e, id) => {
    e.stopPropagation(); 
    try {
      await toggleMenuStatus(id);
      fetchCategories(); 
    } catch (error) {
      showDialog('error', 'Lỗi hệ thống', 'Không thể cập nhật trạng thái lúc này.');
    }
  };    

  // ==========================================
  // XỬ LÝ XÓA
  // ==========================================
  const handleDeleteClick = async (e, id, name) => {
    e.stopPropagation(); 

    try {
      const checkRes = await checkDeleteMenuStatus(id);

      // CASE 3: Lịch sử hóa đơn (Warning -> Xác nhận Ẩn)
      if (checkRes.status === 3) {
        showDialog(
          'warning', 
          'Bảo toàn dữ liệu', 
          `Danh mục [${name}] đã có dữ liệu hóa đơn.\nHệ thống sẽ tự động chuyển sang trạng thái ẨN để bảo toàn doanh thu.`,
          async () => {
            closeDialog();
            await deleteMenu(id, false);
            fetchCategories();
            showDialog('success', 'Thành công', 'Đã chuyển danh mục sang trạng thái Ẩn.');
          }
        );
        return;
      }

      // CASE 2: Chứa món ăn (Confirm -> Hỏi xóa món)
      if (checkRes.status === 2) {
        showDialog(
          'confirm',
          'Xác nhận xóa món ăn',
          `Danh mục [${name}] đang chứa món ăn.\n\nBạn có muốn XÓA VĨNH VIỄN CẢ DANH MỤC VÀ MÓN ĂN bên trong không?`,
          async () => {
            closeDialog();
            await deleteMenu(id, true);
            fetchCategories();
            showDialog('success', 'Thành công', 'Đã xóa danh mục và toàn bộ món ăn bên trong!');
          }
        );
        return;
      }

      // CASE 1: An toàn (Confirm -> Hỏi xóa bình thường)
      if (checkRes.status === 1) {
        showDialog(
          'confirm',
          'Xác nhận xóa',
          `Bạn có chắc chắn muốn xóa danh mục [${name}] không?`,
          async () => {
            closeDialog();
            await deleteMenu(id, false);
            fetchCategories();
            showDialog('success', 'Thành công', 'Đã xóa danh mục thành công!');
          }
        );
      }

    } catch (error) {
      showDialog('error', 'Lỗi hệ thống', 'Đã có lỗi xảy ra khi kiểm tra dữ liệu xóa!');
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

      {/* BẢNG DỮ LIỆU (Giữ nguyên cấu trúc của bạn) */}
      <div className="flex-1 overflow-auto p-6 bg-gray-100">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600">
                <th className="px-6 py-3 font-medium w-20">ID</th>
                <th className="px-6 py-3 font-medium">Tên danh mục</th>
                <th className="px-6 py-3 font-medium text-center w-32">Trạng thái</th>
                <th className="px-6 py-3 font-medium w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-gray-500">Chưa có danh mục nào.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr 
                    key={cat.id} 
                    onClick={() => handleRowClick(cat.id)} 
                    className={`border-b cursor-pointer transition-colors ${cat.isActive ? 'hover:bg-teal-50 bg-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    <td className="px-6 py-4">{cat.id}</td>
                    <td className="px-6 py-4 font-medium">{cat.name}</td>
                    
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => handleToggle(e, cat.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${cat.isActive ? 'bg-teal-600' : 'bg-gray-400'}`}
                        title={cat.isActive ? "Nhấn để Tắt" : "Nhấn để Bật"}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openModal(cat); }}
                          className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-100 rounded transition-colors"
                          title="Sửa"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, cat.id, cat.name)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"
                          title="Xóa"
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

      {/* 1. MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
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
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCategory(); }}
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

      {/* 2. MODAL THÔNG BÁO CHUNG (ALERT / CONFIRM) */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white w-100 rounded-lg shadow-xl overflow-hidden">
            
            {/* Header đổi màu theo loại thông báo */}
            <div className={`px-6 py-4 border-b ${
              dialog.type === 'error' ? 'bg-red-50' : 
              dialog.type === 'success' ? 'bg-teal-50' : 
              dialog.type === 'warning' ? 'bg-orange-50' : 'bg-blue-50'
            }`}>
              <h2 className={`text-lg font-bold ${
                dialog.type === 'error' ? 'text-red-700' : 
                dialog.type === 'success' ? 'text-teal-700' : 
                dialog.type === 'warning' ? 'text-orange-700' : 'text-blue-700'
              }`}>
                {dialog.title}
              </h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {dialog.message}
              </p>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              {/* Nếu có onConfirm (Xác nhận Xóa), hiển thị thêm nút Hủy */}
              {dialog.onConfirm && (
                <button 
                  onClick={closeDialog}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors font-medium"
                >
                  Hủy bỏ
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  else closeDialog(); // Nếu là alert bình thường thì đóng
                }}
                className={`px-4 py-2 text-white rounded transition-colors font-medium shadow-sm ${
                  dialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                  dialog.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700' : 
                  dialog.type === 'confirm' ? 'bg-blue-600 hover:bg-blue-700' : 
                  'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {dialog.onConfirm ? 'Đồng ý' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}