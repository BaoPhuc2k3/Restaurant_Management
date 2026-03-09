import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiUsers } from "react-icons/fi"; // Đã bỏ FiMapPin vì không cần thiết nữa
import { toast } from "react-toastify";
import { getAllTables, createTable, updateTable, deleteTable } from "../../API/Service/tablesService";

export default function TableManagement() {
  const [tables, setTables] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: "", capacity: 4, area: "" // Mặc định area rỗng để người dùng tự nhập
  });

  const [dialog, setDialog] = useState({
    isOpen: false, type: 'info', title: '', message: '', onConfirm: null 
  });

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };
  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTables();
      setTables(data);
    } catch (err) {
      toast.error("Không thể tải danh sách bàn. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenModal = (table = null) => {
    setEditingTable(table);
    if (table) {
      setFormData({ name: table.name, capacity: table.capacity, area: table.area });
    } else {
      setFormData({ name: "", capacity: 4, area: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.area) {
      toast.warning("Vui lòng nhập Tên bàn và Khu vực!");
      return;
    }

    try {
      // Chuẩn hóa tên khu vực (cắt khoảng trắng thừa để tránh tạo ra 2 khu vực "Tầng 1 " và "Tầng 1")
      const submissionData = { ...formData, area: formData.area.trim() };

      if (editingTable) {
        await updateTable(editingTable.id, submissionData);
        toast.success("Cập nhật thông tin bàn thành công!");
      } else {
        await createTable(submissionData);
        toast.success("Thêm bàn mới thành công!");
      }
      setIsModalOpen(false);
      fetchTables(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin bàn!");
    }
  };

  const handleDelete = (id, name) => {
    showDialog(
      'confirm', 
      'Xóa bàn', 
      `Bạn có chắc chắn muốn xóa [${name}] không? Hành động này không thể hoàn tác.`,
      async () => {
        closeDialog(); 
        try {
          await deleteTable(id);
          toast.success(`Đã xóa ${name} thành công!`);
          fetchTables(); 
        } catch (err) {
          toast.error(err.response?.data?.message || "Không thể xóa bàn lúc này!");
        }
      }
    );
  };

  // THUẬT TOÁN GOM NHÓM
  const groupedTables = tables.reduce((group, table) => {
    const areaName = table.area || "Chưa phân khu"; 
    if (!group[areaName]) group[areaName] = [];
    group[areaName].push(table);
    return group;
  }, {});

  // Lấy danh sách các khu vực hiện có (để làm gợi ý khi gõ)
  const existingAreas = Object.keys(groupedTables).filter(a => a !== "Chưa phân khu");

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Bàn & Khu vực</h1>
          <p className="text-sm text-gray-500 mt-1">Thiết lập sơ đồ bàn cho nhà hàng</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <FiPlus className="text-lg" />
          Thêm Bàn Mới
        </button>
      </div>

      {/* KHU VỰC CHỨA DANH SÁCH BÀN */}
      <div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-8">
        
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
        ) : tables.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">Chưa có dữ liệu bàn nào.</p>
            <button onClick={() => handleOpenModal()} className="text-emerald-600 font-medium hover:underline">Tạo bàn đầu tiên ngay</button>
          </div>
        ) : (
          
          existingAreas.map((area) => (
            <div key={area} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              
              {/* Tiêu đề Khu Vực */}
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{area}</h2>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">
                    {groupedTables[area].length} bàn
                  </span>
                </div>
              </div>

              {/* Lưới Bàn (Đã bỏ màu sắc trạng thái) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {groupedTables[area].map((table) => (
                  <div key={table.id} className="bg-white border-2 border-slate-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all p-4 relative group">
                    
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 truncate pr-8" title={table.name}>
                        {table.name}
                      </h3>
                      
                      {/* Nút hành động */}
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md">
                        <button onClick={() => handleOpenModal(table)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors">
                          <FiEdit size={16} />
                        </button>
                        <button onClick={() => handleDelete(table.id, table.name)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Chỉ còn hiển thị sức chứa */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <FiUsers /> 
                      <span><b className="text-gray-700">{table.capacity}</b> người</span>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))
        )}

      </div>

      {/* MODAL THÊM/SỬA BÀN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-96 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingTable ? "Cập nhật thông tin bàn" : "Thêm bàn mới"}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn (Ký hiệu) *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="VD: Bàn 01, VIP 2..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số ghế (Sức chứa) *</label>
                <input 
                  type="number" min="1" max="50"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* 🔥 ĐÃ THAY ĐỔI: Chuyển từ <select> sang <input list="..."> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực *</label>
                <input 
                  type="text"
                  list="area-suggestions" // Trỏ tới id của thẻ datalist bên dưới
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  placeholder="Chọn khu vực hoặc gõ tên mới..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                
                {/* Danh sách gợi ý tự động lấy từ các bàn đang có */}
                <datalist id="area-suggestions">
                  {existingAreas.map((area) => (
                    <option key={area} value={area} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">Gõ một tên bất kỳ để tạo khu vực mới.</p>
              </div>

            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >Hủy</button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >Lưu lại</button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG XÁC NHẬN XÓA */}
      {dialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 backdrop-blur-sm">
          <div className="bg-white w-96 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-red-50">
              <h2 className="text-lg font-bold text-red-700">{dialog.title}</h2>
            </div>
            <div className="p-6"><p className="text-gray-700 leading-relaxed">{dialog.message}</p></div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={closeDialog} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 font-medium">Hủy bỏ</button>
              <button onClick={dialog.onConfirm} className="px-4 py-2 text-white rounded font-medium bg-red-600 hover:bg-red-700">Đồng ý Xóa</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}