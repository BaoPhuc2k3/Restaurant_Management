import React, { useState, useMemo } from "react";
import { FiX, FiPrinter, FiCheck } from "react-icons/fi";
import { toast } from 'react-toastify'; // Khai báo toast (Nếu dự án chưa cài react-toastify thì bạn đổi thành alert nhé)

/* =========================================================
   HELPER: ĐỌC SỐ TIỀN THÀNH CHỮ (TIẾNG VIỆT)
========================================================= */
const numberToWordsVN = (number) => {
  const defaultNumbers = " hai ba bốn năm sáu bảy tám chín";
  const units = ("1 một" + defaultNumbers).split(" ");
  const tens = ("lẻ mười" + defaultNumbers).split(" ");
  const blocks = " nghìn triệu tỷ".split(" ");

  if (!number || number === 0) return "Không đồng";
  
  let str = number.toString();
  let result = [];
  let blockIndex = 0;

  while (str.length > 0) {
    let block = str.slice(-3);
    str = str.slice(0, -3);
    if (block !== "000") {
      let blockText = [];
      let [h, t, u] = block.padStart(3, "0").split("").map(Number);
      
      if (h !== 0 || str.length > 0) blockText.push(units[h] + " trăm");
      if (t !== 0) blockText.push(t === 1 ? "mười" : tens[t] + " mươi");
      else if (u !== 0 && h !== 0) blockText.push("lẻ");
      
      if (u !== 0) {
        if (u === 1 && t > 1) blockText.push("mốt");
        else if (u === 5 && t > 0) blockText.push("lăm");
        else blockText.push(units[u]);
      }
      result.unshift(blockText.join(" ") + (blocks[blockIndex] ? " " + blocks[blockIndex] : ""));
    }
    blockIndex++;
  }
  let finalStr = result.join(" ").trim().replace(/ +/g, " ") + " đồng";
  return finalStr.charAt(0).toUpperCase() + finalStr.slice(1);
};

