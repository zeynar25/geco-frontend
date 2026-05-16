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
  faFilter,
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

function getNotificationBookingAction(booking) {
  if (!booking) return null;

  if (
    booking.bookingStatus === "APPROVED" &&
    booking.paymentMethod === "ONLINE" &&
    booking.paymentStatus === "UNPAID"
  ) {
    return {
      type: "pay",
      label: "Submit payment",
      className:
        "px-3 py-2 rounded-md bg-[#222EDA] text-white hover:bg-[#1b26b6]",
    };
  }

  if (
    booking.bookingStatus === "APPROVED" &&
    booking.paymentMethod === "ONLINE" &&
    booking.paymentStatus === "REJECTED"
  ) {
    return {
      type: "resubmit",
      label: "Resubmit payment",
      className: "px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700",
    };
  }

  return null;
}

function NotificationFilterModal({
  isOpen,
  readFilter,
  startDate,
  endDate,
  onChangeReadFilter,
  onChangeStartDate,
  onChangeEndDate,
  onApply,
  onClear,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#227B05]">
              Filter Notifications
            </h2>
            <p className="text-sm text-gray-600">
              Choose read state and date range, then apply the filter.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Read status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "All", value: "" },
                { label: "Read", value: "true" },
                { label: "Unread", value: "false" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    readFilter === option.value
                      ? "border-[#227B05] bg-[#227B05] text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => onChangeReadFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Start date
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#227B05] focus:outline-none"
                value={startDate}
                onChange={(event) => onChangeStartDate(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                End date
              </label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#227B05] focus:outline-none"
                value={endDate}
                onChange={(event) => onChangeEndDate(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              onClick={onClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-md bg-[#227B05] px-4 py-2 font-semibold text-white hover:bg-[#1d6804]"
              onClick={onApply}
            >
              Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingDetailsModal({ booking, onClose, onViewProof }) {
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

        {booking?.proofOfPaymentPhoto && (
          <div className="mt-4 rounded-lg border border-[#227B05]/20 bg-blue-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-[#227B05]">
                  Proof of Payment
                </div>
                <div className="text-sm text-gray-600">
                  A payment screenshot was uploaded for this booking.
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-[#227B05] text-[#227B05] hover:bg-[#227B05]/5 font-semibold"
                onClick={() => onViewProof?.(booking)}
              >
                View proof
              </button>
            </div>
          </div>
        )}

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [draftReadFilter, setDraftReadFilter] = useState("");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [appliedReadFilter, setAppliedReadFilter] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isResubmittingPayment, setIsResubmittingPayment] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isProofLoading, setIsProofLoading] = useState(false);

  const { data: paymentSettingsData, error: paymentSettingsError } = useQuery({
    queryKey: ["paymentSettingsActive"],
    enabled: loggedIn,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/payment-settings/active`);
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting payment settings failed");
      }
      return await response.json();
    },
  });

  useEffect(() => {
    if (!paymentSettingsError) return;
    const handle = async () => {
      const msg = "Something went wrong while retrieving payment settings.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    };
    handle();
  }, [paymentSettingsError]);

  const paymentQrUrl = paymentSettingsData?.gcashQrImage
    ? paymentSettingsData.gcashQrImage.startsWith("http")
      ? paymentSettingsData.gcashQrImage
      : `${API_BASE_URL}${paymentSettingsData.gcashQrImage}`
    : "";

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
    queryKey: [
      "notifications",
      page,
      size,
      appliedReadFilter,
      appliedStartDate,
      appliedEndDate,
    ],
    enabled: loggedIn,
    queryFn: async () => {
      ensureTokenValidOrAlert();

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", size.toString());
      params.append("sort", "createdAt,desc");
      if (appliedReadFilter !== "") {
        params.append("isRead", appliedReadFilter);
      }
      if (appliedStartDate) {
        params.append("startDate", appliedStartDate);
      }
      if (appliedEndDate) {
        params.append("endDate", appliedEndDate);
      }

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

  const filteredEmptyMessage = (() => {
    const readLabel =
      appliedReadFilter === "true"
        ? "read"
        : appliedReadFilter === "false"
          ? "unread"
          : null;
    const dateText =
      appliedStartDate || appliedEndDate ? "selected date range" : null;

    if (readLabel && dateText) {
      return `No ${readLabel} notifications found for the selected date range.`;
    }
    if (readLabel) {
      return `No ${readLabel} notifications found.`;
    }
    if (dateText) {
      return "No notifications found for the selected date range.";
    }
    return "You have no notifications yet.";
  })();

  const openFilterModal = () => {
    setDraftReadFilter(appliedReadFilter);
    setDraftStartDate(appliedStartDate);
    setDraftEndDate(appliedEndDate);
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const applyFilters = () => {
    setAppliedReadFilter(draftReadFilter);
    setAppliedStartDate(draftStartDate);
    setAppliedEndDate(draftEndDate);
    setPage(0);
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    setDraftReadFilter("");
    setDraftStartDate("");
    setDraftEndDate("");
    setAppliedReadFilter("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setPage(0);
    setIsFilterModalOpen(false);
  };

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

  const openProofModal = (booking) => {
    if (!booking?.proofOfPaymentPhoto) return;
    setSelectedProofUrl(booking.proofOfPaymentPhoto);
    setIsProofLoading(true);
    setIsProofModalOpen(true);
  };

  const closeProofModal = () => {
    setSelectedProofUrl(null);
    setIsProofModalOpen(false);
    setIsProofLoading(false);
  };

  const openPaymentModal = (booking) => {
    if (!booking) return;
    setSelectedBookingForPayment(booking);
    setPaymentFile(null);
    setIsResubmittingPayment(booking.paymentStatus === "REJECTED");
  };

  const closePaymentModal = () => {
    setSelectedBookingForPayment(null);
    setPaymentFile(null);
    setIsResubmittingPayment(false);
  };

  const handlePaymentFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPaymentFile(file);
  };

  const handleSubmitPayment = async () => {
    if (!selectedBookingForPayment) return;

    if (!paymentFile) {
      const msg = "Please select a file as proof of payment.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    setIsSubmittingPayment(true);

    try {
      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify({})], { type: "application/json" }),
      );
      formData.append("resubmit", isResubmittingPayment ? "true" : "false");
      formData.append("proofOfPayment", paymentFile);

      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/booking/${selectedBookingForPayment.bookingId}`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.error || "Submitting payment proof failed. Please try again.",
        );
      }

      await response.json();
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      await queryClient.invalidateQueries({
        queryKey: ["latestNotifications"],
      });

      const msg =
        "Payment proof submitted successfully.\nWe'll verify it shortly.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);

      closePaymentModal();
    } catch (error) {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }

      const msg =
        error?.message ||
        "Something went wrong while submitting your payment proof.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-[#227B05] text-[#227B05] hover:bg-[#227B05]/5 rounded-md font-semibold"
                  onClick={openFilterModal}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Open filter
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleMarkAllAsRead}
                  disabled={
                    markAllAsReadMutation.isPending ||
                    notifications.length === 0
                  }
                >
                  {markAllAsReadMutation.isPending
                    ? "Updating..."
                    : "Mark all as read"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-600">
                Page {notifications.length > 0 ? page + 1 : 0} of{" "}
                {Math.max(totalNotificationPages, 0)}
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

            {notifications.length > 0 ? (
              <div className="flex flex-col gap-4">
                {notifications.map((notification) => {
                  const hasBooking = Boolean(notification.booking);
                  const bookingAction = getNotificationBookingAction(
                    notification.booking,
                  );

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

                          {bookingAction && hasBooking && (
                            <button
                              type="button"
                              className={bookingAction.className}
                              onClick={() =>
                                openPaymentModal(notification.booking)
                              }
                            >
                              {bookingAction.label}
                            </button>
                          )}

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
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-gray-600">
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-3xl text-[#227B05]"
                />
                <div className="text-center font-semibold">
                  {filteredEmptyMessage}
                </div>
                <div className="text-sm text-center">
                  Use the filter button to adjust read status or date range.
                </div>
              </div>
            )}
          </div>
        </section>

        <NotificationFilterModal
          isOpen={isFilterModalOpen}
          readFilter={draftReadFilter}
          startDate={draftStartDate}
          endDate={draftEndDate}
          onChangeReadFilter={setDraftReadFilter}
          onChangeStartDate={setDraftStartDate}
          onChangeEndDate={setDraftEndDate}
          onApply={applyFilters}
          onClear={clearFilters}
          onClose={closeFilterModal}
        />

        {isBookingModalOpen && selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={closeBookingModal}
            onViewProof={openProofModal}
          />
        )}

        {selectedBookingForPayment && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:py-10"
            onClick={closePaymentModal}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative max-h-[calc(100vh-4rem)] overflow-y-auto sm:max-h-[calc(100vh-5rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                onClick={closePaymentModal}
              >
                <FontAwesomeIcon icon={faX} />
              </button>
              <h2 className="text-xl font-semibold mb-3 text-[#227B05]">
                {isResubmittingPayment
                  ? "Resubmit Payment Proof"
                  : "Submit Payment Proof"}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Please upload a clear photo or screenshot of your payment
                transaction for your booking on{" "}
                <span className="font-semibold">
                  {selectedBookingForPayment.visitDate
                    ? formatHumanDate(selectedBookingForPayment.visitDate)
                    : "-"}
                </span>
                .
              </p>
              <div className="mb-4 rounded-lg border border-[#227B05]/20 bg-green-50 p-4">
                <div className="font-semibold text-[#227B05]">
                  GCash Details
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Number: </span>
                  <span>
                    {paymentSettingsData?.gcashNumber || "Loading number..."}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Account name: </span>
                  <span>{paymentSettingsData?.gcashAccountName || "-"}</span>
                </div>
                {paymentQrUrl && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      QR Code
                    </div>
                    <img
                      src={paymentQrUrl}
                      alt="GCash QR code"
                      className="mx-auto w-full max-w-[220px] max-h-40 rounded border bg-white object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">
                  Proof of payment
                </label>
                <div className="flex items-center gap-3">
                  <label
                    className={`px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors ${
                      isSubmittingPayment
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span>Choose file</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePaymentFileChange}
                      disabled={isSubmittingPayment}
                    />
                  </label>
                  <span className="text-xs text-gray-500 truncate">
                    {paymentFile ? paymentFile.name : "No file chosen"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPG, PNG. Max size depends on your network
                  and server limits.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md font-semibold hover:bg-black/5"
                  onClick={closePaymentModal}
                  disabled={isSubmittingPayment}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleSubmitPayment}
                  disabled={isSubmittingPayment}
                >
                  {isSubmittingPayment
                    ? "Submitting..."
                    : isResubmittingPayment
                      ? "Resubmit"
                      : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                <FontAwesomeIcon icon={faX} />
              </button>
              <h2 className="text-lg font-semibold mb-3 text-[#227B05]">
                Proof of Payment
              </h2>
              <div className="flex justify-center items-center min-h-[200px]">
                {isProofLoading && (
                  <div className="flex flex-col items-center gap-2 text-gray-600">
                    <ClipLoader color="#227B05" size={32} />
                    <span className="text-sm">Loading image...</span>
                  </div>
                )}
                <img
                  src={
                    selectedProofUrl.startsWith("http")
                      ? selectedProofUrl
                      : `${API_BASE_URL}${selectedProofUrl}`
                  }
                  alt="Proof of payment"
                  className={`max-h-[70vh] w-auto object-contain border rounded-md ${
                    isProofLoading ? "hidden" : ""
                  }`}
                  onLoad={() => setIsProofLoading(false)}
                  onError={() => {
                    setIsProofLoading(false);
                    const msg =
                      "Failed to load proof of payment image. Please try again.";
                    if (typeof window !== "undefined" && window.__showAlert) {
                      window.__showAlert(msg);
                    } else {
                      window.__nativeAlert?.(msg) || alert(msg);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default NotificationPage;
