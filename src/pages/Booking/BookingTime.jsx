import { useBooking } from "../../contexts/bookingContext";
import { useState } from "react";

export default function BookingTime({ onNext, onBack }) {
  const { booking, setBooking } = useBooking();
  const [selectedTime, setSelectedTime] = useState("");

  // ❗ Bảo vệ: nếu chưa chọn ngày thì không hiển thị
  if (!booking.date) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-4">
          Bạn chưa chọn ngày đặt bàn.
        </p>
        <button
          onClick={onBack}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const handleNext = () => {
    if (!selectedTime) {
      alert("Vui lòng chọn giờ");
      return;
    }

    setBooking({
      ...booking,
      time: selectedTime,
    });

    onNext();
  };

  const timeSlots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2 text-center">
        Chọn giờ đặt bàn
      </h2>

      <p className="text-sm text-gray-500 text-center mb-4">
        Ngày đã chọn: <strong>{booking.date}</strong>
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`py-2 rounded border ${
              selectedTime === time
                ? "bg-orange-500 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {time}
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
