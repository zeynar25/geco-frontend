import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";

import { jwtDecode } from "jwt-decode";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, safeFetch, ensureTokenValidOrAlert } from "../apiConfig";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCalendar,
  faClock,
  faPesoSign,
  faX,
  faStar as faStarSolid,
} from "@fortawesome/free-solid-svg-icons";
import { ClipLoader } from "react-spinners";
import {
  faCheckCircle,
  faCircleXmark,
  faStar as faStarRegular,
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

  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    stars: "",
    comment: "",
    suggestion: "",
    categoryId: "",
  });

  const [isCreatingFeedback, setIsCreatingFeedback] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isResubmittingPayment, setIsResubmittingPayment] = useState(false);

  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);
  const [isProofLoading, setIsProofLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 0-based page index
  const [bookingPage, setBookingPage] = useState(0);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const location = useLocation();
  const backTo = location.state?.from || "/";

  useEffect(() => {
    if (!loggedIn) {
      const handle = async () => {
        const msg = "Please log in to book a visit.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
      };
      handle();
    }
  }, [loggedIn, navigate]);

  const {
    data: accountData,
    error: accountError,
    isPending: accountPending,
  } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const token = ensureTokenValidOrAlert();
      const decoded = jwtDecode(token);
      const account = await safeFetch(`${API_BASE_URL}/account/${decoded.sub}`);
      if (!account.ok) {
        const error = await account.json().catch(() => null);
        throw new Error(error?.error || "Getting account failed");
      }
      return await account.json();
    },
  });

  if (accountError) {
    if (accountError?.message === "TOKEN_EXPIRED") {
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
      const msg = "something went wrong in retrieving account";
      (async () => {
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
      })();
    }
  }

  const {
    data: bookingData,
    error: bookingError,
    isPending: bookingPending,
  } = useQuery({
    queryKey: ["bookings", bookingPage],
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/booking/me?page=${bookingPage}&size=5`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting my bookings failed");
      }
      return await response.json();
    },
  });

  if (bookingError) {
    if (bookingError?.message === "TOKEN_EXPIRED") {
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
      const msg = "something went wrong in retrieving bookings";
      (async () => {
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
      })();
    }
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
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/feedback/me`);
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting my feedbacks failed");
      }
      return await response.json();
    },
  });

  if (feedbackError) {
    if (feedbackError?.message === "TOKEN_EXPIRED") {
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
      const msg = "something went wrong in retrieving feedbacks";
      (async () => {
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
      })();
    }
  }

  const feedbacks = feedbackData?.content ?? [];

  const {
    data: feedbackCategoryData,
    error: feedbackCategoryError,
    isPending: feedbackCategoryPending,
  } = useQuery({
    queryKey: ["feedbackCategories"],
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/feedback-category/active`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting feedback categories failed");
      }
      return await response.json();
    },
  });

  if (feedbackCategoryError) {
    if (feedbackCategoryError?.message === "TOKEN_EXPIRED") {
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
        const msg = "something went wrong in retrieving feedback categories";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
      })();
    }
  }

  const feedbackCategories = feedbackCategoryData ?? [];

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
      const msg = "Account information not loaded. Please try again.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    try {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/account/update-details/${accountData.accountId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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
      const successMsg = "Account details updated successfully.";
      if (window.__showAlert) await window.__showAlert(successMsg);
      else window.__nativeAlert?.(successMsg) || alert(successMsg);
    } catch (error) {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }
      const msg =
        error.message || "Something went wrong while updating details.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    }
  };

  const openFeedbackModal = (feedback) => {
    setSelectedFeedback(feedback);
    setIsFeedbackModalOpen(true);
    setIsCreatingFeedback(false);
    setIsEditingFeedback(false);
    setFeedbackForm({
      stars: feedback.stars != null ? String(feedback.stars) : "",
      comment: feedback.comment || "",
      suggestion: feedback.suggestion || "",
      categoryId:
        feedback.categoryId != null
          ? String(feedback.categoryId)
          : feedback.category?.categoryId != null
          ? String(feedback.category.categoryId)
          : "",
    });
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedFeedback(null);
    setIsEditingFeedback(false);
    setIsCreatingFeedback(false);
  };

  const openNewFeedbackModal = (booking) => {
    setIsCreatingFeedback(true);
    setIsFeedbackModalOpen(true);
    setIsEditingFeedback(true);
    setSelectedFeedback({
      booking,
      bookingId: booking.bookingId,
      categoryId: null,
      stars: null,
      comment: null,
      suggestion: null,
      staffReply: null,
    });
    setFeedbackForm({
      stars: "",
      comment: "",
      suggestion: "",
      categoryId: "",
    });
  };

  const handlePrevBookingPage = () => {
    setBookingPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextBookingPage = () => {
    if (totalBookingPages === 0) return;
    setBookingPage((prev) => (prev + 1 < totalBookingPages ? prev + 1 : prev));
  };

  const handleFeedbackFieldChange = (field) => (event) => {
    const value = event.target.value;
    setFeedbackForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openPaymentModal = (booking) => {
    setSelectedBookingForPayment(booking);
    setPaymentFile(null);
    setIsResubmittingPayment(booking.paymentStatus === "REJECTED");
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedBookingForPayment(null);
    setPaymentFile(null);
    setIsResubmittingPayment(false);
  };

  const handlePaymentFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPaymentFile(file);
  };

  const openProofModal = async (booking) => {
    if (!booking.proofOfPaymentPhoto) {
      const msg = "No proof of payment uploaded for this booking.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    setSelectedProofUrl(booking.proofOfPaymentPhoto);
    setIsProofLoading(true);
    setIsProofModalOpen(true);
  };

  const closeProofModal = () => {
    setIsProofModalOpen(false);
    setSelectedProofUrl(null);
    setIsProofLoading(false);
  };

  const handleSubmitPayment = async () => {
    if (!selectedBookingForPayment) return;

    if (!paymentFile) {
      const msg = "Please select a file as proof of payment.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    if (!localStorage.getItem("token")) {
      const msg = "Please log in again to submit your payment.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    setIsSubmittingPayment(true);

    try {
      const formData = new FormData();

      // Backend expects a "data" part as JSON and an optional file.
      const payload = {};
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      // Indicate whether this is a resubmission after rejection
      formData.append("resubmit", isResubmittingPayment ? "true" : "false");
      formData.append("proofOfPayment", paymentFile);

      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/booking/${selectedBookingForPayment.bookingId}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.error || "Submitting payment proof failed. Please try again."
        );
      }

      const updatedBooking = await response.json();

      // Update bookings cache for the current page
      queryClient.setQueryData(["bookings", bookingPage], (oldData) => {
        if (!oldData) return oldData;

        const oldContent = oldData.content ?? [];
        return {
          ...oldData,
          content: oldContent.map((b) =>
            b.bookingId === updatedBooking.bookingId ? updatedBooking : b
          ),
        };
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
        setIsSubmittingPayment(false);
        return;
      }

      const msg =
        error.message ||
        "Something went wrong while submitting your payment proof.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handlePasswordFieldChange = (field) => (event) => {
    const value = event.target.value;
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!accountData?.accountId) {
      alert("Account information not loaded. Please try again.");
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      const msg = "Please fill in your current and new password.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      const msg = "New password and confirmation do not match.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    try {
      setIsUpdatingPassword(true);

      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/account/update-password/${accountData.accountId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: passwordForm.currentPassword,
            password: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmNewPassword,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating password failed");
      }

      await response.json();

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      const successMsg = "Password updated successfully.";
      if (window.__showAlert) await window.__showAlert(successMsg);
      else window.__nativeAlert?.(successMsg) || alert(successMsg);
      closePasswordModal();
    } catch (error) {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        setIsUpdatingPassword(false);
        return;
      }

      const msg =
        error.message || "Something went wrong while updating password.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!selectedFeedback) return;

    ensureTokenValidOrAlert();

    const feedbackId = selectedFeedback.feedbackId ?? selectedFeedback.id;

    const isNewFeedback =
      isCreatingFeedback ||
      !(selectedFeedback.feedbackId || selectedFeedback.id);

    try {
      if (isNewFeedback) {
        const bookingId =
          selectedFeedback.bookingId || selectedFeedback.booking?.bookingId;

        if (!bookingId) {
          const msg = "Unable to identify the booking for this feedback.";
          if (window.__showAlert) await window.__showAlert(msg);
          else window.__nativeAlert?.(msg) || alert(msg);
          return;
        }

        if (!feedbackForm.categoryId) {
          const msg = "Please choose a feedback category.";
          if (window.__showAlert) await window.__showAlert(msg);
          else window.__nativeAlert?.(msg) || alert(msg);
          return;
        }

        const feedbackDetails = {
          bookingId,
          categoryId: Number(feedbackForm.categoryId),
          stars:
            feedbackForm.stars !== "" && feedbackForm.stars != null
              ? Number(feedbackForm.stars)
              : null,
          comment: feedbackForm.comment !== "" ? feedbackForm.comment : null,
          suggestion:
            feedbackForm.suggestion !== "" ? feedbackForm.suggestion : null,
        };

        const response = await safeFetch(`${API_BASE_URL}/feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedbackDetails),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Adding feedback failed");
        }

        const newFeedback = await response.json();

        setSelectedFeedback(newFeedback);

        queryClient.setQueryData(["feedbacks"], (oldData) => {
          if (!oldData) return oldData;

          const oldContent = oldData.content ?? [];
          return {
            ...oldData,
            content: [newFeedback, ...oldContent],
          };
        });

        setIsCreatingFeedback(false);
        setIsEditingFeedback(false);
        const successMsg = "Feedback added successfully.";
        if (window.__showAlert) await window.__showAlert(successMsg);
        else window.__nativeAlert?.(successMsg) || alert(successMsg);
      } else {
        const feedbackDetails = {
          stars:
            feedbackForm.stars !== "" && feedbackForm.stars != null
              ? Number(feedbackForm.stars)
              : null,
          comment: feedbackForm.comment !== "" ? feedbackForm.comment : null,
          suggestion:
            feedbackForm.suggestion !== "" ? feedbackForm.suggestion : null,
        };

        const response = await safeFetch(
          `${API_BASE_URL}/feedback/${feedbackId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(feedbackDetails),
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.error || "Updating feedback failed");
        }

        const updatedFeedback = await response.json();

        setSelectedFeedback(updatedFeedback);

        queryClient.setQueryData(["feedbacks"], (oldData) => {
          if (!oldData) return oldData;

          const oldContent = oldData.content ?? [];
          const updatedId = updatedFeedback.feedbackId ?? updatedFeedback.id;

          if (!updatedId) {
            return {
              ...oldData,
              content: oldContent.map((fb) =>
                fb.booking?.bookingId === updatedFeedback.booking?.bookingId
                  ? updatedFeedback
                  : fb
              ),
            };
          }

          return {
            ...oldData,
            content: oldContent.map((fb) => {
              const fbId = fb.feedbackId ?? fb.id;
              if (fbId === updatedId) return updatedFeedback;
              return fb;
            }),
          };
        });

        setIsEditingFeedback(false);
        const successMsg = "Feedback updated successfully.";
        if (window.__showAlert) await window.__showAlert(successMsg);
        else window.__nativeAlert?.(successMsg) || alert(successMsg);
      }
    } catch (error) {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }

      const msg =
        error.message ||
        (isNewFeedback
          ? "Something went wrong while adding feedback."
          : "Something went wrong while updating feedback.");
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    }
  };

  if (accountPending) {
    return (
      <>
        <Header />
        <main className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading account...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
          extraButton2={
            (accountData?.role === "STAFF" ||
              accountData?.role === "ADMIN") && (
              <Link
                to="/admin"
                state={{ from: location.pathname }}
                className="bg-[#4D9C43] hover:bg-[#4D9C43]/95 text-[#FDDB3C] px-4 py-2 rounded-md flex items-center my-auto"
              >
                <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                <span>Admin Dashboard</span>
              </Link>
            )
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
            <div className="pt-2 mt-2 border-t flex justify-center">
              <button
                type="button"
                className="mt-2 px-5 py-3 bg-white border border-[#227B05] text-[#227B05] hover:bg-[#227B05]/5 rounded-md font-semibold cursor-pointer"
                onClick={openPasswordModal}
              >
                Update Password
              </button>
            </div>
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
                    {booking.paymentMethod === "ONLINE" &&
                      booking.proofOfPaymentPhoto && (
                        <div className="bg-[#222EDA]/10 flex gap-3 justify-around rounded-lg p-3 mt-4 mb-1">
                          <div className="flex flex-col gap-1 text-center">
                            <span className="text-sm text-gray-700">
                              Proof of Payment
                            </span>
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

                    {booking.bookingStatus === "PENDING" ? (
                      <div className="text-sm text-gray-600 text-center mt-5">
                        Waiting for staff confirmation
                      </div>
                    ) : booking.bookingStatus === "APPROVED" &&
                      booking.paymentMethod === "ONLINE" &&
                      booking.paymentStatus == "UNPAID" ? (
                      <div className=" bg-[#222EDA]/15 text-[#222EDA] px-10 py-3 rounded-md border border-[#222EDA] mt-5 mx-auto flex flex-col gap-3 mb-1">
                        <div className="flex justify-between items-center flex-wrap gap-3 font-semibold mb-1">
                          <span>Down payment: </span>
                          <span className="min-w-fit">
                            <FontAwesomeIcon icon={faPesoSign} />
                            {booking.totalPrice / 2}{" "}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="bg-[#222EDA] text-white px-5 py-2 rounded-lg"
                          onClick={() => openPaymentModal(booking)}
                        >
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
                      booking.paymentMethod === "ONLINE" &&
                      booking.paymentStatus == "REJECTED" ? (
                      <div className="bg-red-50 text-red-700 px-6 py-3 rounded-md border border-red-300 mt-5 mx-auto flex flex-col items-center gap-3 mb-1 text-sm">
                        <div className="font-semibold">
                          Your previous payment proof was rejected.
                        </div>
                        <div>
                          Please review the payment details and resubmit a clear
                          screenshot of your transaction.
                        </div>
                        <button
                          type="button"
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                          onClick={() => openPaymentModal(booking)}
                        >
                          Resubmit payment
                        </button>
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
                            <button
                              type="button"
                              className="inline-block mt-2 px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold"
                              onClick={() => openNewFeedbackModal(booking)}
                            >
                              Add feedback
                            </button>
                          </div>
                        );
                      })()
                    ) : null}

                    {booking.staffReply && (
                      <div className="text-sm text-gray-600 text-center mt-5">
                        <span>Agri-Eco Park Management: </span>

                        <span className="ml-2 font-semibold">
                          {booking.staffReply}
                        </span>
                      </div>
                    )}
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
            <span className="ml-3 font-semibold">Loading Feedback...</span>
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
                {isCreatingFeedback ? "Add Feedback" : "Your Feedback"}
              </h2>
              {!isEditingFeedback ? (
                <>
                  {selectedFeedback.stars != null && (
                    <div className="mb-2">
                      <span className="font-semibold">Rating: </span>
                      <span>{selectedFeedback.stars} / 5</span>
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
                  {!selectedFeedback.comment &&
                    !selectedFeedback.suggestion && (
                      <div className="text-sm text-gray-600 mb-4">
                        No additional details provided.
                      </div>
                    )}
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 border border-[#227B05] text-[#227B05] rounded-md font-semibold hover:bg-[#227B05]/5"
                      onClick={() => setIsEditingFeedback(true)}
                    >
                      Edit Feedback
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold"
                      onClick={closeFeedbackModal}
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {isCreatingFeedback && (
                    <div className="mb-3">
                      <label className="block font-semibold mb-1">
                        Feedback Category
                      </label>
                      {feedbackCategoryPending ? (
                        <div className="text-sm text-gray-500">
                          Loading categories...
                        </div>
                      ) : (
                        <select
                          className="w-full border px-3 py-2 rounded-md bg-white"
                          value={feedbackForm.categoryId}
                          onChange={handleFeedbackFieldChange("categoryId")}
                        >
                          <option value="">Select a category</option>
                          {feedbackCategories.map((category) => {
                            const id = category.feedbackCategoryId;
                            const name = category.label || `Category ${id}`;

                            if (id == null) return null;

                            return (
                              <option key={id} value={String(id)}>
                                {name}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="block font-semibold mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const current =
                          feedbackForm.stars !== "" &&
                          feedbackForm.stars != null
                            ? Number(feedbackForm.stars)
                            : 0;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              setFeedbackForm((prev) => ({
                                ...prev,
                                stars: String(n),
                              }))
                            }
                            className="text-2xl focus:outline-none"
                            aria-label={`${n} star${n > 1 ? "s" : ""}`}
                          >
                            <FontAwesomeIcon
                              icon={n <= current ? faStarSolid : faStarRegular}
                              className={
                                n <= current
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block font-semibold mb-1">Comment</label>
                    <textarea
                      className="w-full border px-3 py-2 rounded-md min-h-20"
                      value={feedbackForm.comment}
                      onChange={handleFeedbackFieldChange("comment")}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block font-semibold mb-1">
                      Suggestion
                    </label>
                    <textarea
                      className="w-full border px-3 py-2 rounded-md min-h-20"
                      placeholder="You may leave this blank if you have no suggestions"
                      value={feedbackForm.suggestion}
                      onChange={handleFeedbackFieldChange("suggestion")}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-md font-semibold hover:bg-black/5"
                      onClick={() => {
                        setFeedbackForm({
                          stars:
                            selectedFeedback.stars != null
                              ? String(selectedFeedback.stars)
                              : "",
                          comment: selectedFeedback.comment || "",
                          suggestion: selectedFeedback.suggestion || "",
                          categoryId:
                            selectedFeedback.categoryId != null
                              ? String(selectedFeedback.categoryId)
                              : selectedFeedback.category?.categoryId != null
                              ? String(selectedFeedback.category.categoryId)
                              : "",
                        });
                        setIsEditingFeedback(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold"
                      onClick={handleSaveFeedback}
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closePasswordModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
              onClick={closePasswordModal}
            >
              <FontAwesomeIcon icon={faX} />
            </button>
            <h2 className="text-xl font-semibold mb-3 text-[#227B05]">
              Update Password
            </h2>
            <form
              className="grid grid-cols-2 gap-5"
              onSubmit={handlePasswordSubmit}
            >
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="currentPassword" className="font-semibold">
                  Current Password
                </label>
                <input
                  className="w-full border px-5 py-3 rounded-md"
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange("currentPassword")}
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="newPassword" className="font-semibold">
                  New Password
                </label>
                <input
                  className="w-full border px-5 py-3 rounded-md"
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange("newPassword")}
                  required
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="confirmNewPassword" className="font-semibold">
                  Confirm New Password
                </label>
                <input
                  className="w-full border px-5 py-3 rounded-md"
                  type="password"
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordFieldChange("confirmNewPassword")}
                  required
                />
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md font-semibold hover:bg-black/5"
                  onClick={closePasswordModal}
                  disabled={isUpdatingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#227B05]/90 hover:bg-[#227B05] text-white rounded-md font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isPaymentModalOpen && selectedBookingForPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closePaymentModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative"
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
              Submit Payment Proof
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please upload a clear photo or screenshot of your payment
              transaction for your booking on{" "}
              <span className="font-semibold">
                {" "}
                {new Date(
                  selectedBookingForPayment.visitDate
                ).toLocaleDateString()}
              </span>
              .
            </p>
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
                Accepted formats: JPG, PNG. Max size depends on your network and
                server limits.
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
                {isSubmittingPayment ? "Submitting..." : "Submit"}
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
      <Footer />
    </>
  );
}

export default Account;
