import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../API/axios";
import { FiAlertCircle, FiSend, FiTrash2 } from "react-icons/fi";

/* ============================================= */
/* HELPER: TÍNH TỔNG ĐƠN HÀNG                    */
/* ============================================= */
const calculateOrderSummary = ({ items, discountPercent, extraFee, voucher }) => {
  // Bỏ qua các món đã hủy (itemStatus === 4) khi tính tiền
  const validItems = items.filter(item => item.itemStatus !== 4);
  
  const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const percentDiscount = subtotal * (discountPercent / 100);
  let voucherDiscount = 0;

  if (voucher) {
    if (voucher.type === "FixedAmount") {
      voucherDiscount = voucher.discountValue;
    } else if (voucher.type === "Percentage") {
      voucherDiscount = subtotal * (voucher.discountValue / 100);
      if (voucher.maxDiscountAmount > 0 && voucherDiscount > voucher.maxDiscountAmount) {
        voucherDiscount = voucher.maxDiscountAmount;
      }
    }
  }

  const total = subtotal - percentDiscount - voucherDiscount + Number(extraFee);

  return {
    subtotal,
    percentDiscount,
    voucherDiscount,
    finalAmount: Math.max(0, total)
  };
};

/* ============================================= */
/* CẤU HÌNH TRẠNG THÁI MÓN ĂN (KDS)              */
/* ============================================= */
const STATUS_UI = {
  0: { label: "Chờ bếp", bg: "bg-gray-200 text-gray-700" },
  1: { label: "Đang nấu", bg: "bg-orange-100 text-orange-700 animate-pulse border border-orange-200" },
  2: { label: "Đã xong", bg: "bg-green-100 text-green-700 font-bold border border-green-200" },
  3: { label: "Đã lên bàn", bg: "bg-blue-50 text-blue-500" },
  4: { label: "Đã hủy", bg: "bg-red-50 text-red-500 line-through" }
};

