import { useState } from "react";
import BookingDate from "./BookingDate";
import BookingTime from "./BookingTime";
import BookingTable from "./BookingTable";
import BookingPreOrder from "./BookingPreOrder";
import BookingSummary from "./BookingSummary";

export default function BookingModal({ onClose }) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative bg-white rounded-xl w-full max-w-lg p-6 z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Đặt bàn – Bước {step}
          </h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {/* Content */}
        {step === 1 && <BookingDate onNext={() => setStep(2)} />}

        {/* Sau này */}
        {step === 2 && <BookingTime onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <BookingTable onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <BookingPreOrder onBack={() => setStep(3)} onNext={() => setStep(5)} />}
        {step === 5 && <BookingSummary onBack={() => setStep(4)} onComplete={() => {
          alert("Đặt bàn thành công (demo frontend)");
          onClose();
        }} />}

      </div>
    </div>
  );
}
