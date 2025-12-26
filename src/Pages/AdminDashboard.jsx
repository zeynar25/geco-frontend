import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../Components/Header";
import Footer from "../Components/Footer";
import BackButton from "../Components/BackButton";
import ShowBooking from "../Components/Booking/ShowBooking";
import EditBooking from "../Components/Booking/EditBooking";
import ShowFinance from "../Components/ShowFinance";
import ShowTrend from "../Components/ShowTrend";

import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faMessage,
  faPesoSign,
} from "@fortawesome/free-solid-svg-icons";

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

  const [editingBooking, setEditingBooking] = useState(null);

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

  if (accountPending) {
    return (
      <>
        <Header />
        <main className="m-10 text-center">Loading account...</main>
        <Footer />
      </>
    );
  }

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
            <div className="grid grid-cols-4 gap-5 mb-10">
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
            <ShowBooking
              canViewAdmin={canViewAdmin}
              bookingIn={bookingIn}
              onEditBooking={setEditingBooking}
            />
          )}

          {financesIn && (
            <ShowFinance canViewAdmin={canViewAdmin} financesIn={financesIn} />
          )}

          {trendsIn && (
            <ShowTrend canViewAdmin={canViewAdmin} trendsIn={trendsIn} />
          )}
        </div>
      </main>

      {editingBooking && (
        <EditBooking
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}

      <Footer />
    </>
  );
}

export default AdminDashboard;
