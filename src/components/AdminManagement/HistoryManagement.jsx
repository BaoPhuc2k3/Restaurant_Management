import React, { useState, useMemo, useEffect } from "react";
import { FiSearch, FiPrinter, FiCalendar, FiFileText } from "react-icons/fi";
import { getInvoiceHistory } from "../../API/Service/ordersServices"; 
import { toast } from "react-toastify";


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



export default function OrderHistory() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  const [invoices, setInvoices] = useState([]); 
  const [selectedInvoice, setSelectedInvoice] = useState(null); 
  const [loading, setLoading] = useState(false);


  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getInvoiceHistory(startDate, endDate);
      setInvoices(data);
      if (data.length > 0) setSelectedInvoice(data[0]);
      else setSelectedInvoice(null);
    } catch (error) {
      console.error("Lỗi lấy lịch sử", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePrint = () => {
    window.onafterprint = () => {
      toast.success("In hóa đơn thành công!");
      window.onafterprint = null;
    };
    window.print(); 
  };
  

  return (
    <div className="flex h-screen bg-slate-100 p-4 gap-4 overflow-hidden font-sans print:p-0 print:bg-white print:block print:h-auto">
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
        
        {/* HEADER & FILTER */}
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
              <FiCalendar /> Lịch sử đơn hàng
            </h2>
            <span className="text-sm font-semibold bg-teal-100 text-teal-800 px-3 py-1 rounded-md">
              Tổng số: {invoices.length} đơn
            </span>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Từ ngày</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Đến ngày</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>
            <button 
              onClick={fetchHistory} 
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm h-[38px]"
            >
              <FiSearch /> Tìm kiếm
            </button>
          </div>
        </div>

        {/* BẢNG DANH SÁCH (TABLE) */}
        <div className="flex-1 overflow-y-auto bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-white sticky top-0 shadow-sm z-10 border-b border-slate-200">
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-5 py-4 font-bold">ID</th>
                <th className="px-5 py-4 font-bold">Giờ</th>
                <th className="px-5 py-4 font-bold">Bàn</th>
                <th className="px-5 py-4 font-bold text-right">Tổng tiền</th>
                <th className="px-5 py-4 font-bold text-center">HTTT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic">Không có hóa đơn nào trong khoảng thời gian này.</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => setSelectedInvoice(inv)}
                    className={`cursor-pointer transition-colors ${selectedInvoice?.id === inv.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                  >
                    <td className="px-5 py-3 font-semibold text-slate-700">#{inv.id}</td>
                    <td className="px-5 py-3 text-slate-600">{new Date(inv.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</td>
                    <td className="px-5 py-3 font-medium text-teal-800">{inv.tableName}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">{inv.finalAmount.toLocaleString()} đ</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${inv.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {inv.paymentMethod === 'Cash' ? 'TM' : 'CK'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-[450px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:w-full print:border-none print:shadow-none print:rounded-none">
        
        {selectedInvoice ? (
          <>
            {/* HEADER CỘT PHẢI */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0 print:hidden">
              <div>
                <h3 className="font-bold text-slate-800">Chi tiết đơn #{selectedInvoice.id}</h3>
                <p className="text-xs text-slate-500">{new Date(selectedInvoice.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <button 
                onClick={handlePrint} 
                className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-3 py-1.5 rounded flex items-center gap-2 font-medium transition-colors shadow-sm"
              >
                <FiPrinter /> In lại
              </button>
            </div>

            {/* RECEIPT PREVIEW */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-200 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
              <div id="receipt-content" className="bg-white w-full shadow-md p-6 font-sans text-gray-800 relative print:absolute print:top-0 print:left-0 print:w-[80mm] print:shadow-none print:p-2">
                <div className="absolute top-0 left-0 w-full h-2 bg-[radial-gradient(circle,transparent_4px,#ffffff_5px)] bg-[length:10px_10px] -mt-1"></div>

                {/* Tiêu đề quán */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold uppercase mb-1">HÓA ĐƠN BÁN HÀNG</h1>
                  <p className="text-[11px] text-gray-600">ĐC: Số 15, Đường Nguyễn Văn Trác, Phường Hà Đông, Hà Nội</p>
                  <p className="text-[11px] text-gray-600">Hotline: 0387803100</p>
                </div>

                {/* Thông tin hóa đơn */}
                <div className="flex justify-between text-[11px] mb-4 leading-relaxed">
                  <div>
                    <p>Ngày: {new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN")}</p>
                    <p>Thu ngân: {selectedInvoice.staffName}</p>
                    <p className="font-bold mt-1 text-sm">Bàn: {selectedInvoice.tableName.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p>Số phiếu: {selectedInvoice.id}</p>
                    <p>In lúc: {new Date(selectedInvoice.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>

                {/* Bảng món ăn */}
                <table className="w-full text-[12px] mb-2">
                  <thead>
                    <tr className="border-b border-dashed border-gray-400">
                      <th className="py-2 text-left font-semibold">Mặt hàng</th>
                      <th className="py-2 text-center font-semibold w-8">SL</th>
                      <th className="py-2 text-right font-semibold w-16">Đ.Giá</th>
                      <th className="py-2 text-right font-semibold w-20">T.Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="border-b border-gray-400">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2 pr-2">{item.name}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{(item.price).toLocaleString()}</td>
                        <td className="py-2 text-right">{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tính tổng */}
                <div className="space-y-1 text-[12px] py-2 border-b border-gray-400">
                  <div className="flex justify-between">
                    <span>Tổng tiền hàng:</span>
                    <span>{selectedInvoice.subTotal.toLocaleString()}đ</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Khuyến mãi / Voucher:</span>
                      <span>-{selectedInvoice.discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-sm uppercase">Tổng cộng:</span>
                  <span className="font-bold text-lg">{selectedInvoice.finalAmount.toLocaleString()}đ</span>
                </div>

                <div className="text-[11px] text-gray-500 italic mb-3">
                  (Bằng chữ: {numberToWordsVN(selectedInvoice.finalAmount)})
                </div>
                <div className="text-[11px] text-gray-500 mb-6">
                  (HTTT: {selectedInvoice.paymentMethod === 'Cash' ? 'Tiền mặt' : 'Chuyển khoản'})
                </div>

                {/* Footer Bill */}
                <div className="text-center text-[11px] italic text-gray-600">
                  <p>Xin cảm ơn Quý khách / Thank you!</p>
                  <p>Hẹn gặp lại!</p>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <FiFileText className="text-6xl mb-4 opacity-20" />
            <p>Vui lòng chọn một hóa đơn để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}