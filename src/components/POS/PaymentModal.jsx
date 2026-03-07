import React, { useState, useMemo } from "react";

export default function PaymentModal({
  table,
  order,
  summary,
  customerPhone,
  onClose,
  onConfirm
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const now = useMemo(() => new Date(), []);
  
  // Lấy tên nhân viên
  const staffName = localStorage.getItem("fullName") || "N/A";

  const BANK_ID = "MB"; 
  const ACCOUNT_NO = "038780310003100"; 
  const ACCOUNT_NAME = "LE BAO PHUCPHUC"; 
  
  const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${summary?.finalAmount}&addInfo=Thanh toan ban ${table?.tableName}&accountName=${ACCOUNT_NAME}`;

  const handleConfirm = () => {
    onConfirm({
      paymentMethod,
      finalAmount: summary.finalAmount
    });
  };

  if (!summary || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      {/* Cố định kích thước Modal */}
      <div className="bg-white w-full max-w-95 h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <span className="font-bold text-teal-800 text-sm">Thanh toán {table?.tableName}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl leading-none">×</button>
        </div>

        {/* TTHÔNG TIN CHUNG */}
        <div className="px-5 py-4 shrink-0 bg-white">
          <div className="text-center font-bold text-sm tracking-widest mb-3">HÓA ĐƠN TẠM TÍNH</div>
          <div className="space-y-1 text-[11px] text-gray-500 border-b border-dashed pb-3">
            <div className="flex justify-between">
              <span>Ngày: {now.toLocaleDateString("vi-VN")}</span>
              <span>Giờ: {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex justify-between uppercase">
              <span>Thu ngân: {staffName}</span>
              {customerPhone && <span>SĐT: {customerPhone}</span>}
            </div>
          </div>
        </div>

        {/* DANH SÁCH MÓN */}
        <div className="flex-1 overflow-y-auto px-5 scrollbar-hide">
          <div className="space-y-2">
            {order.filter(item => item.itemStatus !== 4)
            .map((item, idx) => (
              <div key={item.id} className="flex justify-between text-[12px] items-start group">
                <div className="flex gap-2 flex-1 mr-2">
                  <span className="text-gray-400 w-3">{idx + 1}.</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800 leading-tight">{item.name}</span>
                    <span className="text-[10px] text-gray-400">{item.price.toLocaleString()} x {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-gray-700">{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TỔNG TIỀN VÀ THANH TOÁN (CỐ ĐỊNH) */}
        <div className="shrink-0 bg-white shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="px-5 py-3 space-y-1.5 border-t border-dashed border-gray-200">
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Tạm tính:</span>
              <span>{summary.subtotal.toLocaleString()}đ</span>
            </div>
            
            {(summary.percentDiscount > 0 || summary.voucherDiscount > 0) && (
              <div className="flex justify-between text-red-500 text-[11px]">
                <span>Giảm giá:</span>
                <span>-{(summary.percentDiscount + summary.voucherDiscount).toLocaleString()}đ</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg pt-2 text-teal-800">
              <span className="text-sm">TỔNG CỘNG:</span>
              <span>{summary.finalAmount.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Chọn hình thức & Nút xác nhận */}
          <div className="p-4 bg-gray-50 space-y-3">
            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentMethod("CASH")}
                className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${paymentMethod === "CASH" ? "bg-teal-700 text-white border-teal-700 shadow-md" : "bg-white text-gray-500 border-gray-200"}`}
              >
                TIỀN MẶT
              </button>
              <button 
                onClick={() => setPaymentMethod("TRANSFER")}
                className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${paymentMethod === "TRANSFER" ? "bg-teal-700 text-white border-teal-700 shadow-md" : "bg-white text-gray-500 border-gray-200"}`}
              >
                CHUYỂN KHOẢN
              </button>
            </div>

            {paymentMethod === "TRANSFER" && (
              <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-teal-100 animate-in fade-in zoom-in duration-200">
                <img src={qrCodeUrl} alt="VietQR" className="w-32 h-32 object-contain" />
                <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Quét mã chuyển khoản nhanh</p>
              </div>
            )}

            <button
              onClick={handleConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm shadow-lg active:scale-95 transition-all uppercase"
            >
              {paymentMethod === "CASH" ? "Hoàn tất thu tiền" : "Xác nhận đã nhận tiền"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}