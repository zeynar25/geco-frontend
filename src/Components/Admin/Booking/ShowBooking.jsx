import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
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

function ShowBooking(props) {
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [bookingPage, setBookingPage] = useState(0);

  const [searchEmail, setSearchEmail] = useState("");

  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);

  const handlePrevBookingPage = () => {
    setBookingPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextBookingPage = () => {
    setBookingPage((prev) => prev + 1);
  };

  const openProofModal = (booking) => {
    if (!booking.proofOfPaymentPhoto) {
      alert("No proof of payment uploaded for this booking.");
      return;
    }

    setSelectedProofUrl(booking.proofOfPaymentPhoto);
    setIsProofModalOpen(true);
  };

  const closeProofModal = () => {
    setIsProofModalOpen(false);
    setSelectedProofUrl(null);
  };
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
      startDateFilter,
      endDateFilter,
      searchEmail,
    ],
    enabled: props.canViewDashboard && props.bookingIn,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const baseUrl = `${API_BASE_URL}/booking`;

      const params = new URLSearchParams();
      params.append("page", bookingPage.toString());
      params.append("size", "10");
      const trimmedEmail = searchEmail.trim();
      if (bookingFilter !== "ALL") {
        params.append("bookingStatus", bookingFilter.toUpperCase());
      }
      if (paymentFilter !== "ALL") {
        params.append("paymentStatus", paymentFilter.toUpperCase());
      }
      if (paymentMethodFilter !== "ALL") {
        params.append("paymentMethod", paymentMethodFilter.toUpperCase());
      }

      if (trimmedEmail) {
        params.append("email", trimmedEmail);
      }

      if (startDateFilter) {
        params.append("startDate", startDateFilter);
      }

      if (endDateFilter) {
        params.append("endDate", endDateFilter);
      }

      const queryString = params.toString();
      const endpoint = `${baseUrl}?${queryString}`;

      ensureTokenValidOrAlert();
      const bookings = await safeFetch(endpoint);
      if (!bookings.ok) {
        const error = await bookings.json().catch(() => null);
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
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
        <FontAwesomeIcon icon={faCalendarCheck} className="mr-3 text-2xl" />
        <span>Booking Management</span>
      </div>
      <div>
        <div className="border-b border-gray-100 bg-white">
          <form className="flex flex-wrap items-end gap-4 px-5 py-4 text-sm justify-between">
            <div className="flex flex-col min-w-[200px]">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Search by Email
              </span>
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value);
                  setBookingPage(0);
                }}
                placeholder="Enter email or part of it"
                className="border border-[#227B05] rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
              />
            </div>
            <div className="flex flex-col min-w-[150px]">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Booking Status
              </span>
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="border border-[#227B05] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="flex flex-col min-w-40">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Payment Status
              </span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="border border-[#227B05] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
              >
                <option value="ALL">All</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PAYMENT_VERIFICATION">
                  Payment Verification
                </option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="flex flex-col min-w-[150px]">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Payment Method
              </span>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="border border-[#227B05] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
              >
                <option value="ALL">All</option>
                <option value="PARK">On-park</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>

            <div className="flex flex-col min-w-[220px]">
              <span className="text-xs font-semibold text-gray-600 mb-1">
                Visit Date Range
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => {
                    setStartDateFilter(e.target.value);
                    setBookingPage(0);
                  }}
                  className="border border-[#227B05] rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => {
                    setEndDateFilter(e.target.value);
                    setBookingPage(0);
                  }}
                  className="border border-[#227B05] rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
                />
              </div>
            </div>
          </form>
        </div>

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
                    Page {bookingPage + 1} of {Math.max(totalBookingPages, 1)}
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
                              ) : booking.paymentStatus === "REJECTED" ||
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
                          onClick={() => props.onEditBooking?.(booking)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                    </div>

                    <hr className="mb-5" />

                    {/* Booking details */}
                    <div className="grid grid-cols-5 gap-3 mb-5">
                      <div className="col-span-5 sm:col-span-1 flex flex-col text-center">
                        <span>Visit Date:</span>
                        <span className="font-semibold">
                          {new Date(booking.visitDate).toLocaleDateString()}
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
                      (booking.paymentStatus === "PAYMENT_VERIFICATION" ||
                        booking.paymentStatus === "VERIFIED" ||
                        booking.paymentStatus === "REJECTED") && (
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
                            <button
                              type="button"
                              className="underline font-semibold text-[#227B05] hover:text-[#125003]"
                              onClick={() => openProofModal(booking)}
                            >
                              View Screenshot
                            </button>
                          </div>
                        </div>
                      )}

                    {booking.staffReply && (
                      <div className="bg-[#4D9C43]/30 rounded-lg py-3 px-5 mb-5 flex flex-col">
                        <span>Agri-Eco Park Management: </span>
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
      {isProofModalOpen && selectedProofUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={closeProofModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
              onClick={closeProofModal}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-3 text-[#227B05]">
              Proof of Payment
            </h2>
            <div className="flex justify-center items-center">
              <img
                src={
                  selectedProofUrl.startsWith("http")
                    ? selectedProofUrl
                    : `${API_BASE_URL}${selectedProofUrl}`
                }
                alt="Proof of payment"
                className="max-h-[70vh] w-auto object-contain border rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowBooking;
