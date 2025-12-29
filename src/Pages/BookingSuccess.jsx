import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import HeaderCard from "../Components/HeaderCard";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faEnvelope,
  faLocationDot,
  faPesoSign,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";

function isLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && Date.now() < decoded.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function BookingSuccess() {
  const [loggedIn] = useState(isLoggedIn());
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      alert("Please log in to book a visit.");
      navigate("/signin");
    }
  }, [loggedIn, navigate]);

  const location = useLocation();
  const booking = location.state?.booking;

  return (
    <>
      <Header />

      <div className="bg-green-50 px-3 sm:px-6 lg:px-10 py-4 flex flex-col items-center">
        {booking && (
          <div className="bg-white text-[#227B05] flex flex-col gap-4 py-4 rounded-xl px-4 xs:px-5 sm:px-6 max-w-xl w-full shadow-sm">
            <div className="rounded-xl p-2 flex flex-col text-center justify-center gap-2 mt-1">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="bg-[#227B05]/20 rounded-full px-3 py-3 text-3xl mx-auto mb-2"
              />
              <h1 className="text-lg sm:text-xl font-semibold">
                Reservation Confirmed!
              </h1>
              <h3 className="text-xs sm:text-sm">
                Thank you for booking your visit with CvSU Agri-Eco Tourism
                Park. We're excited to welcome you!
              </h3>
            </div>
            <HeaderCard
              className="bg-green-50"
              headerClass="bg-green-50"
              icon={<FontAwesomeIcon icon={faCalendarCheck} />}
              title="Your Booking Details"
              descriptionContent={
                <div className="grid grid-cols-2 p-4 sm:p-5 gap-3 text-xs sm:text-sm">
                  <div className="flex flex-col col-span-2 lg:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Visitor Name
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {booking.account.detail.firstName}{" "}
                      {booking.account.detail.surname}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2 lg:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Email
                    </span>
                    <span className="font-semibold text-sm sm:text-base wrap-break-word">
                      {booking.account.detail.email}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Visitor Date
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {booking.visitDate}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Visitor Time
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {booking.visitTime}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Group Size
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {booking.groupSize} visitor(s)
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Booking Price
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      <FontAwesomeIcon icon={faPesoSign} />
                      {booking.totalPrice}
                    </span>
                  </div>
                  {booking.paymentMethod === "ONLINE" && (
                    <div className="flex flex-col col-span-2 md:col-span-1">
                      <span className="text-[11px] sm:text-xs text-gray-400">
                        Down Payment (50%)
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        {booking.totalPrice / 2}
                      </span>
                    </div>
                  )}
                  {booking.paymentMethod === "PARK" && (
                    <div className="flex flex-col col-span-2 lg:col-span-1">
                      <span className="text-[11px] sm:text-xs text-gray-400">
                        Payment Method
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        Cash Payment at the Park
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Booking Status
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      Payment Status
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              }
            />

            {booking.paymentMethod === "ONLINE" && (
              <HeaderCard
                className="bg-[#BAD0F8]/20 text-[#222EDA]"
                headerClass="bg-[#BAD0F8]/0"
                icon={<FontAwesomeIcon icon={faEnvelope} />}
                title="What's next?"
                descriptionContent={
                  <ul className="list-disc pl-5 space-y-1 marker:text-[#222EDA] my-2 mx-4 text-xs sm:text-sm">
                    <li>You will receive a confirmation email.</li>
                    <li>Check “My Schedule” to track your booking status.</li>
                    <li>
                      Once approved by our admin, you’ll get another email
                      within 24 hours with down payment instructions and a link
                      to submit your GCash proof of payment.
                    </li>
                    <li>Bring a valid ID on your visit date</li>
                    <li>Arrive 10 minutes before your scheduled time</li>
                  </ul>
                }
              />
            )}

            {booking.paymentMethod === "PARK" && (
              <HeaderCard
                className="bg-[#FDDB3C]/30 text-[#97750B]"
                headerClass="bg-[#FDDB3C]/0"
                icon={<FontAwesomeIcon icon={faEnvelope} />}
                title="What's next?"
                descriptionContent={
                  <ul className="list-disc pl-5 space-y-1 marker:text-[#97750B] my-2 mx-4 text-xs sm:text-sm">
                    <li>Wait for admin to confirm your booking</li>
                    <li>Check “My Schedule” to track your booking status.</li>
                    <li>Once approved, your booking is complete!</li>
                    <li>
                      Prepare <FontAwesomeIcon icon={faPesoSign} />
                      {booking.totalPrice} in cash for your visit
                    </li>
                    <li>Payment will be collected at the Information Center</li>
                    <li>
                      Bring a valid ID and arrive 15 minutes before your
                      scheduled time
                    </li>
                  </ul>
                }
              />
            )}

            <div className="grid grid-cols-2 gap-3 mt-1 text-xs sm:text-sm">
              <Link
                to="/"
                className="border border-black rounded-lg text-center flex justify-center py-2 px-3 text-[#227B05] hover:text-black hover:bg-[#227B05]/30"
              >
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="my-auto rounded-sm p-2"
                />
                <span className="my-auto">Back to Home</span>
              </Link>
              <Link
                to="/my-account"
                className="border border-black rounded-lg text-center flex justify-center py-2 px-3 text-[#227B05] hover:text-black hover:bg-[#227B05]/30"
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="my-auto rounded-sm p-2"
                />
                <span className="my-auto">My Account</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default BookingSuccess;
