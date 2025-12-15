import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import HeaderCard from "../Components/HeaderCard";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faCircleCheck,
  faEnvelope,
  faLocationDot,
  faPesoSign,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";
import { useQuery } from "@tanstack/react-query";
import BackButton from "../Components/BackButton";

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

  return (
    <>
      <Header />
      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10">
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
            <form className="grid grid-cols-2 gap-5">
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
                  readOnly
                  value={accountData?.detail?.surname}
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
                  readOnly
                  value={accountData?.detail?.firstName}
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
                  readOnly
                  value={accountData?.detail?.contactNumber}
                />
              </div>
            </form>
          </div>
        </div>
        {`${accountData?.detail?.firstName} ${accountData?.detail?.surname}`}
      </div>
      <Footer />
    </>
  );
}

export default Account;
