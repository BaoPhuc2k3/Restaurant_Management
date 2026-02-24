import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../API/axios";
import PaymentModal from "../../components/POS/PaymentModal";


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
/* MEMO: RENDER ORDER ROWS      */
/* ============================= */



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
  // const [isPaymentOpen, setIsPaymentOpen] = useState(false);

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

  const renderedOrderRows = useMemo(() => {
  return order.map((item, index) => {
    const lineTotal = item.price * item.quantity;

    return (
      <div
        key={item.id}
        className="grid grid-cols-12 items-center text-sm px-3 py-2 border-b hover:bg-gray-50"
      >
        <div className="col-span-1 text-gray-500">
          {index + 1}
        </div>

        <div className="col-span-4 font-medium truncate">
          {item.name}
        </div>

        <div className="col-span-3 flex justify-center items-center gap-2">
          <button
            onClick={() => onDecrease(item.id)}
            className="w-6 h-6 bg-red-500 text-white rounded text-xs"
          >
            −
          </button>

          <span className="w-6 text-center">
            {item.quantity}
          </span>

          <button
            onClick={() => onIncrease(item.id)}
            className="w-6 h-6 bg-green-500 text-white rounded text-xs"
          >
            +
          </button>
        </div>

        <div className="col-span-2 text-right text-gray-600">
          {item.price.toLocaleString()}
        </div>

        <div className="col-span-2 flex justify-end items-center gap-2">
          <span className="font-semibold text-teal-600">
            {lineTotal.toLocaleString()}
          </span>

          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 text-xs"
          >
            ×
          </button>
        </div>
      </div>
    );
  });
}, [order, onIncrease, onDecrease, onRemove]);

  

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
<div className="flex-1 flex flex-col overflow-hidden">

  {/* HEADER STICKY */}
  <div className="grid grid-cols-12 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-2 border-b sticky top-0 z-10">
    <div className="col-span-1">#</div>
    <div className="col-span-4">Món</div>
    <div className="col-span-3 text-center">SL</div>
    <div className="col-span-2 text-right">ĐG</div>
    <div className="col-span-2 text-right">TT</div>
  </div>

  {/* BODY */}
  <div className="flex-1 overflow-y-auto">
    {order.length === 0 ? (
      <div className="text-center text-gray-400 mt-10 text-sm">
        Chưa có món
      </div>
    ) : (
      renderedOrderRows
    )}
  </div>

</div>

      {/* ================= FOOTER ================= */}
<div className="border-t bg-gray-50 p-4 text-sm">

  {/* ===== DISCOUNT AREA (2 CỘT NGANG) ===== */}
  <div className="grid grid-cols-2 gap-4 mb-3">

    <div className="flex items-center gap-2">
      <label className="w-20 text-gray-600">
        Giảm %
      </label>
      <input
        type="number"
        value={discountPercent}
        onChange={e => setDiscountPercent(Number(e.target.value))}
        className="flex-1 border rounded px-2 py-1 text-sm"
      />
    </div>

    <div className="flex items-center gap-2">
      <label className="w-20 text-gray-600">
        Phụ thu
      </label>
      <input
        type="number"
        value={extraFee}
        onChange={e => setExtraFee(Number(e.target.value))}
        className="flex-1 border rounded px-2 py-1 text-sm"
      />
    </div>

  </div>

  {/* ===== VOUCHER (FULL WIDTH) ===== */}
  <div className="flex items-center gap-2 mb-3">
    <label className="w-20 text-gray-600">
      Voucher
    </label>
    <select
      value={selectedVoucher?.id || 0}
      onChange={e => {
        const v = validVouchers.find(
          x => x.id === Number(e.target.value)
        );
        onUpdateOrderInfo({ selectedVoucher: v || null });
      }}
      className="flex-1 border rounded px-2 py-1 text-sm"
    >
      <option value={0}>Không áp dụng</option>
      {validVouchers.map(v => (
        <option key={v.id} value={v.id}>
          {v.code}
        </option>
      ))}
    </select>
  </div>

  {/* ===== SUMMARY ===== */}
  <div className="border-t pt-2 space-y-1 mb-3">

    <div className="flex justify-between text-gray-600">
      <span>Tổng tiền hàng</span>
      <span>{summary.subtotal.toLocaleString()}đ</span>
    </div>

    <div className="flex justify-between font-semibold">
      <span>Khách phải trả</span>
      <span className="text-red-600 text-lg">
        {summary.finalAmount.toLocaleString()}đ
      </span>
    </div>

  </div>

  {/* ===== CASH AREA (2 CỘT NGANG) ===== */}
  <div className="grid grid-cols-2 gap-4 mb-2">

    <div className="flex items-center gap-2">
      <label className="w-20 text-gray-600">
        Khách đưa
      </label>
      <input
        type="number"
        value={cashGiven}
        onChange={e => setCashGiven(Number(e.target.value))}
        className="flex-1 border rounded px-2 py-1 text-sm"
      />
    </div>

    <div className="flex items-center gap-2">
      <label className="w-20 text-gray-600">
        Tiền thối
      </label>
      <div className="flex-1 bg-gray-200 rounded px-2 py-1 text-sm">
        {change.toLocaleString()}đ
      </div>
    </div>

  </div>

  {/* ===== QUICK CASH ===== */}
  <div className="flex gap-2 mb-3">
    {[50000, 100000, 200000, 500000].map(amount => (
      <button
        key={amount}
        onClick={() => handleQuickCash(amount)}
        className="bg-gray-200 px-3 py-1 rounded text-xs hover:bg-gray-300"
      >
        +{amount / 1000}k
      </button>
    ))}
  </div>

  {/* ===== ACTIONS ===== */}
  <div className="flex gap-2">
    <button className="flex-1 bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600">
      Hủy đơn
    </button>

    <button
  // Thay thế sự kiện onClick của nút Thanh toán ở cuối OrderPanel.jsx
onClick={() => {
  if (order.length === 0) return;

  const cleanPhone = (customerPhone || "").trim();
  if (cleanPhone && !/^0\d{9}$/.test(cleanPhone)) {
    alert("SĐT không hợp lệ");
    return;
  }

  // ĐÃ SỬA: Truyền thêm `change` lên POSPage
  onPayment({
    summary,
    cashGiven,
    change 
  });
}}
  className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700"
>
  Thanh toán
</button>
  </div>

</div>
{/* {isPaymentOpen && (
  <PaymentModal
    table={table}
    order={order}
    summary={summary}   // 🔥 PHẢI CÓ
    customerPhone={customerPhone}
    cashGiven={cashGiven}
    change={change}
    onClose={() => setIsPaymentOpen(false)}
    onConfirm={(payload) => {
      onPayment(payload);
      setIsPaymentOpen(false);
    }}
  />
)} */}
    </div>
  );
}