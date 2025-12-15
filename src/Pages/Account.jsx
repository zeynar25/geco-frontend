import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";

import { jwtDecode } from "jwt-decode";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faPesoSign } from "@fortawesome/free-solid-svg-icons";
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

function Account() {
  const [loggedIn] = useState(isLoggedIn());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
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
    queryKey: ["bookings"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/booking/me`, {
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

  const bookings = bookingData?.content ?? [];

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
        <div id="#profile" className="rounded-lg overflow-hidden shadow-2xl">
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
        <div id="#profile" className="rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-[#4D9C43] text-white px-5 sm:px-10 py-2 md:py-5 font-bold text-lg mb-5 sm:mb-2">
            <span>My Bookings</span>
          </div>
          <div className="px-5 sm:px-10 py-2 md:py-5 text-md flex flex-col gap-5">
            {bookingPending ? (
              <div className="flex justify-center items-center col-span-2 lg:col-span-3 py-10">
                <ClipLoader color="#17EB88" size={40} />
                <span className="ml-3 font-semibold">
                  Loading Tour packages...
                </span>
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.bookingId}>
                  Visit on: {new Date(booking.visitDate).toLocaleDateString()}|{" "}
                  {booking.groupSize} visitor(s) at {booking.visitTime}
                  | <FontAwesomeIcon icon={faPesoSign} /> {booking.totalPrice}|
                  Payment Method: {booking.paymentMethod}| Booking Status:{" "}
                  {booking.bookingStatus}| Payment Status:{" "}
                  {booking.paymentStatus}
                </div>
              ))
            ) : (
              <div>You have no bookings yet.</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Account;
