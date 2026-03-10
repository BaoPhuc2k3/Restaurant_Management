import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // BỔ SUNG: Import axios để gọi API
import { HubConnectionBuilder } from "@microsoft/signalr";
import { getAllMenuItems } from "../../API/Service/menuItemServices";
import { getAllMenus } from "../../API/Service/menuServices";
import { FiShoppingCart, FiPlus, FiMinus, FiSend, FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

// --- HELPERS ---
const removeVietnameseTones = (str = "") =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();

const smartSearch = (searchTerm, itemName) => {
  if (!searchTerm) return true;
  return removeVietnameseTones(itemName).includes(removeVietnameseTones(searchTerm));
};

export default function CustomerOrder() {
  const { tableId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [connection, setConnection] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [items, cats] = await Promise.all([getAllMenuItems(), getAllMenus()]);
        setMenuItems(items);
        setCategories(cats);
      } catch (err) { toast.error("Lỗi tải dữ liệu!"); }
    };
    loadData();

    // Vẫn giữ kết nối SignalR (Tùy chọn) để sau này nếu cần nghe thông báo "Đã duyệt đơn" từ thu ngân
    const conn = new HubConnectionBuilder()
      // CHÚ Ý: Thay localhost thành IP nội bộ (VD: 192.168.x.x) nếu test trên điện thoại
      .withUrl("https://localhost:7291/kitchenHub") 
      .withAutomaticReconnect().build();
    conn.start().then(() => setConnection(conn));
    return () => conn.stop();
  }, []);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = activeCategoryId === 0 || item.menuId === activeCategoryId;
      const matchSearch = smartSearch(searchTerm, item.name);
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCategoryId, searchTerm]);

  const addToCart = (item) => {
    setCart(prev => {
      const exist = prev.find(i => i.id === item.id);
      if (exist) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    if(window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      const newCart = prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0);
      if (newCart.length === 0) setShowCartModal(false);
      return newCart;
    });
  };

  const totalPrice = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

  // ---------------------------------------------------------
  // 🔴 THAY ĐỔI QUAN TRỌNG: Gửi qua API thay vì SignalR invoke
  // ---------------------------------------------------------
  const handleSendOrder = async () => {
    if (cart.length === 0) return;
    setIsSending(true);
    
    try {
      // Ép kiểu dữ liệu chuẩn khớp 100% với CreateOrderRequest trong Database của bạn
      const payload = {
        tableId: parseInt(tableId),
        items: cart.map(item => ({
          menuItemId: item.id, // Chuyển từ "id" của giỏ hàng thành "menuItemId" cho DB
          quantity: item.quantity
        }))
      };

      // Gọi API POST để lưu vào SQL. 
      // CHÚ Ý: Đổi localhost thành IP (VD: 192.168.x.x) nếu quét bằng điện thoại
      await axios.post("https://localhost:7291/api/orders/customer-submit", payload);

      toast.success("🚀 Đã gửi yêu cầu tới thu ngân!");
      setCart([]);
      setShowCartModal(false);
    } catch (err) { 
      console.error(err);
      toast.error("Gửi thất bại, vui lòng thử lại!"); 
    } finally { 
      setIsSending(false); 
    }
  };

  return (
    <div className="h-screen bg-gray-50 font-sans text-gray-800 flex flex-col lg:flex-row overflow-hidden">
      
      {/* 🟠 DANH SÁCH MENU */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-6 no-scrollbar">
        <header className="mb-4">
          <h1 className="text-xl lg:text-2xl font-black text-orange-600 uppercase tracking-tight">Menu Bàn {tableId}</h1>
          <p className="text-[10px] lg:text-sm text-gray-400">Chọn món bạn yêu thích</p>
        </header>

        {/* Search */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Tìm món ăn..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-sm border-none text-sm focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => setActiveCategoryId(0)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-xs transition-all ${activeCategoryId === 0 ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-500 border'}`}
          >Tất cả</button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-xs transition-all ${activeCategoryId === cat.id ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-gray-500 border'}`}
            >{cat.name}</button>
          ))}
        </div>

        {/* Grid Món ăn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMenuItems.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm flex justify-between items-center border border-gray-50 active:bg-gray-50 transition-colors">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-sm lg:text-base text-gray-700 leading-tight">{item.name}</h3>
                <p className="text-orange-600 font-black text-sm mt-1">{item.price.toLocaleString()}đ</p>
              </div>
              <button 
                onClick={() => addToCart(item)}
                className="bg-orange-500 text-white p-2 rounded-xl shadow-md active:scale-90 transition-transform"
              >
                <FiPlus size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🟢 GIỎ HÀNG DẠNG SIDEBAR (CHO MÀN HÌNH LỚN LG) */}
      <div className="hidden lg:flex w-[400px] bg-white border-l shadow-xl flex-col h-full">
         <div className="p-4 bg-orange-600 text-white font-bold text-lg flex justify-between">
            <span>Giỏ hàng</span>
            <span>Bàn {tableId}</span>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1"><p className="font-bold text-sm">{item.name}</p><p className="text-xs text-orange-500">{item.price.toLocaleString()}đ</p></div>
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-orange-500"><FiMinus size={14} /></button>
                        <span className="font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-orange-500"><FiPlus size={14} /></button>
                    </div>
                </div>
            ))}
         </div>
         <div className="p-4 bg-gray-50 border-t">
            <div className="flex justify-between mb-4 font-black text-xl"><span>Tổng:</span><span>{totalPrice.toLocaleString()}đ</span></div>
            <button onClick={handleSendOrder} disabled={cart.length === 0 || isSending} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2">
              {isSending ? "ĐANG GỬI..." : <><FiSend /> GỬI YÊU CẦU</>}
            </button>
         </div>
      </div>

      {/* 🔴 NÚT GIỎ HÀNG NỔI (CHỈ HIỆN TRÊN MOBILE KHI CÓ MÓN) */}
      {cart.length > 0 && (
        <button 
          onClick={() => setShowCartModal(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-2xl z-[60] flex items-center gap-2 animate-bounce-subtle"
        >
          <div className="relative">
            <FiShoppingCart size={24} />
            <span className="absolute -top-3 -right-3 bg-white text-orange-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-600 shadow-sm">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>
          <span className="font-bold text-sm pr-1">{totalPrice.toLocaleString()}đ</span>
        </button>
      )}

      {/* 🔴 MODAL GIỎ HÀNG (BOTTOM SHEET) TRÊN MOBILE */}
      {showCartModal && (
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-end flex-col">
          {/* Lớp nền mờ */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowCartModal(false)}></div>
          
          {/* Nội dung modal */}
          <div className="relative mt-auto bg-white w-full rounded-t-[30px] shadow-2xl flex flex-col max-h-[80vh] animate-slide-up">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3" onClick={() => setShowCartModal(false)}></div>
            
            <div className="px-6 py-2 flex justify-between items-center border-b pb-4">
              <h2 className="font-black text-xl text-gray-800">Món đã chọn</h2>
              <button onClick={() => setShowCartModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500"><FiX size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-bold text-gray-700">{item.name}</p>
                    <p className="text-orange-600 font-bold text-sm">{item.price.toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 px-3 py-1.5 rounded-xl border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-orange-500"><FiMinus size={18} /></button>
                    <span className="font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-orange-500"><FiPlus size={18} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t rounded-t-[20px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-bold">Tổng thanh toán</span>
                <span className="text-2xl font-black text-orange-600">{totalPrice.toLocaleString()}đ</span>
              </div>
              <button 
                onClick={handleSendOrder}
                disabled={isSending || cart.length === 0}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black flex justify-center items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isSending ? "ĐANG GỬI..." : <><FiSend /> XÁC NHẬN GỬI MÓN</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}