import { useBooking } from "../../contexts/bookingContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function BookingDate({ onNext }) {
  const { booking, setBooking } = useBooking();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleNext = () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày");
      return;
    }

    setBooking({
      ...booking,
      date: selectedDate
    });

    onNext();
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Chọn ngày đặt bàn
      </h2>

      <input
        type="date"
        min={today}
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full border px-4 py-2 rounded mb-4"
      />

      <button
        onClick={handleNext}
        className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
      >
        Tiếp tục
      </button>
    </div>
  );
}
