import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ValueCard from "../Components/ValueCard.jsx";

import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCalendar,
  faClock,
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

  const location = useLocation();
  const backTo = location.state?.from || "/";
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      alert("Please log in to book a visit.");
      navigate("/signin");
    }
  }, [loggedIn, navigate]);

  return (
    <>
      <Header />

      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10">
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
      </div>

      <Footer />
    </>
  );
}

export default Book;
