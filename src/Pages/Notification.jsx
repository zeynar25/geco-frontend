import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";

import { jwtDecode } from "jwt-decode";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, safeFetch, ensureTokenValidOrAlert } from "../apiConfig";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faUser,
  faBell,
  faCalendarCheck,
  faCheckCircle,
  faClock,
  faEye,
  faEyeSlash,
  faPesoSign,
  faTrash,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { ClipLoader } from "react-spinners";

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

function formatNotificationDate(dateValue) {
  if (!dateValue) return "-";
  return formatHumanDate(dateValue);
}

function formatHumanDate(dateValue) {
  if (!dateValue) return "-";
  try {
    const d = new Date(dateValue);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(dateValue);
  }
}

function formatTimeHHMM(timeValue) {
  if (!timeValue) return "-";
  try {
    if (typeof timeValue === "string") {
      const parts = timeValue.split(":");
      if (parts.length >= 2)
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    const dt = new Date(timeValue);
    return dt.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return String(timeValue);
  }
}

function getBookingStatusLabel(bookingStatus) {
  if (!bookingStatus) return "-";

  const labels = {
    PENDING: "Pending",
    CANCELLED: "Cancelled",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    COMPLETED: "Completed",
  };

  return labels[bookingStatus] || bookingStatus;
}

function getPaymentStatusLabel(paymentStatus) {
  if (!paymentStatus) return "-";

  const labels = {
    UNPAID: "Unpaid",
    PAYMENT_VERIFICATION: "Payment Verification",
    VERIFIED: "Verified",
    REJECTED: "Rejected",
    REFUNDED: "Refunded",
  };

  return labels[paymentStatus] || paymentStatus;
}

function BookingDetailsModal({ booking, onClose }) {
  const account = booking?.account;
  const accountDetail = account?.detail;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faX} />
        </button>

        <div className="flex items-center gap-3 mb-4 text-[#227B05]">
          <FontAwesomeIcon icon={faCalendarCheck} className="text-xl" />
          <div>
            <h2 className="text-xl font-semibold">Booking Details</h2>
            <p className="text-sm text-gray-600">
              Review the booking linked to this notification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm sm:text-base">
          <div className="col-span-2 rounded-lg border border-[#227B05]/20 bg-green-50 p-4">
            <div className="font-semibold text-[#227B05] mb-2">Visitor</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-gray-500 text-xs">Name</div>
                <div className="font-semibold">
                  {accountDetail?.firstName} {accountDetail?.surname}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Email</div>
                <div className="font-semibold break-all">
                  {accountDetail?.email || "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Contact Number</div>
                <div className="font-semibold">
                  {accountDetail?.contactNumber || "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Account Role</div>
                <div className="font-semibold">{account?.role || "-"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-gray-500 text-xs">Visit Date</div>
            <div className="font-semibold text-[#227B05]">
              {booking?.visitDate ? formatHumanDate(booking.visitDate) : "-"}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-gray-500 text-xs">Visit Time</div>
            <div className="font-semibold text-[#227B05]">
              {formatTimeHHMM(booking?.visitTime)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-gray-500 text-xs">Group Size</div>
            <div className="font-semibold text-[#227B05]">
              {booking?.groupSize != null
                ? `${booking.groupSize} visitor(s)`
                : "-"}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-gray-500 text-xs">Total Price</div>
            <div className="font-semibold text-[#227B05]">
              <FontAwesomeIcon icon={faPesoSign} className="mr-1" />
              {booking?.totalPrice ?? "-"}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-gray-500 text-xs">Booking Status</div>
            <div className="font-semibold text-[#227B05] flex items-center gap-2">
              {booking?.bookingStatus === "PENDING" ? (
                <FontAwesomeIcon icon={faClock} />
              ) : booking?.bookingStatus === "CANCELLED" ||
                booking?.bookingStatus === "REJECTED" ? (
                <FontAwesomeIcon icon={faCircleXmark} />
              ) : booking?.bookingStatus === "APPROVED" ||
                booking?.bookingStatus === "COMPLETED" ? (
                <FontAwesomeIcon icon={faCheckCircle} />
              ) : null}
              <span>{getBookingStatusLabel(booking?.bookingStatus)}</span>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-gray-500 text-xs">Payment Method</div>
            <div className="font-semibold text-[#227B05] flex items-center gap-2">
              <span>{booking?.paymentMethod || "-"}</span>
            </div>
          </div>
          <div className="rounded-lg border p-4 col-span-2 sm:col-span-1">
            <div className="text-gray-500 text-xs">Payment Status</div>
            <div className="font-semibold text-[#227B05]">
              {getPaymentStatusLabel(booking?.paymentStatus)}
            </div>
          </div>
          <div className="rounded-lg border p-4 col-span-2 sm:col-span-1">
            <div className="text-gray-500 text-xs">Booked On</div>
            <div className="font-semibold text-[#227B05]">
              {booking?.createdAt ? formatHumanDate(booking.createdAt) : "-"}
            </div>
          </div>
        </div>

        {booking?.tourPackage && (
          <div className="mt-4 rounded-lg border border-[#227B05]/20 bg-white p-4">
            <div className="text-[#227B05] font-semibold mb-2">
              Tour Package
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs">Name</div>
                <div className="font-semibold">
                  {booking.tourPackage.name || "-"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Price Per Person</div>
                <div className="font-semibold">
                  {booking.tourPackage.pricePerPerson ?? "-"}
                </div>
              </div>
            </div>
          </div>
        )}

        {booking?.staffReply && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <div className="font-semibold mb-1">Staff Reply</div>
            <div>{booking.staffReply}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationPage() {
  const [loggedIn] = useState(isLoggedIn());
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      const handle = async () => {
        const msg = "Please log in to view your notifications.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
      };
      handle();
    }
  }, [loggedIn, navigate]);

  const {
    data: notificationData,
    error: notificationError,
    isPending: notificationPending,
  } = useQuery({
    queryKey: ["notifications", page, size],
    enabled: loggedIn,
    queryFn: async () => {
      ensureTokenValidOrAlert();

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      params.append("sort", "createdAt,desc");

      const response = await safeFetch(
        `${API_BASE_URL}/notification?${params.toString()}`,
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting notifications failed");
      }

      return await response.json();
    },
  });

  if (notificationError) {
    if (notificationError?.message === "TOKEN_EXPIRED") {
      (async () => {
        const msg = "Your session has expired. Please sign in again.";
        try {
          if (typeof window !== "undefined" && window.__showAlert) {
            await window.__showAlert(msg);
          } else if (typeof window !== "undefined" && window.__nativeAlert) {
            window.__nativeAlert(msg);
          } else {
            window.__nativeAlert?.(msg) || alert(msg);
          }
        } catch {
          try {
            (window.__nativeAlert || window.alert)(msg);
          } catch {
            /* empty */
          }
        }
        navigate("/signin");
      })();
    } else {
      (async () => {
        const msg = "Something went wrong while retrieving notifications.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
      })();
    }
  }

  const notifications = notificationData?.content ?? [];
  const totalNotificationPages = notificationData?.totalPages ?? 0;
  const totalNotifications = notificationData?.totalElements ?? 0;
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/notification/mark-all-read`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.error || "Marking all notifications as read failed",
        );
      }

      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      const msg = "All notifications marked as read.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

  const markNotificationMutation = useMutation({
    mutationFn: async ({ id, read }) => {
      ensureTokenValidOrAlert();
      const endpoint = read
        ? `${API_BASE_URL}/notification/${id}/unread`
        : `${API_BASE_URL}/notification/${id}/read`;

      const response = await safeFetch(endpoint, { method: "PATCH" });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating notification status failed");
      }

      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/notification/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Deleting notification failed");
      }

      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      const msg = "Notification deleted.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

  const handlePrevPage = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    if (totalNotificationPages === 0) return;
    setPage((prev) => (prev + 1 < totalNotificationPages ? prev + 1 : prev));
  };

  const openBookingModal = (booking) => {
    if (!booking) return;
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setIsBookingModalOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (markAllAsReadMutation.isPending) return;
    markAllAsReadMutation.mutate();
  };

  const handleNotificationAction = async (notification) => {
    if (!notification?.id) return;
    markNotificationMutation.mutate({
      id: notification.id,
      read: notification.read,
    });
  };

  const handleDeleteNotification = async (notification) => {
    if (!notification?.id) return;

    const confirmed = await (window.__showConfirm
      ? window.__showConfirm("Delete this notification?")
      : Promise.resolve(window.confirm("Delete this notification?")));

    if (!confirmed) return;

    deleteNotificationMutation.mutate(notification.id);
  };

  if (notificationPending) {
    return (
      <>
        <Header />
        <main className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 min-h-screen flex flex-col gap-5">
        <BackButton
          to="/"
          title="Notifications"
          description="Review the latest updates for your bookings."
          extraButton={
            <Link
              to="/my-account"
              className="bg-[#4D9C43] hover:bg-[#4D9C43]/95 text-[#FDDB3C] px-4 py-2 rounded-md flex items-center my-auto"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              <span>My Account</span>
            </Link>
          }
        />

        <section className="bg-white rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-[#4D9C43] text-white px-5 sm:px-10 py-3 md:py-5 font-bold text-lg mb-5 sm:mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBell} />
              <span>All Notifications</span>
            </div>
            <div className="text-sm font-normal">
              {unreadCount} unread / {totalNotifications} total
            </div>
          </div>

          <div className="bg-white px-5 sm:px-10 py-2 md:py-5 text-md flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Latest notifications are shown first.
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleMarkAllAsRead}
                disabled={
                  markAllAsReadMutation.isPending || notifications.length === 0
                }
              >
                {markAllAsReadMutation.isPending
                  ? "Updating..."
                  : "Mark all as read"}
              </button>
            </div>

            {notifications.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">
                    Page {page + 1} of {Math.max(totalNotificationPages, 1)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handlePrevPage}
                      disabled={page === 0}
                    >
                      <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleNextPage}
                      disabled={
                        totalNotificationPages === 0 ||
                        page + 1 >= totalNotificationPages
                      }
                    >
                      <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {notifications.map((notification) => {
                    const hasBooking = Boolean(notification.booking);

                    return (
                      <div
                        key={notification.id}
                        className={`rounded-lg border p-4 shadow-sm transition-colors ${
                          notification.read
                            ? "border-gray-200 bg-white"
                            : "border-[#227B05]/30 bg-green-50"
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                  notification.read
                                    ? "bg-gray-200 text-gray-700"
                                    : "bg-[#227B05] text-white"
                                }`}
                              >
                                {notification.read ? "Read" : "Unread"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatNotificationDate(notification.createdAt)}
                              </span>
                            </div>
                            <div className="text-sm sm:text-base text-gray-800 whitespace-pre-line">
                              {notification.message}
                            </div>

                            {hasBooking && (
                              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="text-gray-500 text-xs">
                                    Visit Date
                                  </div>
                                  <div className="font-semibold">
                                    {notification.booking.visitDate
                                      ? formatHumanDate(
                                          notification.booking.visitDate,
                                        )
                                      : "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs">
                                    Visit Time
                                  </div>
                                  <div className="font-semibold">
                                    {notification.booking.visitTime || "-"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs">
                                    Status
                                  </div>
                                  <div className="font-semibold">
                                    {getBookingStatusLabel(
                                      notification.booking.bookingStatus,
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs">
                                    Payment
                                  </div>
                                  <div className="font-semibold">
                                    {getPaymentStatusLabel(
                                      notification.booking.paymentStatus,
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 lg:justify-end md:flex-row">
                            <button
                              type="button"
                              className="px-3 py-2 rounded-md border border-[#227B05] text-[#227B05] hover:bg-[#227B05]/5 disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() =>
                                openBookingModal(notification.booking)
                              }
                              disabled={!hasBooking}
                            >
                              Show booking
                            </button>

                            <button
                              type="button"
                              className={`px-3 py-2 rounded-md border disabled:opacity-60 disabled:cursor-not-allowed ${
                                notification.read
                                  ? "border-[#227B05] text-[#227B05] hover:bg-[#227B05]/5"
                                  : "border-blue-600 text-blue-600 hover:bg-blue-50"
                              }`}
                              onClick={() =>
                                handleNotificationAction(notification)
                              }
                              disabled={markNotificationMutation.isPending}
                            >
                              <FontAwesomeIcon
                                icon={notification.read ? faEyeSlash : faEye}
                                className="mr-2"
                              />
                              {notification.read ? "Mark unread" : "Mark read"}
                            </button>

                            <button
                              type="button"
                              className="px-3 py-2 rounded-md border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() =>
                                handleDeleteNotification(notification)
                              }
                              disabled={deleteNotificationMutation.isPending}
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-2"
                              />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-gray-600">
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-3xl text-[#227B05]"
                />
                <div className="font-semibold">
                  You have no notifications yet.
                </div>
                <div className="text-sm">Booking updates will appear here.</div>
              </div>
            )}
          </div>
        </section>

        {isBookingModalOpen && selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={closeBookingModal}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

export default NotificationPage;
