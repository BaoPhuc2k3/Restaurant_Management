import React, { useState, useMemo } from "react";

export default function PaymentModal({
  table,
  order,
  summary,
  customerPhone,
  onClose,
  onConfirm
}) {
  // Chỉ có 2 trạng thái: CASH (Tiền mặt) và TRANSFER (Chuyển khoản)
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const now = useMemo(() => new Date(), []);

  // ==========================================
  // CẤU HÌNH TÀI KHOẢN NGÂN HÀNG CỦA QUÁN (VIETQR)
  // ==========================================
  const BANK_ID = "MB"; // Mã ngân hàng (VD: MB, VCB, TCB, VPB, ACB...)
  const ACCOUNT_NO = "0987654321"; // Số tài khoản của quán
  const ACCOUNT_NAME = "TEN CHU QUAN"; // Tên chủ tài khoản (Không dấu)
  
  // Tạo link ảnh QR động dựa trên tổng tiền
  const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${summary?.finalAmount}&addInfo=Thanh toan ban ${table?.tableName}&accountName=${ACCOUNT_NAME}`;

  const handleConfirm = () => {
    onConfirm({
      paymentMethod, // Sẽ gửi "CASH" hoặc "TRANSFER" lên POSPage
      finalAmount: summary.finalAmount
    });
  };

  if (!summary || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white w-100 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-lg text-gray-800">
            Thanh toán - {table?.tableName}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-xl">
            ✕
          </button>
        </div>

        {/* BILL PREVIEW (Đã ẩn Tiền khách đưa/Tiền thối theo yêu cầu trước) */}
        <div className="p-5 text-sm overflow-y-auto flex-1">
          <div className="text-center font-bold text-lg mb-1">HÓA ĐƠN BÁN HÀNG</div>
          <div className="text-center text-xs text-gray-500 mb-4">
            {now.toLocaleDateString("vi-VN")} - {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </div>

          {/* ITEM LIST */}
          <div className="space-y-2 mb-4">
            {order.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <div className="font-medium">
                  {(item.price * item.quantity).toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tổng tiền hàng:</span>
              <span>{summary.subtotal.toLocaleString()}đ</span>
            </div>
            
            {(summary.percentDiscount > 0 || summary.voucherDiscount > 0) && (
              <div className="flex justify-between text-red-500">
                <span>Giảm giá:</span>
                <span>-{(summary.percentDiscount + summary.voucherDiscount).toLocaleString()}đ</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2 text-teal-700">
              <span>CẦN THANH TOÁN:</span>
              <span>{summary.finalAmount.toLocaleString()}đ</span>
            </div>
          </div>
        </div>

        {/* PHƯƠNG THỨC THANH TOÁN & QR CODE */}
        <div className="p-4 border-t bg-gray-100">
          <div className="font-semibold mb-3 text-gray-700">Hình thức thanh toán:</div>
          
          <div className="flex gap-4 mb-4">
            <label className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded cursor-pointer font-medium transition-all ${paymentMethod === "CASH" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
              <input type="radio" className="hidden" value="CASH" checked={paymentMethod === "CASH"} onChange={() => setPaymentMethod("CASH")} />
              💵 Tiền mặt
            </label>

            <label className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded cursor-pointer font-medium transition-all ${paymentMethod === "TRANSFER" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
              <input type="radio" className="hidden" value="TRANSFER" checked={paymentMethod === "TRANSFER"} onChange={() => setPaymentMethod("TRANSFER")} />
              💳 Chuyển khoản
            </label>
          </div>

          {/* HIỂN THỊ MÃ QR NẾU CHỌN CHUYỂN KHOẢN */}
          {paymentMethod === "TRANSFER" && (
            <div className="bg-white p-3 rounded-lg border shadow-sm mb-4 flex flex-col items-center animate-fade-in">
              <p className="text-xs text-gray-500 mb-2 font-medium">Khách hàng quét mã QR để thanh toán</p>
              <img 
                src={qrCodeUrl} 
                alt="VietQR" 
                className="w-48 h-48 object-contain border rounded p-1"
                loading="lazy"
              />
              <p className="text-lg font-bold text-red-600 mt-2">{summary.finalAmount.toLocaleString()} VNĐ</p>
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold text-base shadow-md transition-all active:scale-95"
          >
            {paymentMethod === "CASH" ? "XÁC NHẬN ĐÃ THU TIỀN MẶT" : "XÁC NHẬN KHÁCH ĐÃ CHUYỂN KHOẢN"}
          </button>
        </div>

      </div>
    </div>
  );
}