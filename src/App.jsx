// import React, { useEffect, useState } from "react";
import Header from "./Components/Header.jsx";
import Footer from "./Components/Footer.jsx";
import StatisticCard from "./Components/StatisticCard.jsx";
import "./index.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faCalendarDays,
  faLocationDot,
  faPeopleGroup,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

export default function App() {
  // const [numberOfAttractions, setNumberOfAttractions] = useState(null);
  // const [monthlyVisitors, setMonthlyVisitors] = useState(null);
  // const [avgRating, setAvgRating] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   async function loadHomeStats() {
  //     try {
  //       // replace with your backend URL for debugging:
  //       const res = await fetch("http://localhost:8080/home");

  //       if (!res.ok) {
  //         const text = await res.text();
  //         throw new Error(`HTTP ${res.status}: ${text}`);
  //       }

  //       const ct = res.headers.get("content-type") || "";
  //       if (!ct.includes("application/json")) {
  //         const text = await res.text();
  //         throw new Error(
  //           "Expected JSON but got HTML/text: " + text.slice(0, 200)
  //         );
  //       }

  //       const data = await res.json();

  //       // backend DTO fields: attractionNumber, averageVisitor, averageRating
  //       setNumberOfAttractions(data.attractionNumber ?? 0);
  //       setMonthlyVisitors(data.averageVisitor ?? 0);
  //       setAvgRating(data.averageRating ?? 0);
  //     } catch (err) {
  //       setError(err.message || "Failed to load home stats");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   loadHomeStats();
  // }, []);

  // if (loading) {
  //   return <div>Loading home stats…</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  return (
    <>
      <Header />

      <div className="relative h-screen bg-[url('/images/homepage.png')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/40" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white ring-1 ring-white/20">
              Cavite State University
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Agri‑Eco
            </h1>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-green-400 sm:text-5xl lg:text-6xl">
              Tourism Park
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-200 sm:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <FontAwesomeIcon icon={faCalendarDays} />
                <span>Book your Visit</span>
              </a>
              <a
                href="#map"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white/90 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <FontAwesomeIcon icon={faMapLocationDot} />
                <span>Explore Map</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-10 py-12 rounded-xl bg-green-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatisticCard
              label="Attractions"
              value="10"
              icon={
                <FontAwesomeIcon icon={faLocationDot} className="text-2xl" />
              }
              iconBg="bg-blue-900" // navy blue
              iconColor="text-white"
              className="border-0 shadow-sm"
            />
            <StatisticCard
              label="Monthly Visitors"
              value="100"
              icon={
                <FontAwesomeIcon icon={faPeopleGroup} className="text-2xl" />
              }
              iconBg="bg-purple-900" // dark purple
              iconColor="text-white"
              className="border-0 shadow-sm"
            />
            <StatisticCard
              label="Average Rating"
              value="4.8"
              icon={<FontAwesomeIcon icon={faStar} className="text-2xl" />}
              iconBg="bg-yellow-400" // bright yellow
              iconColor="text-gray-900"
              className="border-0 shadow-sm"
            />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
