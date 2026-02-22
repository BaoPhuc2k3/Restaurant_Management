import { useBooking } from "../../contexts/bookingContext";

const mockMenu = [
  { id: 1, name: "Steak", price: 250000 },
  { id: 2, name: "Spaghetti", price: 150000 },
  { id: 3, name: "Salad", price: 90000 },
  { id: 4, name: "Wine", price: 300000 }
];

export default function BookingPreOrder({ onBack, onNext }) {
  const { booking, setBooking } = useBooking();

  const handleQuantityChange = (menuId, quantity) => {
    const existing = booking.preOrders.find(p => p.menuId === menuId);

    let updatedPreOrders;

    if (existing) {
      updatedPreOrders = booking.preOrders.map(p =>
        p.menuId === menuId ? { ...p, quantity } : p
      );
    } else {
      updatedPreOrders = [
        ...booking.preOrders,
        { menuId, quantity }
      ];
    }

    setBooking({
      ...booking,
      preOrders: updatedPreOrders.filter(p => p.quantity > 0)
    });
  };

  const getQuantity = (menuId) => {
    const item = booking.preOrders.find(p => p.menuId === menuId);
    return item ? item.quantity : 0;
  };

  const totalPrice = booking.preOrders.reduce((sum, item) => {
    const menu = mockMenu.find(m => m.id === item.menuId);
    return sum + (menu.price * item.quantity);
  }, 0);

  const handleNext = () => {
    // console.log("Booking hoàn chỉnh:", booking);
    // alert("Đặt bàn thành công (demo frontend)");

    onNext();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Order món trước (Optional)
      </h2>

      <div className="space-y-4 max-h-75 overflow-y-auto">
        {mockMenu.map(menu => (
          <div key={menu.id} className="flex justify-between items-center border p-3 rounded-lg">
            <div>
              <p className="font-semibold">{menu.name}</p>
              <p className="text-sm text-gray-500">{menu.price.toLocaleString()} VNĐ</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(menu.id, getQuantity(menu.id) - 1)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                -
              </button>

              <span>{getQuantity(menu.id)}</span>

              <button
                onClick={() => handleQuantityChange(menu.id, getQuantity(menu.id) + 1)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="font-semibold">
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
          onClick={handleNext}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Tiếp tục
        </button>
      </div>
      </div>
    </div>
  );
}
