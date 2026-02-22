import { Outlet } from "react-router-dom";
import { BookingProvider } from "../contexts/bookingContext";

export default function BookingLayout() {
  return (
    <BookingProvider>
      <Outlet />
    </BookingProvider>
  );
}
