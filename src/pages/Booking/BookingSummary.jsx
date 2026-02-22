import { useBooking } from "../../contexts/bookingContext";

const mockMenu = [
  { id: 1, name: "Steak", price: 250000 },
  { id: 2, name: "Spaghetti", price: 150000 },
  { id: 3, name: "Salad", price: 90000 },
  { id: 4, name: "Wine", price: 300000 }
];

export default function BookingSummary({ onBack, onClose }) {
  const { booking } = useBooking();

  const totalPrice = booking.preOrders.reduce((sum, item) => {
    const menu = mockMenu.find(m => m.id === item.menuId);
    return sum + (menu.price * item.quantity);
  }, 0);

  const handleFinalConfirm = () => {
    console.log("Final Booking Data:", booking);
    alert("Đặt bàn thành công (Demo frontend)");
    onClose();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-6">
        Hóa đơn xác nhận
      </h2>

      {/* Thông tin đặt bàn */}
      <div className="space-y-2 border-b pb-4">
        <p><strong>Ngày:</strong> {booking.date}</p>
        <p><strong>Giờ:</strong> {booking.time}</p>
        <p><strong>Bàn:</strong> #{booking.tableId}</p>
      </div>

      {/* Danh sách món */}
      <div className="mt-4 space-y-3 max-h-62.5 overflow-y-auto">
        {booking.preOrders.length === 0 && (
          <p className="text-gray-500">Không có món đặt trước</p>
        )}

        {booking.preOrders.map(item => {
          const menu = mockMenu.find(m => m.id === item.menuId);
          return (
            <div
              key={item.menuId}
              className="flex justify-between border p-2 rounded"
            >
              <span>{menu.name} x {item.quantity}</span>
              <span>
                {(menu.price * item.quantity).toLocaleString()} VNĐ
              </span>
            </div>
          );
        })}
      </div>

      {/* Tổng tiền */}
      <div className="mt-4 border-t pt-4">
        <p className="font-semibold text-lg">
          Tổng tiền: {totalPrice.toLocaleString()} VNĐ
        </p>

        <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Quay lại
        </button>

        <button
          onClick={handleFinalConfirm}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Xác nhận đặt bàn
        </button>
      </div>
        {/* <button
          onClick={handleFinalConfirm}
          className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Xác nhận đặt bàn
        </button> */}
      </div>
    </div>
  );
}
