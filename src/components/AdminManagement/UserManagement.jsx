import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiShield, FiKey, FiLock, FiUnlock } from "react-icons/fi";
import { 
  getAllUsers, createUser, updateUser, toggleUserStatus, resetUserPassword 
} from "../../API/Service/userServices";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. STATE CHO MODAL THÊM/SỬA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ 
    username: "", password: "", fullName: "", type: "Employee"
  });

  // 2. STATE CHO MODAL THÔNG BÁO (DIALOG CHUNG)
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'info', // Gồm: 'success', 'error', 'warning', 'confirm'
    title: '',
    message: '',
    onConfirm: null 
  });

  // HÀM TIỆN ÍCH ĐỂ GỌI DIALOG
  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };
  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân viên", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({ username: user.username, password: "", fullName: user.fullName, type: user.type });
    } else {
      setFormData({ username: "", password: "", fullName: "", type: "Employee" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.fullName) {
      showDialog('warning', 'Thiếu thông tin', 'Vui lòng nhập đủ thông tin bắt buộc!');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, { fullName: formData.fullName, type: formData.type });
        showDialog('success', 'Thành công', 'Cập nhật tài khoản thành công!');
      } else {
        if (!formData.password) {
          showDialog('warning', 'Thiếu thông tin', 'Vui lòng nhập mật khẩu cho nhân viên mới!');
          return;
        }
        await createUser(formData);
        showDialog('success', 'Thành công', 'Thêm nhân viên thành công!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      showDialog('error', 'Thao tác thất bại', error.response?.data?.message || "Đã có lỗi xảy ra!");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleUserStatus(id);
      fetchUsers();
    } catch (error) {
      showDialog('error', 'Lỗi hệ thống', 'Không thể đổi trạng thái lúc này!');
    }
  };

  const handleResetPassword = (id, fullName) => {
    // Thay window.confirm bằng Dialog Confirm xịn sò
    showDialog(
      'confirm',
      'Xác nhận đặt lại',
      `Bạn có chắc chắn muốn đặt lại mật khẩu của [${fullName}] về mặc định (123456) không?`,
      async () => {
        closeDialog();
        try {
          await resetUserPassword(id);
          showDialog('success', 'Thành công', 'Đã đặt lại mật khẩu thành công!');
        } catch (error) {
          showDialog('error', 'Lỗi thao tác', 'Đã có lỗi xảy ra khi đặt lại mật khẩu!');
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân sự</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FiPlus className="text-lg" />
          Thêm nhân viên
        </button>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="px-6 py-4 font-medium">Tên đăng nhập</th>
              <th className="px-6 py-4 font-medium">Họ và tên</th>
              <th className="px-6 py-4 font-medium">Vai trò</th>
              <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-gray-700">{user.fullName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.type === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      <FiShield /> {user.type === 'Admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(user.id)}
                      disabled={user.username.toLowerCase() === 'admin'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.isActive ? 'bg-teal-500' : 'bg-gray-300'} ${user.username.toLowerCase() === 'admin' ? 'opacity-40 cursor-not-allowed' : ''}`}
                      title={user.username.toLowerCase() === 'admin' ? "Không thể khóa Admin gốc" : (user.isActive ? "Đang hoạt động" : "Đã khóa")}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleResetPassword(user.id, user.fullName)}
                        title="Đặt lại mật khẩu"
                        className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 p-1.5 rounded transition-colors"
                      >
                        <FiKey className="text-lg" />
                      </button>
                      {user.username.toLowerCase() !== 'admin' && (
                        <button 
                          onClick={() => handleOpenModal(user)}
                          title="Chỉnh sửa"
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 1. MODAL THÊM/SỬA NHÂN VIÊN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[400px] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingUser ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!!editingUser} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Employee">Nhân viên (Employee)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL THÔNG BÁO CHUNG (DIALOG) */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white w-[400px] rounded-lg shadow-xl overflow-hidden">
            
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
                  else closeDialog();
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