import { useLocation } from "react-router-dom";

function BookingSuccess() {
  const location = useLocation();
  const booking = location.state?.booking;

  return (
    <div>
      <h1>Booking Successful!</h1>
      <pre>{JSON.stringify(booking, null, 2)}</pre>
      {/* Render more details as needed */}
    </div>
  );
}

export default BookingSuccess;