/* ============================================= */
/* COMPONENT CHÍNH                               */
/* ============================================= */
export default function OrderPanel({
  table,
  order = [],
  orderStatus,
  customerPhone = "",
  selectedVoucher,
  onUpdateOrderInfo,
  onIncrease,
  onDecrease,
  onRemove,
  onPayment,
  onCancelOrder,
  
  // 🔥 2 PROPS MỚI THÊM CHO KDS:
  onSendToKitchen, // Hàm gọi khi bấm nút Báo bếp
  onRequestCancelItem // Hàm gọi khi thu ngân muốn hủy món ĐÃ GỬI BẾP
}) {
  const [customerData, setCustomerData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [vouchers, setVouchers] = useState([]);

  const [discountPercent, setDiscountPercent] = useState(0);
  const [extraFee, setExtraFee] = useState(0);
  const [cashGiven, setCashGiven] = useState(0);

  useEffect(() => {
    setDiscountPercent(0);
    setExtraFee(0);
    setCashGiven(0);
    // Lưu ý: customerPhone và selectedVoucher đã được quản lý bởi hàm onUpdateOrderInfo từ component cha,
    // nên nếu cha làm đúng, chúng sẽ tự reset. Ở đây ta chỉ reset state nội bộ của OrderPanel.
  }, [table?.id]);

  /* === LOAD DỮ LIỆU KHÁCH & VOUCHER (Giữ nguyên của bạn) === */
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const res = await api.get("/customers/vouchers");
        setVouchers(res.data);
      } catch (err) { console.error("Load voucher error:", err); }
    };
    loadVouchers();
  }, []);

  useEffect(() => {
    const cleanPhone = (customerPhone || "").trim();
    if (!/^0\d{9}$/.test(cleanPhone)) {
      setCustomerData(null);
      return;
    }
    const fetchCustomer = async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/customers/phone/${cleanPhone}`);
        setCustomerData(res.data);
      } catch (error) {
        if (error.response?.status === 404) setCustomerData({ points: 0 });
      } finally { setIsSearching(false); }
    };
    const delay = setTimeout(fetchCustomer, 400);
    return () => clearTimeout(delay);
  }, [customerPhone]);

  const validVouchers = useMemo(() => {
    if (!customerData) return [];
    return vouchers.filter(v => customerData.points >= v.requiredPoints);
  }, [vouchers, customerData]);

  useEffect(() => {
    if (selectedVoucher && (!customerData || customerData.points < selectedVoucher.requiredPoints)) {
      onUpdateOrderInfo({ selectedVoucher: null });
    }
  }, [customerData, selectedVoucher, onUpdateOrderInfo]);

  /* === TÍNH TOÁN TIỀN & PHÂN LOẠI MÓN === */
  const summary = useMemo(() => calculateOrderSummary({ items: order, discountPercent, extraFee, voucher: selectedVoucher }), [order, discountPercent, extraFee, selectedVoucher]);
  const change = useMemo(() => Math.max(0, cashGiven - summary.finalAmount), [cashGiven, summary.finalAmount]);
  const handleQuickCash = useCallback(amount => setCashGiven(prev => prev + amount), []);

  // 🔥 TÁCH ORDER THÀNH 2 NHÓM: ĐÃ GỬI BẾP & CHƯA GỬI
  const sentItems = order.filter(item => item.isSent);
  const unsentItems = order.filter(item => !item.isSent);
  const isPaid = orderStatus === 4 || orderStatus === "Paid"; 

  const displaySentItems = useMemo(() => {
    const result = [];
    const mergedMap = {};

    sentItems.forEach(item => {
      // Chỉ gộp nếu món Đã lên bàn (3) hoặc Đã hủy (4)
      if (item.itemStatus === 3 || item.itemStatus === 4) {
        const key = `${item.id}-${item.itemStatus}`; // Gộp theo ID món + Trạng thái
        if (!mergedMap[key]) {
          mergedMap[key] = { ...item };
          result.push(mergedMap[key]);
        } else {
          mergedMap[key].quantity += item.quantity; // Cộng dồn số lượng
        }
      } else {
        // Các món 0, 1, 2 (Chờ/Đang nấu/Đã xong) phải giữ nguyên từng dòng độc lập
        // Để thu ngân còn bấm nút "Hủy/Đổi" theo đúng mã orderDetailId
        result.push({ ...item });
      }
    });

    return result;
  }, [sentItems]);

  /* === RENDER === */
  if (!table) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Chọn bàn để bắt đầu order
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-md rounded-lg overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500 font-semibold mb-1">ĐANG PHỤC VỤ</div>
            <h2 className="text-2xl font-bold text-teal-700 uppercase">{table.tableName}</h2>
          </div>
          <div className="text-sm text-gray-500 text-right">
            <div>{new Date().toLocaleDateString("vi-VN")}</div>
            <div className="font-bold text-gray-700">
              {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        <input
          type="text"
          placeholder="Nhập SĐT khách để tích điểm..."
          value={customerPhone}
          onChange={e => onUpdateOrderInfo({ customerPhone: e.target.value })}
          className="w-full mt-3 border rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 transition-colors"
        />
        <div className="text-xs mt-1 h-4">
          {isSearching && <span className="text-blue-500">Đang tìm...</span>}
          {customerData && <span className="text-green-600 font-semibold">Điểm: {customerData.points}</span>}
        </div>
      </div>

      {/* DANH SÁCH MÓN (ITEM LIST) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        <div className="grid grid-cols-12 text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2 border-b bg-white sticky top-0 z-10">
          <div className="col-span-5">Món ăn</div>
          <div className="col-span-2 text-center">SL</div>
          <div className="col-span-2 text-right">Giá</div>
          <div className="col-span-3 text-right">Thành tiền</div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {order.length === 0 && (
            <div className="text-center text-gray-400 mt-10 text-sm">Chưa có món nào được chọn</div>
          )}

          {/* KHU VỰC 1: CÁC MÓN ĐÃ BÁO BẾP */}
          {displaySentItems.length > 0 && (
            <div className="bg-white rounded border shadow-sm overflow-hidden">
              <div className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 uppercase flex justify-between">
                <span>Đã báo bếp</span>
                <span>{displaySentItems.reduce((sum, i) => sum + i.quantity, 0)} món</span>
              </div>
              {displaySentItems.map((item, index) => {
                const isCancelled = item.itemStatus === 4;
                const statusInfo = STATUS_UI[item.itemStatus] || STATUS_UI[0];
                const uniqueKey = `sent-${item.orderDetailId || item.id}-${index}`;
                
                return (
                  <div key={uniqueKey} className={`grid grid-cols-12 items-center text-sm px-3 py-2 border-b last:border-0 ${isCancelled ? 'opacity-50 bg-red-50' : 'hover:bg-gray-50'}`}>
                    <div className="col-span-5 flex flex-col items-start">
                      <span className={`font-medium ${isCancelled ? 'line-through' : ''}`}>{item.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit mt-1 ${statusInfo.bg}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="col-span-2 text-center font-semibold text-gray-700">x{item.quantity}</div>
                    <div className="col-span-2 text-right text-gray-500 text-xs">{item.price.toLocaleString()}</div>
                    
                    <div className="col-span-3 flex flex-col items-end justify-center gap-1">
                      <span className={`font-semibold ${isCancelled ? 'text-gray-400 line-through' : 'text-teal-600'}`}>
                        {(item.price * item.quantity).toLocaleString()}
                      </span>
                      {/* Nút Xin Hủy món (chỉ hiện khi chưa hủy và chưa bưng ra) */}
                      {!isCancelled && item.itemStatus < 1 && !isPaid && (
                        <button onClick={() => onRequestCancelItem(item)} className="text-[10px] text-red-500 hover:text-red-700 underline">
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* KHU VỰC 2: CÁC MÓN MỚI CHỌN (CHƯA BÁO BẾP) */}
          {unsentItems.length > 0 && (
            <div className="bg-teal-50 rounded border border-teal-200 shadow-sm overflow-hidden">
              <div className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1.5 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                Món mới gọi (Chưa gửi)
              </div>
              {unsentItems.map((item, index) => {
                const uniqueKey = `sent-${item.orderDetailId || item.id}-${index}`;
                return(
                <div key={uniqueKey} className="grid grid-cols-12 items-center text-sm px-3 py-2 border-b border-teal-100 last:border-0 hover:bg-teal-100/50">
                  <div className="col-span-4 font-medium  text-teal-900 truncate">{item.name}</div>
                  
                  {/* Nút cộng trừ (chỉ cho phép ở món chưa báo bếp) */}
                  <div className="col-span-3 flex justify-center items-center gap-1">
                    <button onClick={() => onDecrease(item.id)} className="w-6 h-6 bg-white border border-gray-300 text-gray-600 rounded flex items-center justify-center hover:bg-gray-100">−</button>
                    <span className="w-6 text-center font-bold text-teal-800">{item.quantity}</span>
                    <button onClick={() => onIncrease(item.id)} className="w-6 h-6 bg-teal-500 text-white rounded flex items-center justify-center hover:bg-teal-600">+</button>
                  </div>
                  
                  <div className="col-span-2 text-right text-teal-700/70 text-xs">{item.price.toLocaleString()}</div>
                  
                  <div className="col-span-3 flex justify-end items-center gap-2">
                    <span className="font-semibold text-teal-700">{(item.price * item.quantity).toLocaleString()}</span>
                    <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600 p-1">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER - KHU VỰC THANH TOÁN */}
      <div className="border-t bg-white p-4 text-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {/* THÔNG TIN THANH TOÁN (Giữ nguyên logic của bạn) */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2">
            <label className="w-16 text-gray-500 text-xs font-semibold uppercase">Giảm %</label>
            <input type="number" 
                   disabled={isPaid}
                   placeholder="0"
                   value={discountPercent == 0 ? "" : discountPercent} 
                   onChange={e => {
                       const val = e.target.value;
                       setDiscountPercent(val === "" ? 0 : Number(val)); 
            }} className="flex-1 border rounded px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:border-teal-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-16 text-gray-500 text-xs font-semibold uppercase">Phụ thu</label>
            <input type="number" 
                   disabled={isPaid}
                   placeholder="0"
                   value={extraFee == 0 ? "" : extraFee} 
                   onChange={e => {
                       const val = e.target.value;
                       setExtraFee(val === "" ? 0 : Number(val));
            }} className="flex-1 border rounded px-2 py-1 text-sm bg-gray-50 focus:bg-white focus:border-teal-500" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <label className="w-16 text-gray-500 text-xs font-semibold uppercase">Voucher</label>
          <select value={selectedVoucher?.id || 0} onChange={e => {
            const v = validVouchers.find(x => x.id === Number(e.target.value));
            onUpdateOrderInfo({ selectedVoucher: v || null });
          }} className="flex-1 border rounded px-2 py-1.5 text-sm bg-gray-50">
            <option value={0}>Không áp dụng</option>
            {validVouchers.map(v => (
              <option key={v.id} value={v.id}>
                {v.code} - Giảm {v.type === "Percentage" ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}
              </option>
            ))}
          </select>
        </div>

        {/* SUMMARY TIỀN */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 space-y-1">
          <div className="flex justify-between text-gray-500 text-xs">
            <span>Tổng tiền món</span>
            <span>{summary.subtotal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between font-bold items-center pt-1 border-t border-gray-200 mt-1">
            <span className="text-gray-700 uppercase tracking-wide">Phải thanh toán</span>
            <span className="text-red-500 text-xl">{summary.finalAmount.toLocaleString()}đ</span>
          </div>
        </div>

        {/* ACTIONS BÊN DƯỚI CÙNG */}
        <div className="flex gap-2">
          {/* Nút hủy đơn: Luôn giữ nguyên */}
          <button 
            onClick={onCancelOrder} disabled={!table}
            className="px-4 bg-gray-200 text-gray-700 py-3 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors"
          >
            Hủy bàn
          </button>

          {/* NẾU CÓ MÓN MỚI -> HIỆN NÚT BÁO BẾP TO. NẾU KHÔNG CÓ -> HIỆN NÚT THANH TOÁN */}
          {unsentItems.length > 0 ? (
            <button
              disabled={isPaid}
              onClick={onSendToKitchen}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg text-base font-bold shadow-lg hover:bg-orange-600 flex justify-center items-center gap-2 animate-bounce-short"
            >
              <FiSend className="text-xl" /> BÁO BẾP ({unsentItems.length})
            </button>
          ) : (
            <button
              onClick={() => {
                if (order.length === 0 || isPaid){
                  e.preventDefault();
                  return;
                };
                const cleanPhone = (customerPhone || "").trim();
                if (cleanPhone && !/^0\d{9}$/.test(cleanPhone)) { alert("SĐT không hợp lệ"); return; }
                onPayment({ summary, cashGiven, change, extraFee, discountPercent});
              }}
              disabled={isPaid}
              className={`flex-1 text-white py-3 rounded-lg text-base font-bold shadow-md transition-colors ${order.length > 0 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isPaid ? "ĐÃ THANH TOÁN ✓" : "THANH TOÁN"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}