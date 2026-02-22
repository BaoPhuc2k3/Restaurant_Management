import React, { useState, useEffect } from "react";

// GIẢ LẬP DỮ LIỆU: Danh sách các Voucher mà nhà hàng đang chạy chương trình
// (Thực tế bạn sẽ lấy danh sách này từ API khi trang vừa load xong)
const ACTIVE_VOUCHERS = [
  { id: 1, name: "Giảm 20.000đ", type: "fixed", value: 20000, requiredPoints: 10 },
  { id: 2, name: "Giảm 50.000đ", type: "fixed", value: 50000, requiredPoints: 25 },
  { id: 3, name: "Giảm 10%", type: "percent", value: 10, requiredPoints: 15 },
];

export default function OrderPanel({ table, order, onIncrease, onDecrease, onRemove, onPayment }) {
  // 1. State quản lý Số điện thoại và Khách hàng
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState(null); // Lưu thông tin { points: ... }
  const [isSearching, setIsSearching] = useState(false);

  // 2. State quản lý Thanh toán
  const [selectedVoucherId, setSelectedVoucherId] = useState("");

  // ==========================================
  // THUẬT TOÁN DEBOUNCE TÌM KIẾM KHÁCH HÀNG
  // ==========================================
  useEffect(() => {
    // Chỉ tìm kiếm nếu số điện thoại nhập vào đủ 10 số (Định dạng VN)
    const isValidPhone = /^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone);

    if (isValidPhone) {
      setIsSearching(true);
      
      // Tạo một bộ đếm thời gian (Debounce 500ms)
      const timer = setTimeout(async () => {
        try {
          // TODO: Thay bằng API thật của bạn, ví dụ:
          // const response = await api.get(`/customers/phone/${phone}`);
          // setCustomer(response.data);

          // GIẢ LẬP KẾT QUẢ API (Bạn xóa phần này khi có API thật)
          if (phone === "0987654321") {
            setCustomer({ phone: "0987654321", points: 20 }); // Khách quen, có 20 điểm
          } else {
            setCustomer({ phone: phone, points: 0 }); // Khách mới tinh
          }
        } catch (error) {
          console.error("Lỗi tìm khách hàng", error);
          setCustomer(null);
        } finally {
          setIsSearching(false);
        }
      }, 500); // Đợi 0.5 giây sau lần gõ phím cuối cùng mới chạy

      // Cleanup function: Xóa bộ đếm cũ nếu nhân viên gõ tiếp
      return () => clearTimeout(timer);
    } else {
      // Nếu xóa đi hoặc gõ chưa đủ số -> Reset lại thông tin
      setCustomer(null);
      setSelectedVoucherId(""); 
    }
  }, [phone]);

  // ==========================================
  // LOGIC TÍNH TIỀN & VOUCHER
  // ==========================================
  if (!table) return <div className="flex items-center justify-center h-full text-gray-500 bg-white">Chọn bàn để bắt đầu</div>;

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Tính tiền giảm từ Voucher được chọn
  let discountValue = 0;
  const selectedVoucher = ACTIVE_VOUCHERS.find(v => v.id === Number(selectedVoucherId));
  
  if (selectedVoucher) {
    if (selectedVoucher.type === "fixed") discountValue = selectedVoucher.value;
    else if (selectedVoucher.type === "percent") discountValue = total * (selectedVoucher.value / 100);
  }

  const finalAmount = Math.max(0, total - discountValue);

  return (
    <div className="flex flex-col h-full bg-white p-4">
      {/* HEADER & TÌM KIẾM SĐT */}
      <div className="mb-2">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-2xl font-bold text-teal-800 uppercase leading-none">{table.tableName}</h2>
        </div>

        <div className="relative mt-3">
          <input
            type="text"
            placeholder="🔍 Nhập SĐT tích điểm (vd: 0987654321)..."
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10} // Chặn nhập quá 10 số
          />
          
          {/* Trạng thái tìm kiếm & Hiển thị điểm */}
          <div className="text-xs mt-1 h-4">
            {isSearching && <span className="text-blue-500 animate-pulse">Đang tìm dữ liệu...</span>}
            {!isSearching && customer && (
              <span className="text-green-600 font-semibold">
                ✓ Khách hàng có: {customer.points} điểm
              </span>
            )}
            {!isSearching && phone.length === 10 && !customer && (
              <span className="text-gray-500">Khách hàng mới (Sẽ được tạo sau khi thanh toán)</span>
            )}
          </div>
        </div>
      </div>

      {/* DANH SÁCH MÓN ĂN (Giữ nguyên như cũ) */}
      <div className="flex items-center text-xs font-semibold text-gray-500 border-b pb-2 mb-2 px-1">
        <div className="w-8 text-center">#</div><div className="flex-1">Món</div><div className="w-24 text-center">SL</div><div className="w-20 text-right">ĐG</div><div className="w-24 text-right pr-6">TT</div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {/* ... (Phần map danh sách món ăn bạn giữ nguyên code của mình ở bước trước) ... */}
      </div>

      {/* KHU VỰC THANH TOÁN */}
      <div className="border-t border-gray-200 pt-3 mt-2 bg-white">
        
        {/* Ô CHỌN VOUCHER THÔNG MINH */}
        <div className="flex flex-col mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Đổi điểm lấy Voucher:</span>
            <select 
              className={`border rounded-md px-2 py-1.5 text-sm outline-none focus:ring-1 w-1/2 
                ${!customer || customer.points === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-50 border-green-300 text-green-700'}`}
              value={selectedVoucherId}
              onChange={(e) => setSelectedVoucherId(e.target.value)}
              disabled={!customer} // Khóa ô này nếu chưa có số điện thoại hợp lệ
            >
              <option value="">Không dùng</option>
              {ACTIVE_VOUCHERS.map(v => (
                <option 
                  key={v.id} 
                  value={v.id} 
                  // Khóa các Voucher mà khách không đủ điểm đổi
                  disabled={!customer || customer.points < v.requiredPoints}
                >
                  {v.name} (Cần {v.requiredPoints} điểm)
                </option>
              ))}
            </select>
          </div>
          {/* Cảnh báo nhẹ nếu khách chọn voucher nhưng điểm không đủ (phòng hờ) */}
          {selectedVoucher && customer && customer.points < selectedVoucher.requiredPoints && (
             <span className="text-[10px] text-red-500 text-right mt-1">Không đủ điểm để dùng Voucher này!</span>
          )}
        </div>

        {/* TỔNG TIỀN */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
          <span>Tổng tiền hàng:</span><span className="font-semibold">{total.toLocaleString()}đ</span>
        </div>
        {discountValue > 0 && (
           <div className="flex justify-between items-center text-sm text-green-600 mb-1">
             <span>Chiết khấu (Đổi điểm):</span><span className="font-semibold">- {discountValue.toLocaleString()}đ</span>
           </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-gray-800 text-lg">Khách phải trả:</span>
          <span className="font-black text-2xl text-red-600">{finalAmount.toLocaleString()}đ</span>
        </div>

        {/* NÚT THANH TOÁN */}
        <div className="flex gap-2">
          {/* ... (Các nút Hủy/Chuyển gộp giữ nguyên) ... */}
          <button
            // Truyền tất cả dữ liệu sang hàm xử lý thanh toán ở POSPage
            onClick={() => onPayment({ 
              phone: phone, 
              usedVoucher: selectedVoucher, 
              finalAmount 
            })} 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-bold uppercase transition-colors shadow-sm"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}