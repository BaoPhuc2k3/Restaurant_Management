import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiTag, FiCalendar } from "react-icons/fi";
import { 
  getAllVouchers, createVoucher, updateVoucher, toggleVoucherStatus, deleteVoucher 
} from "../../API/Service/VoucherServices";

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE MODAL THÊM/SỬA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: "", type: "Percentage", discountValue: 0, maxDiscountAmount: 0, 
    requiredPoints: 0, quantity: 1, startDate: "", endDate: ""
  });

  // STATE DIALOG THÔNG BÁO
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };
  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Lỗi lấy voucher:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Hàm chuyển đổi ngày giờ từ C# sang định dạng của thẻ input datetime-local (YYYY-MM-DDThh:mm)
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  // Hàm hiển thị tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOpenModal = (voucher = null) => {
    setEditingVoucher(voucher);
    if (voucher) {
      setFormData({
        code: voucher.code,
        type: voucher.type, // 'Percentage' hoặc 'FixedAmount'
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount || 0,
        requiredPoints: voucher.requiredPoints,
        quantity: voucher.quantity,
        startDate: formatDateTimeForInput(voucher.startDate),
        endDate: formatDateTimeForInput(voucher.endDate)
      });
    } else {
      // Mặc định tạo mới: Bắt đầu từ hiện tại, kết thúc sau 7 ngày
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      
      setFormData({ 
        code: "", type: "Percentage", discountValue: 0, maxDiscountAmount: 0, 
        requiredPoints: 0, quantity: 1, 
        startDate: formatDateTimeForInput(now), 
        endDate: formatDateTimeForInput(nextWeek)
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.startDate || !formData.endDate) {
      showDialog('warning', 'Thiếu thông tin', 'Vui lòng nhập đầy đủ Mã và Thời hạn voucher!');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      showDialog('warning', 'Ngày không hợp lệ', 'Ngày kết thúc phải lớn hơn ngày bắt đầu!');
      return;
    }

    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, formData);
        showDialog('success', 'Thành công', 'Cập nhật Voucher thành công!');
      } else {
        await createVoucher(formData);
        showDialog('success', 'Thành công', 'Thêm Voucher mới thành công!');
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error) {
      showDialog('error', 'Thao tác thất bại', error.response?.data?.message || "Đã có lỗi xảy ra!");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleVoucherStatus(id);
      fetchVouchers();
    } catch (error) {
      showDialog('error', 'Lỗi hệ thống', 'Không thể đổi trạng thái lúc này!');
    }
  };

  const handleDelete = (id, code) => {
    showDialog('confirm', 'Xác nhận xóa', `Bạn có chắc chắn muốn xóa mã Voucher [${code}] này không?`, async () => {
      closeDialog();
      try {
        await deleteVoucher(id);
        fetchVouchers();
        showDialog('success', 'Thành công', 'Đã xóa Voucher thành công!');
      } catch (error) {
        showDialog('error', 'Lỗi thao tác', 'Đã có lỗi xảy ra khi xóa Voucher!');
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khuyến mãi</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý phát hành và thiết lập mã giảm giá</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FiPlus className="text-lg" />
          Thêm Voucher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="px-6 py-4 font-medium">Mã Voucher</th>
              <th className="px-6 py-4 font-medium">Mức giảm</th>
              <th className="px-6 py-4 font-medium">Điều kiện đổi</th>
              <th className="px-6 py-4 font-medium">Thời hạn sử dụng</th>
              <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-500">Chưa có mã khuyến mãi nào.</td></tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded border border-orange-200 tracking-wider">
                      <FiTag /> {v.code}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">SL: {v.quantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">
                      {v.type === 'Percentage' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                    </div>
                    {v.type === 'Percentage' && v.maxDiscountAmount > 0 && (
                      <div className="text-xs text-gray-500">Tối đa: {formatCurrency(v.maxDiscountAmount)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-teal-700 font-medium">{v.requiredPoints} điểm</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm text-gray-600 gap-1">
                      <span className="flex items-center gap-1"><FiCalendar className="text-gray-400"/> Từ: {new Date(v.startDate).toLocaleString('vi-VN')}</span>
                      <span className="flex items-center gap-1"><FiCalendar className="text-gray-400"/> Đến: {new Date(v.endDate).toLocaleString('vi-VN')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(v.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${v.isActive ? 'bg-teal-500' : 'bg-gray-300'}`}
                      title={v.isActive ? "Đang hoạt động" : "Đã tắt"}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${v.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleOpenModal(v)} className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                        <FiEdit className="text-lg" />
                      </button>
                      <button onClick={() => handleDelete(v.id, v.code)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors" title="Xóa">
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

      {/* MODAL THÊM / SỬA VOUCHER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[600px] rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingVoucher ? "Cập nhật Voucher" : "Thêm Voucher mới"}
              </h2>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {/* Cột 1 */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Voucher (Code) *</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="VD: TET2024" className="w-full border border-gray-300 rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-teal-500"/>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500">
                  <option value="Percentage">Theo phần trăm (%)</option>
                  <option value="FixedAmount">Trừ tiền trực tiếp (VNĐ)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức giảm {formData.type === 'Percentage' ? '(%)' : '(VNĐ)'} *
                </label>
                <input type="number" min="0" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"/>
              </div>

              {/* Chỉ hiển thị ô Giảm tối đa nếu là loại Phần trăm */}
              {formData.type === 'Percentage' && (
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
                  <input type="number" min="0" value={formData.maxDiscountAmount} onChange={(e) => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"/>
                </div>
              )}

              {/* Điểm và Số lượng */}
              <div className={`col-span-2 ${formData.type !== 'Percentage' ? 'sm:col-span-1' : 'sm:col-span-1'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điểm đổi</label>
                <input type="number" min="0" value={formData.requiredPoints} onChange={(e) => setFormData({...formData, requiredPoints: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"/>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng phát hành</label>
                <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"/>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày *</label>
                <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"/>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày *</label>
                <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"/>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Lưu lại</button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG THÔNG BÁO CHUNG */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white w-100 rounded-lg shadow-xl overflow-hidden">
            <div className={`px-6 py-4 border-b ${dialog.type === 'error' ? 'bg-red-50' : dialog.type === 'success' ? 'bg-teal-50' : dialog.type === 'warning' ? 'bg-orange-50' : 'bg-blue-50'}`}>
              <h2 className={`text-lg font-bold ${dialog.type === 'error' ? 'text-red-700' : dialog.type === 'success' ? 'text-teal-700' : dialog.type === 'warning' ? 'text-orange-700' : 'text-blue-700'}`}>
                {dialog.title}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{dialog.message}</p>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              {dialog.onConfirm && (
                <button onClick={closeDialog} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 font-medium">Hủy bỏ</button>
              )}
              <button onClick={() => { if (dialog.onConfirm) dialog.onConfirm(); else closeDialog(); }} className={`px-4 py-2 text-white rounded font-medium shadow-sm ${dialog.type === 'error' ? 'bg-red-600' : dialog.type === 'warning' ? 'bg-orange-600' : dialog.type === 'confirm' ? 'bg-blue-600' : 'bg-teal-600'}`}>
                {dialog.onConfirm ? 'Đồng ý' : 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}