/* =========================================================
   COMPONENT CHÍNH
========================================================= */
export default function PaymentModal({
  table,
  order,
  orderId,
  summary,
  customerPhone,
  onClose,
  onConfirm
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showQRModal, setShowQRModal] = useState(false);
  
  const now = useMemo(() => new Date(), []);
  const staffName = localStorage.getItem("fullName") || "Admin";

  const BANK_ID = "MB"; 
  const ACCOUNT_NO = "0387803100"; 
  const ACCOUNT_NAME = "LE BAO PHUC"; 
  const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${summary?.finalAmount}&addInfo=Thanh toan ban ${table?.tableName}&accountName=${ACCOUNT_NAME}`;

  // Thuật toán gộp nhóm an toàn
  const displayItems = useMemo(() => {
    if (!order) return [];
    const validItems = order.filter(item => item.itemStatus !== 4);
    const grouped = validItems.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { ...item };
      } else {
        acc[item.id].quantity += item.quantity;
      }
      return acc;
    }, {});
    return Object.values(grouped);
  }, [order]);

  // HÀM XỬ LÝ CHUNG: Mở hộp thoại In -> Đợi tắt hộp thoại -> Báo thành công -> Đóng Modal & Gọi API
  const processPaymentAndPrint = (method) => {
    window.onafterprint = () => {
      toast.success("Thanh toán & In hóa đơn thành công!");
      
      // Gọi hàm onConfirm để báo cho component cha (VD: gọi API lưu DB, đóng bảng)
      onConfirm({ paymentMethod: method, finalAmount: summary.finalAmount });
      
      window.onafterprint = null; // Xóa sự kiện
    };

    window.print(); // Kích hoạt lệnh in của trình duyệt
  };

  // Xử lý khi bấm nút xanh Xác nhận ở màn hình đầu tiên
  const handlePrimaryAction = () => {
    if (paymentMethod === "TRANSFER") {
      setShowQRModal(true); // Nếu CK -> Mở bảng QR lên trước
    } else {
      processPaymentAndPrint("CASH"); // Nếu Tiền mặt -> Bấm là in luôn
    }
  };

  // Xử lý khi bấm nút xác nhận ĐÃ NHẬN ĐƯỢC TIỀN trong bảng QR
  const handleConfirmTransfer = () => {
    processPaymentAndPrint("TRANSFER"); // Bấm xác nhận nhận tiền -> In luôn
  };

  if (!summary || !order) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-40 p-4 backdrop-blur-sm">
        

        <div className="bg-white w-full max-w-[450px] max-h-[90vh] rounded shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          

          <div className="px-4 py-3 flex justify-between items-center shrink-0 border-b">
            <h2 className="font-bold text-gray-800 text-lg">Xác nhận thanh toán</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl leading-none">&times;</button>
          </div>

          {/* VÙNG NÀY LÀ TỜ HÓA ĐƠN SẼ ĐƯỢC IN */}
          <div id="receipt-content" className="flex-1 overflow-y-auto p-6 bg-white text-gray-800 font-sans">

            <div className="text-center mb-6">
              <h1 className="text-xl font-bold uppercase mb-2">HÓA ĐƠN BÁN HÀNG</h1>
              <p className="text-sm">ĐC: Số 15, Đường Nguyễn Văn Trác, Phường Hà Đông, Hà Nội</p>
              <p className="text-sm">Hotline: 0387803100</p>
            </div>

            <div className="flex justify-between text-sm mb-4">
              <div>
                <p>Ngày: {now.toLocaleDateString("vi-VN")}</p>
                <p>Thu ngân: {staffName}</p>
                <p className=" mt-1">{table?.name?.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p>Số phiếu: {orderId}</p>
                <p>In lúc: {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-2">
              <thead>
                <tr className="border-b border-dashed border-gray-400">
                  <th className="py-2 text-left font-semibold">Mặt hàng</th>
                  <th className="py-2 text-center font-semibold w-12">SL</th>
                  <th className="py-2 text-right font-semibold w-20">Đ.Giá</th>
                  <th className="py-2 text-right font-semibold w-24">T.Tiền</th>
                </tr>
              </thead>
              <tbody className="border-b border-gray-400">
                {displayItems.map((item, index) => (
                  <tr key={`bill-item-${item.id}-${index}`}>
                    <td className="py-2 text-left truncate pr-2">{item.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{(item.price).toLocaleString()}</td>
                    <td className="py-2 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1.5 text-sm py-2 border-b border-gray-400">
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span>{summary.subtotal.toLocaleString()}đ</span>
              </div>
              
              {(summary.percentDiscount > 0 || summary.voucherDiscount > 0) && (
                <div className="flex justify-between">
                  <span>Giảm giá / Voucher:</span>
                  <span>-{(summary.percentDiscount + summary.voucherDiscount).toLocaleString()}đ</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="font-bold text-base uppercase">Tổng cộng:</span>
              <span className="font-bold text-lg">{summary.finalAmount.toLocaleString()}đ</span>
            </div>

            <div className="text-xs text-gray-500 italic mb-8">
              (Bằng chữ: {numberToWordsVN(summary.finalAmount)})
            </div>

            <div className="text-center text-sm italic text-gray-600">
              <p>Xin cảm ơn Quý khách / Thank you!</p>
              <p>Hẹn gặp lại!</p>
            </div>
          </div>
          {/*KẾT THÚC TỜ HÓA ĐƠN  */}

          <div className="shrink-0 bg-gray-50 p-4 border-t print:hidden">
            <div className="flex items-center gap-4 mb-4 text-sm font-medium text-gray-700 justify-center">
              <span>Hình thức thanh toán:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === "CASH"} 
                  onChange={() => setPaymentMethod("CASH")}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                Tiền mặt
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === "TRANSFER"} 
                  onChange={() => setPaymentMethod("TRANSFER")}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                Chuyển khoản
              </label>
            </div>

            <button
              onClick={handlePrimaryAction}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-bold text-base shadow transition-colors uppercase tracking-wide"
            >
              <FiPrinter size={18} /> 
              XÁC NHẬN & IN HÓA ĐƠN
            </button>
          </div>
        </div>
      </div>

      {/* MÀN HÌNH QUÉT QR */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-75 duration-200">
            <div className="bg-blue-600 p-4 text-center text-white relative">
              <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <FiX size={24} />
              </button>
              <h3 className="font-bold text-lg">Quét mã chuyển khoản</h3>
            </div>
            <div className="p-6 flex flex-col items-center bg-gray-50">
              <div className="bg-white p-2 rounded-xl shadow-sm border mb-4">
                <img src={qrCodeUrl} alt="VietQR" className="w-56 h-56 object-contain" />
              </div>
              <p className="text-gray-500 text-sm mb-1">Số tiền thanh toán:</p>
              <p className="text-2xl font-black text-blue-600">{summary.finalAmount.toLocaleString()} VNĐ</p>
            </div>
            <div className="p-4 bg-white border-t">
              <button
                onClick={handleConfirmTransfer}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all"
              >
                <FiCheck size={22} /> ĐÃ NHẬN ĐƯỢC TIỀN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}