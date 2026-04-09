import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiPower } from "react-icons/fi"; 
import { toast } from "react-toastify";
import { getAllTables, createTable, updateTable, deleteTable } from "../../API/Service/tablesService";
import { QRCodeCanvas } from "qrcode.react";
import { FiMaximize, FiDownload, FiPrinter } from "react-icons/fi";


export default function TableManagement() {
  const [tables, setTables] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [qrModal, setQrModal] = useState({ isOpen: false, table: null });
  const qrRef = useRef();

  const [formData, setFormData] = useState({ 
    name: "", capacity: 4, area: "", isActive: true // Thêm thuộc tính isActive cho form
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
      // Đảm bảo lấy cả trạng thái hiện tại (nếu backend dùng tên khác như 'status' thì bạn sửa lại nhé)
      setFormData({ 
        name: table.name, 
        capacity: table.capacity, 
        area: table.area,
        isActive: table.isActive !== false // Mặc định là true nếu không có
      });
    } else {
      setFormData({ name: "", capacity: 4, area: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.area) {
      toast.warning("Vui lòng nhập Tên bàn và Khu vực!");
      return;
    }

    try {
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
// 🔥 HÀM BẬT/TẮT TRẠNG THÁI (Đã tối ưu tốc độ UI)
  const handleToggleStatus = async (table) => {
    const currentStatus = table.isActive !== false;
    const newStatus = !currentStatus;

    // 1. Cập nhật giao diện NGAY LẬP TỨC để tạo cảm giác mượt mà
    setTables(prevTables => 
      prevTables.map(t => t.id === table.id ? { ...t, isActive: newStatus } : t)
    );

    try {
      // 2. Gọi API cập nhật ngầm ở phía sau
      await updateTable(table.id, { ...table, isActive: newStatus });
      toast.success(`Đã ${newStatus ? 'mở lại' : 'tạm ngưng'} bàn ${table.name}`);
      
    } catch (err) {
      // 3. Nếu API lỗi, hoàn tác (rollback) lại giao diện cũ
      setTables(prevTables => 
        prevTables.map(t => t.id === table.id ? { ...t, isActive: currentStatus } : t)
      );
      toast.error("Lỗi khi cập nhật trạng thái bàn!");
    }
  };

  const handleDelete = (id, name) => {
    showDialog(
      'confirm', 
      'Xóa bàn vĩnh viễn', 
      `Bạn có chắc chắn muốn XÓA VĨNH VIỄN [${name}] không? Khuyến nghị nên dùng nút "Tắt" thay vì xóa.`,
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

  // 🔥 HÀM TẢI MÃ QR XUỐNG DƯỚI DẠNG ẢNH
  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Order_${qrModal.table.area}_${qrModal.table.name}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // 🔥 HÀM IN MÃ QR TRỰC TIẾP
  const printQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const dataUrl = canvas.toDataURL();
    const windowContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Mã QR Bàn</title>
          <style>
            body { text-align: center; font-family: sans-serif; padding-top: 50px; }
            h1 { font-size: 24px; color: #333; margin-bottom: 5px; }
            h2 { font-size: 18px; color: #666; margin-top: 0; }
            img { width: 250px; height: 250px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Quét Mã Để Gọi Món</h1>
          <h2>Khu: ${qrModal.table.area} - Bàn: ${qrModal.table.name}</h2>
          <img src="${dataUrl}" />
        </body>
      </html>
    `;
    const printWin = window.open('', '', 'width=400,height=500');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    
    // Đợi ảnh render xong rồi mới gọi hàm print
    printWin.onload = function() {
      printWin.focus();
      printWin.print();
      printWin.close();
    };
  };

  const groupedTables = tables.reduce((group, table) => {
    const areaName = table.area || "Chưa phân khu"; 
    if (!group[areaName]) group[areaName] = [];
    group[areaName].push(table);
    return group;
  }, {});

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
              
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{area}</h2>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold">
                    {groupedTables[area].length} bàn
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {groupedTables[area].map((table) => {
                  const isActive = table.isActive !== false; // Mặc định là true

                  return (
                    // 🟢 NẾU BÀN BỊ TẮT: Làm mờ thẻ (opacity-60) và đổi màu border
                    <div 
                      key={table.id} 
                      className={`border-2 rounded-xl transition-all p-4 relative group ${
                        isActive 
                          ? 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md' 
                          : 'bg-gray-50 border-gray-200 opacity-70 grayscale-[50%]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-lg font-bold truncate pr-8 ${isActive ? 'text-gray-800' : 'text-gray-500 line-through decoration-gray-400'}`} title={table.name}>
                          {table.name}
                        </h3>
                        
                        {/* Nhóm Nút Sửa/Xóa (ẩn khi không hover) */}
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
                          <button onClick={() => handleOpenModal(table)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Chỉnh sửa">
                            <FiEdit size={16} />
                          </button>
                          {/* Vẫn giữ nút xóa cứng phòng khi cần thiết, nhưng có thể ẩn đi nếu muốn */}
                          <button onClick={() => handleDelete(table.id, table.name)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Xóa vĩnh viễn">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Thông tin sức chứa & Công tắc Bật/Tắt */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <FiUsers /> 
                          <span><b className={isActive ? "text-gray-700" : "text-gray-400"}>{table.capacity}</b> người</span>
                        </div>

                        {/* 🔥 CÔNG TẮC BẬT/TẮT (TOGGLE SWITCH) */}
                        <label 
                          className="relative inline-flex items-center cursor-pointer" 
                          title={isActive ? "Đang hoạt động" : "Đã tạm ngưng"}
                        >
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isActive} 
                            onChange={() => handleToggleStatus(table)} 
                          />
                          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* 🟢 NÚT TẠO QR MỚI THÊM */}
                      {isActive && (
                        <button 
                          onClick={() => setQrModal({ isOpen: true, table })}
                          className="w-full mt-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold py-2 rounded-lg transition-colors border border-slate-200"
                        >
                          <FiMaximize /> Lấy Mã QR
                        </button>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          ))
        )}

      </div>

      {/* 🟢 MODAL TẠO & XEM MÃ QR */}
      {qrModal.isOpen && qrModal.table && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm flex flex-col animate-fade-in-down">
            
            <div className="bg-emerald-600 p-5 text-center relative">
              <button 
                onClick={() => setQrModal({ isOpen: false, table: null })}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                ✕
              </button>
              <h2 className="text-white font-black text-xl uppercase tracking-wider">Mã Gọi Món</h2>
              <p className="text-emerald-100 text-sm font-medium mt-1">Dành cho Khách hàng tự Order</p>
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Khu Vực: {qrModal.table.area}</p>
                <p className="text-3xl font-black text-gray-800">{qrModal.table.name}</p>
              </div>

              {/* Vùng chứa QR Code (Bọc ref để tải ảnh) */}
              <div ref={qrRef} className="p-4 bg-white border-4 border-emerald-100 rounded-xl shadow-sm mb-6">
                <QRCodeCanvas 
                  // 🚨 QUAN TRỌNG: Sửa lại đường link này bằng tên miền website cho khách của bạn
                  value={`${window.location.origin}/order/${qrModal.table.id}`}
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#0f172a"}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={printQRCode}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  <FiPrinter className="text-lg" /> In Mã
                </button>
                <button 
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200"
                >
                  <FiDownload className="text-lg" /> Tải Xuống
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA BÀN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-96 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực *</label>
                <input 
                  type="text"
                  list="area-suggestions" 
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  placeholder="Chọn khu vực hoặc gõ tên mới..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <datalist id="area-suggestions">
                  {existingAreas.map((area) => (
                    <option key={area} value={area} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-500 mt-1">Gõ một tên bất kỳ để tạo khu vực mới.</p>
              </div>

              {/* Tùy chọn trạng thái ngay trong Form */}
              <div className="flex items-center gap-3 pt-2">
                <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-600">{formData.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}</span>
                </label>
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

      {/* DIALOG XÁC NHẬN XÓA CỨNG */}
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