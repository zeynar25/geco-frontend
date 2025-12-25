import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faMessage,
  faPesoSign,
  faCheckCircle,
  faCircleXmark,
  faAngleLeft,
  faAngleRight,
  faMoneyBill,
  faEarthAsia,
  faEdit,
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
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    bookingStatus: "",
    paymentStatus: "",
    paymentMethod: "",
    staffReply: "",
  });

  const queryClient = useQueryClient();

  const handlePrevBookingPage = () => {
    setBookingPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextBookingPage = () => {
    setBookingPage((prev) => prev + 1);
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      bookingStatus: booking.bookingStatus || "",
      paymentStatus: booking.paymentStatus || "",
      paymentMethod: booking.paymentMethod || "",
      staffReply: booking.staffReply || "",
    });
  };

  const closeEditModal = () => {
    setEditingBooking(null);
  };

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

  const isAdmin = accountData?.role === "ADMIN";
  const canViewAdmin = loggedIn && isAdmin;

  if (accountData && isAdmin === false) {
    alert("You do not have admin privileges to access this page.");
    navigate("/");
  }

  const {
    data: adminDashboardData,
    error: adminDashboardError,
    isPending: adminDashboardPending,
  } = useQuery({
    queryKey: ["dashboardStatistics"],
    enabled: canViewAdmin,
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
    enabled: canViewAdmin && bookingIn,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const baseUrl = "http://localhost:8080/booking";

      const params = new URLSearchParams();
      params.append("page", bookingPage.toString());
      params.append("size", "10");
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

  const bookingUpdateMutation = useMutation({
    mutationFn: async ({ bookingId, data }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/booking/staff/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating booking failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"], exact: false });
      closeEditModal();
      alert("Booking updated successfully.");
    },
    onError: (error) => {
      alert(error.message || "Updating booking failed");
    },
  });

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editingBooking) return;

    const payload = {};

    if (editForm.bookingStatus) {
      payload.bookingStatus = editForm.bookingStatus;
    }
    if (editForm.paymentStatus) {
      payload.paymentStatus = editForm.paymentStatus;
    }
    if (editForm.paymentMethod) {
      payload.paymentMethod = editForm.paymentMethod;
    }
    if (editForm.staffReply && editForm.staffReply.trim().length > 0) {
      payload.staffReply = editForm.staffReply.trim();
    }

    if (Object.keys(payload).length === 0) {
      closeEditModal();
      return;
    }

    bookingUpdateMutation.mutate({
      bookingId: editingBooking.bookingId,
      data: payload,
    });
  };

  if (accountPending) {
    return (
      <>
        <Header />
        <main className="m-10 text-center">Loading account...</main>
        <Footer />
      </>
    );
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
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
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
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col">
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
                    Unread response
                    {adminDashboardData.unreadFeedback > 1 ? "s" : ""}
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
            <div className="bg-white rounded-lg overflow-hidden shadow-xl">
              <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="mr-2 text-2xl"
                />
                <span>Booking Management</span>
              </div>
              <div>
                <form className="flex justify-around mt-5 my-3 flex-wrap gap-2">
                  <div>
                    <span className="font-semibold">Booking Status:</span>
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
                    <span className="font-semibold">Payment Status:</span>
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
                    <span className="font-semibold">Payment Method:</span>
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
                    (bookings.length > 0 ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Page {bookingPage + 1} of{" "}
                            {Math.max(totalBookingPages, 1)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={handlePrevBookingPage}
                              disabled={bookingPage === 0}
                            >
                              <FontAwesomeIcon icon={faAngleLeft} />
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={handleNextBookingPage}
                              disabled={
                                totalBookingPages === 0 ||
                                bookingPage + 1 >= totalBookingPages
                              }
                            >
                              <FontAwesomeIcon icon={faAngleRight} />
                            </button>
                          </div>
                        </div>

                        {bookings.map((booking) => (
                          <div
                            key={booking.bookingId}
                            className="px-5 md:px-10 py-3 border border-[#227B05] rounded-lg"
                          >
                            <div className="grid grid-cols-3 gap-3 mb-5">
                              {/* Account's details */}
                              <div className="col-span-3 md:col-span-1 flex flex-wrap md:flex-col gap-3 md:gap-1 justify-center">
                                <div className="font-semibold">
                                  {booking.account.detail.firstName}{" "}
                                  {booking.account.detail.surname}
                                </div>
                                <div className="font-semibold">
                                  {booking.account.detail.email}
                                </div>
                                <div className="font-semibold">
                                  {booking.account.detail.contactNumber}
                                </div>
                              </div>

                              {/* Booking & payment statuses and payment method */}
                              <div className="col-span-3 md:col-span-2 flex gap-2 justify-center items-center">
                                <div className="text-sm flex gap-2 flex-wrap justify-center">
                                  <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                                    <div
                                      className={
                                        "font-semibold px-3 py-2 rounded-full text-center " +
                                        (booking.bookingStatus === "PENDING"
                                          ? "bg-[#FDDB3C]"
                                          : booking.bookingStatus ===
                                            "CANCELLED"
                                          ? "bg-[#E32726]/70"
                                          : booking.bookingStatus === "APPROVED"
                                          ? "bg-[#BAD0F8]/90"
                                          : booking.bookingStatus === "REJECTED"
                                          ? "bg-[#E32726]/70"
                                          : booking.bookingStatus ===
                                            "COMPLETED"
                                          ? "bg-[#A86CCB]"
                                          : "")
                                      }
                                    >
                                      {booking.bookingStatus === "PENDING" ? (
                                        <FontAwesomeIcon
                                          icon={faClock}
                                          className="mr-2"
                                        />
                                      ) : booking.bookingStatus ===
                                          "CANCELLED" ||
                                        booking.bookingStatus === "REJECTED" ? (
                                        <FontAwesomeIcon
                                          icon={faCircleXmark}
                                          className="mr-2"
                                        />
                                      ) : booking.bookingStatus ===
                                          "APPROVED" ||
                                        booking.bookingStatus ===
                                          "COMPLETED" ? (
                                        <FontAwesomeIcon
                                          icon={faCheckCircle}
                                          className="mr-2 text-xl"
                                        />
                                      ) : null}
                                      {booking.bookingStatus} BOOKING
                                    </div>
                                  </div>

                                  <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                                    <div
                                      className={
                                        "font-semibold px-3 py-2 rounded-full text-center " +
                                        (booking.paymentStatus === "UNPAID"
                                          ? "bg-[#FDDB3C]"
                                          : booking.paymentStatus === "REJECTED"
                                          ? "bg-[#E32726]/70"
                                          : booking.paymentStatus ===
                                            "PAYMENT_VERIFICATION"
                                          ? "bg-[#BAD0F8]/90"
                                          : booking.paymentStatus === "REFUNDED"
                                          ? "bg-[#E32726]/70"
                                          : booking.paymentStatus === "VERIFIED"
                                          ? "bg-[#A86CCB]"
                                          : "")
                                      }
                                    >
                                      {booking.paymentStatus === "UNPAID" ? (
                                        <FontAwesomeIcon
                                          icon={faClock}
                                          className="mr-2"
                                        />
                                      ) : booking.paymentStatus ===
                                          "REJECTED" ||
                                        booking.paymentStatus === "REFUNDED" ? (
                                        <FontAwesomeIcon
                                          icon={faCircleXmark}
                                          className="mr-2"
                                        />
                                      ) : booking.paymentStatus ===
                                          "PAYMENT_VERIFICATION" ||
                                        booking.paymentStatus === "VERIFIED" ? (
                                        <FontAwesomeIcon
                                          icon={faCheckCircle}
                                          className="mr-2 text-xl"
                                        />
                                      ) : null}
                                      {booking.paymentStatus} PAYMENT
                                    </div>
                                  </div>

                                  <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                                    <div
                                      className={
                                        "font-semibold px-3 py-2 rounded-full text-center " +
                                        (booking.paymentMethod === "PARK"
                                          ? "bg-[#FDDB3C]"
                                          : booking.paymentMethod === "ONLINE"
                                          ? "bg-[#222EDA]/70"
                                          : "")
                                      }
                                    >
                                      {booking.paymentMethod === "PARK" ? (
                                        <FontAwesomeIcon
                                          icon={faMoneyBill}
                                          className="mr-2"
                                        />
                                      ) : booking.paymentMethod === "ONLINE" ? (
                                        <FontAwesomeIcon
                                          icon={faEarthAsia}
                                          className="mr-2"
                                        />
                                      ) : null}
                                      {booking.paymentMethod} PAYMENT METHOD
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="text-gray-600 hover:text-[#227B05]"
                                  onClick={() => openEditModal(booking)}
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                              </div>
                            </div>

                            {/* Booking details */}
                            <div className="grid grid-cols-5 gap-3 mb-5">
                              <div className="col-span-5 sm:col-span-1 flex flex-col text-center">
                                <span>Visit Date:</span>
                                <span className="font-semibold">
                                  {new Date(
                                    booking.visitDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="col-span-5 sm:col-span-1 flex flex-col text-center">
                                <span>Time:</span>
                                <span className="font-semibold">
                                  {booking.visitTime}
                                </span>
                              </div>
                              <div className="col-span-5 sm:col-span-1 flex flex-col text-center">
                                <span>Group Size:</span>
                                <span className="font-semibold">
                                  {booking.groupSize}
                                </span>
                              </div>
                              <div className="col-span-5 sm:col-span-1 flex flex-col text-center">
                                <span>Package:</span>
                                <span className="font-semibold">
                                  {booking.tourPackage.name}
                                </span>
                              </div>
                              <div className="col-span-5 sm:col-span-1 flex flex-col text-center">
                                <span>Total Fee:</span>
                                <span className="font-semibold">
                                  <FontAwesomeIcon icon={faPesoSign} />
                                  {booking.totalPrice}
                                </span>
                              </div>
                            </div>

                            {booking.paymentMethod === "ONLINE" &&
                              (booking.paymentStatus ===
                                "PAYMENT_VERIFICATION" ||
                                booking.paymentStatus === "VERIFIED") && (
                                <div className="bg-[#222EDA]/30 flex gap-3 justify-around rounded-lg p-3 mb-5">
                                  <div className="flex flex-col gap-1 text-center">
                                    <span>Down Payment:</span>
                                    <span className="font-semibold">
                                      <FontAwesomeIcon icon={faPesoSign} />
                                      {booking.totalPrice / 2}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1 text-center">
                                    <span>Proof of Payment:</span>
                                    <span className="underline font-semibold">
                                      View Screenshot
                                    </span>
                                  </div>
                                </div>
                              )}

                            {booking.staffReply && (
                              <div className="bg-[#4D9C43]/30 rounded-lg py-3 px-5 mb-5 flex flex-col">
                                <span>Staff Reply:</span>
                                <span className="font-semibold">
                                  {booking.staffReply}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center text-gray-500 m-5">
                        No bookings yet.
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {financesIn && <div></div>}
        </div>
      </main>

      {editingBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Edit Booking</h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={closeEditModal}
                disabled={bookingUpdateMutation.isPending}
              >
                ✕
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Booking Status</label>
                <select
                  className="border border-gray-300 rounded px-2 py-1"
                  value={editForm.bookingStatus}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      bookingStatus: e.target.value,
                    }))
                  }
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Payment Status</label>
                <select
                  className="border border-gray-300 rounded px-2 py-1"
                  value={editForm.paymentStatus}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      paymentStatus: e.target.value,
                    }))
                  }
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAYMENT_VERIFICATION">
                    PAYMENT_VERIFICATION
                  </option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Payment Method</label>
                <select
                  className="border border-gray-300 rounded px-2 py-1"
                  value={editForm.paymentMethod}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                >
                  <option value="PARK">PARK</option>
                  <option value="ONLINE">ONLINE</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Staff Reply</label>
                <textarea
                  className="border border-gray-300 rounded px-2 py-1 min-h-20"
                  value={editForm.staffReply}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      staffReply: e.target.value,
                    }))
                  }
                  placeholder="Add a note for the guest..."
                />
                <span className="text-xs text-gray-500">
                  At least 5 characters if provided.
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100"
                  onClick={closeEditModal}
                  disabled={bookingUpdateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#227B05]/80 text-white text-sm hover:bg-[#227B05] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={bookingUpdateMutation.isPending}
                >
                  {bookingUpdateMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default AdminDashboard;
