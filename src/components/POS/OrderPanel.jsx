import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../API/axios";

/* ============================= */
/* UTIL: CALCULATE SUMMARY       */
/* ============================= */
const calculateOrderSummary = ({
  items,
  discountPercent,
  extraFee,
  voucher
}) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const percentDiscount = subtotal * (discountPercent / 100);

  let voucherDiscount = 0;

  if (voucher) {
    if (voucher.type === 1) {
      voucherDiscount = voucher.discountValue;
    } else if (voucher.type === 2) {
      voucherDiscount = subtotal * (voucher.discountValue / 100);
      if (
        voucher.maxDiscountAmount > 0 &&
        voucherDiscount > voucher.maxDiscountAmount
      ) {
        voucherDiscount = voucher.maxDiscountAmount;
      }
    }
  }

  const total =
    subtotal - percentDiscount - voucherDiscount + Number(extraFee);

  return {
    subtotal,
    percentDiscount,
    voucherDiscount,
    finalAmount: Math.max(0, total)
  };
};

/* ============================= */
/* COMPONENT                     */
/* ============================= */

export default function OrderPanel({
  table,
  order = [],
  customerPhone = "",
  selectedVoucher,
  onUpdateOrderInfo,
  onIncrease,
  onDecrease,
  onRemove,
  onPayment
}) {
  const [customerData, setCustomerData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [vouchers, setVouchers] = useState([]);

  const [discountPercent, setDiscountPercent] = useState(0);
  const [extraFee, setExtraFee] = useState(0);
  const [cashGiven, setCashGiven] = useState(0);

  /* ============================= */
  /* LOAD VOUCHERS                 */
  /* ============================= */

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const res = await api.get("/customers/vouchers");
        setVouchers(res.data);
      } catch (err) {
        console.error("Load voucher error:", err);
      }
    };
    loadVouchers();
  }, []);

  /* ============================= */
  /* LOAD CUSTOMER                 */
  /* ============================= */

  useEffect(() => {
    const cleanPhone = (customerPhone || "").trim();
    const isValid = /^0\d{9}$/.test(cleanPhone);

    if (!isValid) {
      setCustomerData(null);
      return;
    }

    const fetchCustomer = async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/customers/phone/${cleanPhone}`);
        setCustomerData(res.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setCustomerData({ points: 0 });
        } else {
          console.error(error);
        }
      } finally {
        setIsSearching(false);
      }
    };

    const delay = setTimeout(fetchCustomer, 400);
    return () => clearTimeout(delay);
  }, [customerPhone]);

  /* ============================= */
  /* FILTER VALID VOUCHERS         */
  /* ============================= */

  const validVouchers = useMemo(() => {
    if (!customerData) return [];
    return vouchers.filter(
      v => customerData.points >= v.requiredPoints
    );
  }, [vouchers, customerData]);

  /* Reset voucher nếu không đủ điểm */
  useEffect(() => {
    if (
      selectedVoucher &&
      (!customerData ||
        customerData.points < selectedVoucher.requiredPoints)
    ) {
      onUpdateOrderInfo({ selectedVoucher: null });
    }
  }, [customerData, selectedVoucher, onUpdateOrderInfo]);

  /* ============================= */
  /* CALCULATE MONEY (memoized)    */
  /* ============================= */

  const summary = useMemo(() => {
    return calculateOrderSummary({
      items: order,
      discountPercent,
      extraFee,
      voucher: selectedVoucher
    });
  }, [order, discountPercent, extraFee, selectedVoucher]);

  const change = useMemo(() => {
    return Math.max(0, cashGiven - summary.finalAmount);
  }, [cashGiven, summary.finalAmount]);

  /* ============================= */
  /* ACTIONS                       */
  /* ============================= */

  const handleQuickCash = useCallback(
    amount => setCashGiven(prev => prev + amount),
    []
  );

  if (!table) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Chọn bàn để bắt đầu order
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-md rounded-lg overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="p-4 border-b">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-gray-500">
              Chi tiết đặt bàn
            </div>
            <h2 className="text-2xl font-bold text-teal-700 uppercase">
              {table.tableName}
            </h2>
          </div>

          <div className="text-sm text-gray-500 text-right">
            <div>{new Date().toLocaleDateString("vi-VN")}</div>
            <div>
              {new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        </div>

        <input
          type="text"
          placeholder="Nhập SĐT để tìm khách..."
          value={customerPhone}
          onChange={e =>
            onUpdateOrderInfo({ customerPhone: e.target.value })
          }
          className="w-full mt-3 border rounded px-3 py-2 text-sm"
        />

        <div className="text-xs mt-1 h-4">
          {isSearching && (
            <span className="text-blue-500">Đang tìm...</span>
          )}
          {customerData && (
            <span className="text-green-600 font-semibold">
              Điểm: {customerData.points}
            </span>
          )}
        </div>
      </div>

      {/* ================= ITEM LIST ================= */}
      <div className="flex-1 overflow-y-auto p-4">
        {order.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            Chưa có món
          </div>
        )}

        {order.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center border-b py-2 text-sm"
          >
            <div className="w-6">{index + 1}</div>
            <div className="flex-1 font-medium">
              {item.name}
            </div>

            <div className="flex items-center gap-2 w-24 justify-center">
              <button
                onClick={() => onDecrease(item.id)}
                className="bg-red-500 text-white w-6 h-6 rounded"
              >
                −
              </button>

              {item.quantity}

              <button
                onClick={() => onIncrease(item.id)}
                className="bg-green-500 text-white w-6 h-6 rounded"
              >
                +
              </button>
            </div>

            <div className="w-20 text-right">
              {item.price.toLocaleString()}
            </div>

            <div className="w-24 text-right font-semibold">
              {(item.price * item.quantity).toLocaleString()}
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="ml-2 text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="border-t bg-gray-50 p-4">

        {/* Discount Area */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <input
            type="number"
            placeholder="Giảm %"
            value={discountPercent}
            onChange={e =>
              setDiscountPercent(Number(e.target.value))
            }
            className="border rounded px-2 py-1"
          />

          <input
            type="number"
            placeholder="Phụ thu"
            value={extraFee}
            onChange={e => setExtraFee(Number(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </div>

        {/* Voucher */}
        <select
          value={selectedVoucher?.id || 0}
          onChange={e => {
            const v = validVouchers.find(
              x => x.id === Number(e.target.value)
            );
            onUpdateOrderInfo({ selectedVoucher: v || null });
          }}
          className="w-full mb-3 border rounded px-2 py-1"
        >
          <option value={0}>Không áp dụng voucher</option>
          {validVouchers.map(v => (
            <option key={v.id} value={v.id}>
              {v.code}
            </option>
          ))}
        </select>

        {/* Summary */}
        <div className="flex justify-between text-sm mb-1">
          <span>Tổng tiền hàng:</span>
          <span>{summary.subtotal.toLocaleString()}đ</span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold">
            Khách phải trả:
          </span>
          <span className="text-2xl font-bold text-red-600">
            {summary.finalAmount.toLocaleString()}đ
          </span>
        </div>

        {/* Cash */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <input
            type="number"
            placeholder="Khách đưa"
            value={cashGiven}
            onChange={e =>
              setCashGiven(Number(e.target.value))
            }
            className="border rounded px-2 py-1"
          />
          <div className="bg-gray-200 rounded px-2 py-1">
            {change.toLocaleString()}đ
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          {[50000, 100000, 200000, 500000].map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickCash(amount)}
              className="bg-gray-200 px-3 py-1 rounded text-sm"
            >
              +{amount / 1000}k
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 bg-red-500 text-white py-2 rounded">
            Hủy đơn
          </button>

          {/* <button className="flex-1 bg-orange-500 text-white py-2 rounded">
            Chuyển/Gộp
          </button> */}

          <button
            onClick={() =>
              onPayment({
                finalAmount: summary.finalAmount,
                cashGiven,
                change
              })
            }
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}