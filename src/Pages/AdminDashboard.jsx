import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";

import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faMessage,
  faPesoSign,
  faCheckCircle,
  faCircleXmark,
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

function AdminDashboard() {
  const location = useLocation();
  const backTo = location.state?.from || "/";
  const navigate = useNavigate();

  const [loggedIn] = useState(isLoggedIn());

  const [bookingIn, setBookingIn] = useState(true);
  const [financesIn, setFinancesIn] = useState(false);
  const [trendsIn, setTrendsIn] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [bookingPage, setBookingPage] = useState(0);
  const [feedbacks] = useState([]);
  const openFeedbackModal = () => {};
  const openNewFeedbackModal = () => {};

  useEffect(() => {
    if (!loggedIn) {
      alert("Please log in to book a visit.");
      navigate("/signin");
    }
  }, [loggedIn, navigate]);

  const {
    data: accountData,
    error: accountError,
    isPending: accountPending,
  } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const account = await fetch(
        `http://localhost:8080/account/${decoded.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!account.ok) {
        const error = await account.json();
        throw new Error(error?.error || "Getting account failed");
      }
      return await account.json();
    },
  });

  if (accountError) {
    alert("something went wrong in retrieving account");
  }

  if (accountData && accountData.role !== "ADMIN") {
    alert("You do not have admin privileges to access this page.");
    navigate("/");
  }

  const {
    data: adminDashboardData,
    error: adminDashboardError,
    isPending: adminDashboardPending,
  } = useQuery({
    queryKey: ["dashboardStatistics"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const stats = await fetch("http://localhost:8080/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!stats.ok) {
        const error = await stats.json();
        throw new Error(error?.error || "Getting dashboard statistics failed");
      }
      return await stats.json();
    },
  });

  if (adminDashboardError) {
    alert("something went wrong in retrieving dashboard statistics");
  }

  const {
    data: bookingData,
    error: bookingError,
    isPending: bookingPending,
  } = useQuery({
    queryKey: [
      "bookings",
      bookingPage,
      bookingFilter,
      paymentFilter,
      paymentMethodFilter,
    ],
    enabled: bookingIn,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const baseUrl = "http://localhost:8080/booking";

      const params = new URLSearchParams();
      params.append("page", bookingPage.toString());
      params.append("size", "5");
      if (bookingFilter !== "ALL") {
        params.append("bookingStatus", bookingFilter.toUpperCase());
      }
      if (paymentFilter !== "ALL") {
        params.append("paymentStatus", paymentFilter.toUpperCase());
      }
      if (paymentMethodFilter !== "ALL") {
        params.append("paymentMethod", paymentMethodFilter.toUpperCase());
      }

      const queryString = params.toString();
      const endpoint = `${baseUrl}?${queryString}`;

      console.log("Fetching bookings from:", endpoint);

      const bookings = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!bookings.ok) {
        const error = await bookings.json();
        throw new Error(error?.error || "Getting bookings failed");
      }
      return await bookings.json();
    },
  });

  if (bookingError) {
    alert("something went wrong in retrieving bookings");
  }

  const bookings = bookingData?.content ?? [];
  const totalBookingPages = bookingData?.totalPages ?? 0;

  return (
    <>
      <Header />
      <main className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 flex flex-col gap-5">
        <BackButton
          to={backTo}
          title="Admin Dashboard"
          description="Manage bookings, review feedbacks, and track park performance."
        />

        <div>
          {adminDashboardPending ? (
            <div className="flex flex-col items-center justify-center gap-4 h-100">
              <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Loading dashboard statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              <div className="col-span-4 sm:col-span-2 lg:col-span-1 bg-white p-5 rounded shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col justify-between">
                    <span className="font-semibold text-sm">
                      This Month's Booking
                    </span>
                    <span className="font-bold text-lg">
                      {adminDashboardData.monthlyBooking}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="text-xl bg-[#BAD0F8] text-[#222EDA] p-3 rounded-md"
                  />
                </div>
              </div>

              <div className="col-span-4 sm:col-span-2 lg:col-span-1 bg-white p-5 rounded shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col justify-between">
                    <span className="font-semibold text-sm">
                      This Month's Revenue
                    </span>
                    <span className="font-bold text-lg">
                      <FontAwesomeIcon icon={faPesoSign} />
                      {adminDashboardData.monthlyRevenue}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faPesoSign}
                    className="text-xl bg-[#227B05]/20 text-[#227B05] p-3 rounded-md"
                  />
                </div>
              </div>

              <div className="col-span-4 sm:col-span-2 lg:col-span-1 bg-white p-5 rounded shadow-lg">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      Pending Booking{" "}
                      {adminDashboardData.pendingBookings > 1 ? "s" : ""}
                    </span>
                    <span className="font-bold text-lg">
                      {adminDashboardData.pendingBookings}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-xl bg-[#97750B]/20 text-[#97750B] p-3 rounded-md"
                  />
                </div>

                {adminDashboardData.pendingBookings > 0 && (
                  <div className="text-sm text-gray-600 mt-3">
                    Requires attention
                  </div>
                )}
              </div>

              <div className="col-span-4 sm:col-span-2 lg:col-span-1 bg-white p-5 rounded shadow-lg">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      New Feedback
                      {adminDashboardData.unreadFeedback > 1 ? "s" : ""}
                    </span>
                    <span className="font-bold text-lg">
                      {adminDashboardData.unreadFeedback}
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faMessage}
                    className="text-xl bg-[#A86CCB]/20 text-[#A86CCB] p-3 rounded-md"
                  />
                </div>

                {adminDashboardData.unreadFeedback > 0 && (
                  <div className="text-sm text-gray-600 mt-3">
                    Unread responses
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-xl flex justify-around">
          <button
            type="button"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              bookingIn ? "text-[#227B05]" : "text-black"
            }`}
            onClick={() => {
              setBookingIn(true);
              setFinancesIn(false);
              setTrendsIn(false);
            }}
          >
            Bookings
          </button>{" "}
          <button
            type="button"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              financesIn ? "text-[#227B05]" : "text-black"
            }`}
            onClick={() => {
              setBookingIn(false);
              setFinancesIn(true);
              setTrendsIn(false);
            }}
          >
            Finances
          </button>{" "}
          <button
            type="button"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              trendsIn ? "text-[#227B05]" : "text-black"
            }`}
            onClick={() => {
              setBookingIn(false);
              setFinancesIn(false);
              setTrendsIn(true);
            }}
          >
            Trends
          </button>
        </div>

        <div>
          {bookingIn && (
            <div className="rounded-lg overflow-hidden shadow-xl">
              <div className="text-white bg-[#48BF56] px-4 py-2">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="mr-2 text-lg"
                />
                <span>Booking Management</span>
              </div>
              <div>
                <form className="flex justify-around mt-3">
                  <div>
                    <span>Booking Status:</span>
                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value)}
                      className="ml-2 border border-[#227B05]"
                    >
                      <option value="ALL">All</option>
                      <option value="PENDING">Pending</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <span>Payment Status:</span>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="ml-2 border border-[#227B05]"
                    >
                      <option value="ALL">All</option>
                      <option value="UNPAID">Unpaid</option>
                      <option value="PAYMENT_VERIFICATION">
                        Payment Verified
                      </option>
                      <option value="VERIFIED">Verified</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <span>Payment Method:</span>
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      className="ml-2 border border-[#227B05]"
                    >
                      <option value="ALL">All</option>
                      <option value="PARK">On-park</option>
                      <option value="ONLINE">Online</option>
                    </select>
                  </div>
                </form>
                <div className="p-4 flex flex-col gap-5">
                  {bookingPending && (
                    <p className="text-gray-600 text-sm">Loading bookings...</p>
                  )}

                  {!bookingPending &&
                    bookingData &&
                    bookings.map((booking) => (
                      <div
                        key={booking.bookingId}
                        className="px-5 md:px-10 py-3 border border-[#227B05] rounded-lg"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 justify-between">
                          <div className="col-span-2 xs:col-span-1 flex flex-col justify-center items-center">
                            <div className="text-[#227B05] font-semibold text-lg">
                              Visit on:{" "}
                              {new Date(booking.visitDate).toLocaleDateString()}
                            </div>
                            <div>
                              {booking.groupSize} visitor(s) at{" "}
                              {booking.visitTime}
                            </div>
                          </div>
                          <div className="col-span-2 xs:col-span-1 flex flex-col justify-center items-center text-center">
                            <div>{booking.tourPackage.name}</div>
                            <div>
                              <FontAwesomeIcon icon={faPesoSign} />
                              {booking.totalPrice}
                            </div>
                          </div>
                          <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                            {/* Payment Method: {booking.paymentMethod} */}
                            <div
                              className={
                                "font-semibold px-3 py-2 rounded-full " +
                                (booking.bookingStatus === "PENDING"
                                  ? "bg-[#FDDB3C]"
                                  : booking.bookingStatus === "CANCELLED"
                                  ? "bg-[#E32726]/70"
                                  : booking.bookingStatus === "APPROVED"
                                  ? "bg-[#BAD0F8]/90"
                                  : booking.bookingStatus === "REJECTED"
                                  ? "bg-[#E32726]/70"
                                  : booking.bookingStatus === "COMPLETED"
                                  ? "bg-[#A86CCB]"
                                  : "")
                              }
                            >
                              {booking.bookingStatus === "PENDING" ? (
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="mr-2"
                                />
                              ) : booking.bookingStatus === "CANCELLED" ||
                                booking.bookingStatus === "REJECTED" ? (
                                <FontAwesomeIcon
                                  icon={faCircleXmark}
                                  className="mr-2"
                                />
                              ) : booking.bookingStatus === "APPROVED" ||
                                booking.bookingStatus === "COMPLETED" ? (
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="mr-2 text-xl"
                                />
                              ) : null}
                              {booking.bookingStatus}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {financesIn && <div></div>}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default AdminDashboard;
