import { useBooking } from "../../contexts/bookingContext";
import { useState } from "react";

export default function BookingTableConfirm({ onBack, onNext }) {
  const { booking, setBooking } = useBooking();
  const [selectedTable, setSelectedTable] = useState(null);

  // Giả lập danh sách bàn (sau này fetch API)
  const tables = [
    { id: 1, name: "Bàn 1", capacity: 2 },
    { id: 2, name: "Bàn 2", capacity: 4 },
    { id: 3, name: "Bàn VIP", capacity: 6 }
  ];

  const handleNext = () => {
    if (!selectedTable) {
      alert("Vui lòng chọn bàn");
      return;
    }

    setBooking({
      ...booking,
      tableId: selectedTable
    });

    // console.log("Booking hoàn chỉnh:", {
    //   ...booking,
    //   tableId: selectedTable
    // });

    onNext(); 
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Chọn bàn & Xác nhận
      </h2>

      {/* Thông tin đã chọn */}
      <div className="bg-gray-100 p-3 rounded mb-4">
        <p><strong>Ngày:</strong> {booking.date}</p>
        <p><strong>Giờ:</strong> {booking.time}</p>
      </div>

      {/* Danh sách bàn */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table.id)}
            className={`border p-3 rounded 
              ${selectedTable === table.id 
                ? "bg-orange-500 text-white" 
                : "bg-white hover:bg-gray-100"}`}
          >
            <p>{table.name}</p>
            <p className="text-sm">Sức chứa: {table.capacity}</p>
          </button>
        ))}
      </div>

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
  );
}
