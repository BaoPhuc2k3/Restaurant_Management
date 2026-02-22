  import { useState } from "react";
  import Navbar from "../../layouts/HomeCustomer/Navbar";
  import Hero from "../../layouts/HomeCustomer/Hero";
  import BookingModal from "../Booking/BookingModal";
  import { isAuthenticated } from "../../utils/auth";
  import { useNavigate } from "react-router-dom";
  import { BookingProvider } from "../../contexts/bookingContext";

  export default function HomeCustomer() {
    const [openBooking, setOpenBooking] = useState(false);
    console.log("openBooking =", openBooking);

    const navigate = useNavigate();

    const handleBooking = () => {
      if (!isAuthenticated()) {
        navigate("/login", {
          state: { from: "/" }
        });
        return;
      }
      setOpenBooking(true);
    };

    return (
      <>
        <Navbar />
        <Hero onBooking={handleBooking} />

        {openBooking && (
          <BookingProvider>
            <BookingModal onClose={() => setOpenBooking(false)} />
          </BookingProvider>
        )}
      </>
    );
  }
