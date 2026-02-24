import React, { useState, useMemo } from "react";

export default function PaymentModal({
  table,
  order,
  summary,
  customerPhone,
  cashGiven,
  change,
  onClose,
  onConfirm
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const now = useMemo(() => new Date(), []);

  const handleConfirm = () => {
    onConfirm({
      paymentMethod,
      finalAmount: summary.finalAmount,
      cashGiven,
      change
    });
  };
  if (!summary || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white w-105 rounded-lg shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            Xác nhận thanh toán
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* BILL PREVIEW */}
        <div className="p-4 text-sm">

          <div className="text-center font-semibold text-base mb-1">
            HÓA ĐƠN BÁN HÀNG
          </div>

          <div className="text-center text-xs text-gray-500 mb-3">
            {now.toLocaleDateString("vi-VN")} -{" "}
            {now.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>

          <div className="text-xs mb-2">
            <div>Bàn: {table?.tableName}</div>
            {customerPhone && <div>SĐT: {customerPhone}</div>}
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-12 text-xs font-semibold border-b pb-1 mb-1">
            <div className="col-span-5">Mặt hàng</div>
            <div className="col-span-2 text-center">SL</div>
            <div className="col-span-2 text-right">Đ.Giá</div>
            <div className="col-span-3 text-right">T.Tiền</div>
          </div>

          {/* ITEMS */}
          <div className="max-h-40 overflow-y-auto mb-2">
            {order.map(item => (
              <div
                key={item.id}
                className="grid grid-cols-12 text-xs py-1"
              >
                <div className="col-span-5 truncate">
                  {item.name}
                </div>

                <div className="col-span-2 text-center">
                  {item.quantity}
                </div>

                <div className="col-span-2 text-right">
                  {item.price.toLocaleString()}
                </div>

                <div className="col-span-3 text-right font-medium">
                  {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-2 space-y-1 text-xs">

            <div className="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span>{summary.subtotal.toLocaleString()}đ</span>
            </div>

            {summary.percentDiscount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Giảm %:</span>
                <span>-{summary.percentDiscount.toLocaleString()}đ</span>
              </div>
            )}

            {summary.voucherDiscount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Voucher:</span>
                <span>-{summary.voucherDiscount.toLocaleString()}đ</span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-base pt-1 border-t mt-1">
              <span>TỔNG CỘNG:</span>
              <span>
                {summary.finalAmount.toLocaleString()}đ
              </span>
            </div>

            {paymentMethod === "CASH" && (
              <>
                <div className="flex justify-between">
                  <span>Khách đưa:</span>
                  <span>{cashGiven.toLocaleString()}đ</span>
                </div>

                <div className="flex justify-between">
                  <span>Tiền thối:</span>
                  <span>{change.toLocaleString()}đ</span>
                </div>
              </>
            )}

          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div className="px-4 py-3 border-t bg-gray-50 text-sm">

          <div className="mb-2 font-medium">
            Hình thức thanh toán
          </div>

          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={paymentMethod === "CASH"}
                onChange={() => setPaymentMethod("CASH")}
              />
              Tiền mặt
            </label>

            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={paymentMethod === "TRANSFER"}
                onChange={() => setPaymentMethod("TRANSFER")}
              />
              Chuyển khoản
            </label>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            XÁC NHẬN & IN HÓA ĐƠN
          </button>
        </div>
      </div>
    </div>
  );
}