import React, { useState } from "react";

export default function PaymentModal({ table, order, onClose, onConfirm }) {
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalAmount = total - total * (discount / 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">
          Thanh toán: {table?.tableName}
        </h2>

        {/* Danh sách món tóm tắt */}
        <div className="max-h-40 overflow-y-auto mb-4 text-sm">
          {order.map((item) => (
            <div key={item.id} className="flex justify-between py-1 border-bottom">
              <span>{item.name} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()}đ</span>
            </div>
          ))}
        </div>

        {/* Thiết lập thanh toán */}
        <div className="space-y-3 bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-center">
            <span>Tạm tính:</span>
            <span className="font-semibold">{total.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Chiết khấu (%):</span>
            <input 
              type="number" 
              className="w-16 border rounded px-1 text-right"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-between items-center">
            <span>Phương thức:</span>
            <select 
              className="border rounded p-1"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
              <option value="Thẻ">Thẻ ATM/Visa</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center text-lg font-bold text-teal-700">
          <span>THÀNH TIỀN:</span>
          <span>{finalAmount.toLocaleString()}đ</span>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded font-semibold">Hủy</button>
          <button 
            onClick={() => onConfirm({ discount, paymentMethod, finalAmount })}
            className="flex-1 py-2 bg-teal-600 text-white rounded font-semibold hover:bg-teal-700"
          >
            XÁC NHẬN
          </button>
        </div>
      </div>
    </div>
  );
}