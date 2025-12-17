import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";

import { jwtDecode } from "jwt-decode";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCalendar,
  faClock,
  faPesoSign,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { ClipLoader } from "react-spinners";
import {
  faCheckCircle,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";

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

function Account() {
  const [loggedIn] = useState(isLoggedIn());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // 0-based page index
  const [bookingPage, setBookingPage] = useState(0);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const location = useLocation();
  const backTo = location.state?.from || "/";

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

  useEffect(() => {
    if (accountData?.detail) {
      setFormData(accountData.detail);
    }
  }, [accountData]);

  // When changing the information in the form.
  const handleChange = (field) => (event) => {
    if (!isEditing) return;
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFormData(accountData?.detail || formData);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEditing) return;

    if (!accountData?.accountId) {
      alert("Account information not loaded. Please try again.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/account/update-details/${accountData.accountId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: accountData?.detail?.email,
            surname: formData?.surname,
            firstName: formData?.firstName,
            contactNumber: formData?.contactNumber,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating account details failed");
      }

      const updatedAccount = await response.json();
      if (updatedAccount?.detail) {
        setFormData(updatedAccount.detail);

        // Update cached account data so it stays in sync across the app
        queryClient.setQueryData(["account"], updatedAccount);
      }

      setIsEditing(false);
      alert("Account details updated successfully.");
    } catch (error) {
      alert(error.message || "Something went wrong while updating details.");
    }
  };

  const {
    data: bookingData,
    error: bookingError,
    isPending: bookingPending,
  } = useQuery({
    queryKey: ["bookings", bookingPage],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/booking/me?page=${bookingPage}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Getting my bookings failed");
      }
      return await response.json();
    },
  });

  if (bookingError) {
    alert("something went wrong in retrieving bookings");
  }
  const bookings = bookingData?.content ?? [];
  const totalBookingPages = bookingData?.totalPages ?? 0;

  const {
    data: feedbackData,
    error: feedbackError,
    isPending: feedbackPending,
  } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/feedback/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Getting my bookings failed");
      }
      return await response.json();
    },
  });

  if (feedbackError) {
    alert("something went wrong in retrieving feedbacks");
  }

  const feedbacks = feedbackData?.content ?? [];

  const openFeedbackModal = (feedback) => {
    setSelectedFeedback(feedback);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedFeedback(null);
  };

  const handlePrevBookingPage = () => {
    setBookingPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextBookingPage = () => {
    if (totalBookingPages === 0) return;
    setBookingPage((prev) => (prev + 1 < totalBookingPages ? prev + 1 : prev));
  };

  return (
    <>
      <Header />
      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 flex flex-col gap-5">
        <BackButton
          to={backTo}
          title="My Account"
          description="Manage your account details and bookings."
          extraButton={
            <Link
              to="/park-calendar"
              state={{ from: location.pathname }}
              className="bg-[#4D9C43] hover:bg-[#4D9C43]/95 text-[#FDDB3C] px-4 py-2 rounded-md flex items-center my-auto"
            >
              <FontAwesomeIcon icon={faCalendar} className="mr-2" />
              <span>View Park Calendar</span>
            </Link>
          }
        />

        {/* My profile */}
        <div
          id="#profile"
          className="bg-white rounded-lg overflow-hidden shadow-2xl"
        >
          <div className="bg-[#4D9C43] text-white px-5 sm:px-10 py-2 md:py-5 font-bold text-lg mb-5 sm:mb-2">
            <span>My Profile</span>
          </div>
          <div className="px-5 sm:px-10 py-2 md:py-5 text-md flex flex-col gap-5">
            {/* Email */}
            <div className="bg-[#BAD0F8] px-5 sm:px-10 py-2 md:py-5 flex flex-col gap-2 rounded-lg border border-[#222EDA]">
              <div>
                <span className="font-bold">Email: </span>{" "}
                {accountData?.detail?.email}
              </div>
              <div className="text-[#222EDA]">
                Your email is managed by the park and cannot be changed here.
                Please contact the park administration for any changes.
              </div>
            </div>

            {/* Names and Contact Number */}
            <form className="grid grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="" className="font-semibold">
                  Surname
                </label>
                <input
                  className="w-full border px-5 py-3 rounded-md"
                  type="text"
                  id="surname"
                  name="surname"
                  required
                  readOnly={!isEditing}
                  value={formData?.surname || ""}
                  onChange={handleChange("surname")}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="" className="font-semibold">
                  First name
                </label>
                <input
                  className="w-full border px-5 py-3 rounded-md"
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  readOnly={!isEditing}
                  value={formData?.firstName || ""}
                  onChange={handleChange("firstName")}
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="" className="font-semibold">
                  Contact Number
                </label>
                <input
                  className="w-full border px-5 py-3 rounded-md"
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  required
                  readOnly={!isEditing}
                  value={formData?.contactNumber || ""}
                  onChange={handleChange("contactNumber")}
                />
              </div>
              <div className="col-span-2 flex justify-center gap-3">
                {!isEditing ? (
                  <button
                    type="button"
                    className="mt-5 px-5 py-3 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="mt-5 px-5 py-3 border bg-white hover:bg-black/10 cursor-pointer text-black rounded-md font-semibold"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="mt-5 px-5 py-3 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold  cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* My bookings */}
        <div
          id="#bookings"
          className="bg-white rounded-lg overflow-hidden shadow-2xl"
        >
          <div className="bg-[#4D9C43] text-white px-5 sm:px-10 py-2 md:py-5 font-bold text-lg mb-5 sm:mb-2">
            <span>My Bookings</span>
          </div>
          <div className="bg-white px-5 sm:px-10 py-2 md:py-5 text-md flex flex-col gap-5">
            {bookingPending ? (
              <div className="flex justify-center items-center col-span-2 lg:col-span-3 py-10">
                <ClipLoader color="#17EB88" size={40} />
                <span className="ml-3 font-semibold">
                  Loading Tour packages...
                </span>
              </div>
            ) : bookings.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-3">
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 justify-between">
                      <div className="col-span-2 xs:col-span-1 flex flex-col justify-center items-center">
                        <div className="text-[#227B05] font-semibold text-lg">
                          Visit on:{" "}
                          {new Date(booking.visitDate).toLocaleDateString()}
                        </div>
                        <div>
                          {booking.groupSize} visitor(s) at {booking.visitTime}
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
                            <FontAwesomeIcon icon={faClock} className="mr-2" />
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
                        {/* Payment Status: {booking.paymentStatus} */}
                      </div>
                    </div>
                    {booking.bookingStatus === "PENDING" ? (
                      <div className="text-sm text-gray-600 text-center mt-5">
                        Waiting for staff confirmation
                      </div>
                    ) : booking.bookingStatus === "APPROVED" &&
                      booking.paymentMethod === "ONLINE" &&
                      booking.paymentStatus == "UNPAID" ? (
                      <div className=" bg-[#222EDA]/15 text-[#222EDA] px-5 xs:px-10 sm:px-15 md:px-20 lg:px-25 py-3 rounded-md border border-[#222EDA] mt-5 w-fit mx-auto flex flex-col gap-3">
                        <div className="flex font-semibold mb-2">
                          <span>Down payment: </span>
                          <span>
                            <FontAwesomeIcon icon={faPesoSign} />
                            {booking.totalPrice / 2}{" "}
                          </span>
                        </div>
                        <button className="bg-[#222EDA] text-white px-5 py-2 rounded-lg self-center">
                          Submit payment
                        </button>
                      </div>
                    ) : booking.bookingStatus === "APPROVED" &&
                      booking.paymentMethod === "ONLINE" &&
                      booking.paymentStatus == "PAYMENT_VERIFICATION" ? (
                      <div className="text-sm text-gray-600 text-center mt-5">
                        Waiting for staff confirmation on your down payment
                      </div>
                    ) : booking.bookingStatus === "APPROVED" &&
                      booking.paymentMethod === "ONLINE" &&
                      booking.paymentStatus == "VERIFIED" ? (
                      <div className="text-sm text-gray-600 text-center mt-5">
                        Payment verified! You’re all set for your visit. See you
                        there!
                      </div>
                    ) : booking.bookingStatus === "APPROVED" &&
                      booking.paymentMethod === "PARK" ? (
                      <div className="text-sm text-gray-600 text-center mt-5">
                        Reservation confirmed! Just kindly prepare your full
                        payment in cash once your arrived at the park. See you
                        there!
                      </div>
                    ) : booking.bookingStatus === "COMPLETED" ? (
                      (() => {
                        const bookingFeedback = feedbacks.find(
                          (feedback) =>
                            feedback.booking?.bookingId === booking.bookingId
                        );

                        if (bookingFeedback) {
                          return (
                            <div className="text-sm text-gray-600 text-center mt-5">
                              <div>
                                Thank you for your{" "}
                                <button
                                  type="button"
                                  className="underline text-[#227B05] font-semibold"
                                  onClick={() =>
                                    openFeedbackModal(bookingFeedback)
                                  }
                                >
                                  feedback
                                </button>
                                !
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="text-sm text-gray-600 text-center mt-5">
                            {booking.staffReply && (
                              <div className="mb-2">{booking.staffReply}</div>
                            )}
                            <Link
                              to={`/feedback?bookingId=${booking.bookingId}`}
                              className="inline-block mt-2 px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold"
                            >
                              Add feedback
                            </Link>
                          </div>
                        );
                      })()
                    ) : null}
                  </div>
                ))}
              </>
            ) : (
              <div>You have no bookings yet.</div>
            )}
          </div>
        </div>
      </div>
      {isFeedbackModalOpen &&
        selectedFeedback &&
        (feedbackPending ? (
          <div className="flex justify-center items-center col-span-2 lg:col-span-3 py-10">
            <ClipLoader color="#17EB88" size={20} />
            <span className="ml-3 font-semibold">Loading Feedbacks...</span>
          </div>
        ) : (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeFeedbackModal}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                onClick={closeFeedbackModal}
              >
                <FontAwesomeIcon icon={faX} />
              </button>
              <h2 className="text-xl font-semibold mb-3 text-[#227B05]">
                Your Feedback
              </h2>
              {selectedFeedback.stars != null && (
                <div className="mb-2">
                  <span className="font-semibold">Rating: </span>
                  <span>{selectedFeedback.stars} / 5.0</span>
                </div>
              )}
              {selectedFeedback.comment && (
                <div className="mb-2">
                  <span className="font-semibold">Comment: </span>
                  <span>{selectedFeedback.comment}</span>
                </div>
              )}
              {selectedFeedback.suggestion && (
                <div className="mb-4">
                  <span className="font-semibold">Suggestion: </span>
                  <span>{selectedFeedback.suggestion}</span>
                </div>
              )}
              {selectedFeedback.staffReply && (
                <div className="mb-4">
                  <span className="font-semibold">Park Reply: </span>
                  <span>{selectedFeedback.staffReply}</span>
                </div>
              )}
              {!selectedFeedback.comment && !selectedFeedback.suggestion && (
                <div className="text-sm text-gray-600 mb-4">
                  No additional details provided.
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold"
                  onClick={closeFeedbackModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ))}
      <Footer />
    </>
  );
}

export default Account;
