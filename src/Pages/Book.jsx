import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ValueCard from "../Components/ValueCard";
import HeaderCard from "../Components/HeaderCard";

import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCalendar,
  faCheck,
  faClock,
  faEarthAsia,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import BackButton from "../Components/BackButton.jsx";

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

function Book() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [paymentMethod, setPaymentMethod] = useState("");

  const location = useLocation();
  const backTo = location.state?.from || "/";
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      alert("Please log in to book a visit.");
      navigate("/signin");
    }
  }, [loggedIn, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    alert(`Selected: ${paymentMethod}`);
  }

  return (
    <>
      <Header />

      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 flex flex-col gap-5">
        <BackButton
          to={backTo}
          title="Book Your Visit"
          description="Reserve your spot at CvSU Agri-Eco Tourism Park"
        />

        <div className="col-span-2 grid grid-cols-3 gap-5 items-stretch">
          <Link
            to="/operating-hours"
            state={{ from: location.pathname }}
            className="col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              title="Operating Hours"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Monday-Thursday"
              description2="8:00 AM - 5:00 PM"
              icon={<FontAwesomeIcon icon={faClock} className="text-4xl" />}
              iconClasses="text-[#48BF56]"
              className="h-full border-0 shadow-2xl"
            />
          </Link>

          <Link
            to="/packages-promos"
            state={{ from: location.pathname }}
            className="col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              title="Packages & Promos"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Various packages available"
              description2="Starting from P100"
              icon={<FontAwesomeIcon icon={faBoxOpen} className="text-4xl" />}
              iconClasses="text-[#222EDA]"
              className="h-full border-0 shadow-2xl"
            />
          </Link>

          <Link
            to="/park-calendar"
            state={{ from: location.pathname }}
            className="col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              title="Park Calendar"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Check availability"
              description2="Plan your visit"
              icon={<FontAwesomeIcon icon={faCalendar} className="text-4xl" />}
              iconClasses="text-[#A86CCB]"
              className="h-full border-0 shadow-2xl"
            />
          </Link>
        </div>

        <HeaderCard
          headerClass="bg-[#48BF56] text-white text-xl"
          title="Reservation Details"
          descriptionContent={
            <div className="m-5">
              <form onSubmit={handleSubmit}>
                <div>
                  <header className="flex flex-col gap-2 mb-4">
                    <span className="font-bold text-xl text-[#48BF56]">
                      Payment Method
                    </span>
                    <span>Choose how you'd like to pay for your visit</span>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Online Down Payment Card */}
                    <HeaderCard
                      onClick={() => setPaymentMethod("online")}
                      className={`cursor-pointer rounded-xl border-2 p-5 shadow transition-all ${
                        paymentMethod === "online"
                          ? "border-[#222EDA] ring-2 ring-[#222EDA]"
                          : "border-gray-300"
                      }`}
                      headerClass="pt-0 pl-0 pr-0"
                      icon={
                        <FontAwesomeIcon
                          icon={faEarthAsia}
                          className="text-[#222EDA] text-2xl"
                        />
                      }
                      title="Online Down Payment"
                      subtitle="Pay 50% down payment via GCash after admin approval"
                      descriptionContent={
                        <ul className="space-y-1">
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#222EDA] mr-2"
                            />
                            <span>
                              Submit proof of down payment after booking
                              confirmed
                            </span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#222EDA] mr-2"
                            />
                            <span>
                              Once proof is verified, your booking is all set
                            </span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#222EDA] mr-2"
                            />
                            <span>Balance payable at the park</span>
                          </li>
                        </ul>
                      }
                    />

                    {/* Pay at Park Card */}
                    <HeaderCard
                      onClick={() => setPaymentMethod("park")}
                      className={`cursor-pointer rounded-xl border-2 p-5 shadow transition-all ${
                        paymentMethod === "park"
                          ? "border-[#FDDB3C] ring-2 ring-[#FDDB3C]"
                          : "border-gray-300"
                      }`}
                      headerClass="pt-0 pl-0 pr-0"
                      icon={
                        <FontAwesomeIcon
                          icon={faMoneyBill}
                          className="text-[#FDDB3C] text-2xl"
                        />
                      }
                      title="Pay at Park"
                      subtitle="Pay full amount in cash on your visit day"
                      descriptionContent={
                        <ul className="space-y-1">
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#FDDB3C] mr-2"
                            />
                            <span>No online payment needed</span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#FDDB3C] mr-2"
                            />
                            <span>Faster booking process</span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#FDDB3C] mr-2"
                            />
                            <span>Full amount due on arrival</span>
                          </li>
                        </ul>
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center mt-6">
                  <button
                    type="submit"
                    className="text-center bg-[#48BF56] text-white px-4 py-2 rounded"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            </div>
          }
        />
      </div>

      <Footer />
    </>
  );
}

export default Book;
