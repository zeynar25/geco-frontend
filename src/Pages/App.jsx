// import React, { useEffect, useState } from "react";
import { useState } from "react";

import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer.jsx";
import StatisticCard from "../Components/StatisticCard.jsx";
import "../index.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faCalendarDays,
  faLocationDot,
  faBoxOpen,
  faPeopleGroup,
  faStar,
  faMagnifyingGlassLocation,
  faMessage,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function App() {
  const [mapMode, setMapMode] = useState("2D");

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

      <div
        id="home"
        className="relative h-screen bg-[url('/images/homepage.png')] bg-cover bg-center bg-no-repeat"
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/50 to-black/40" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <span className="inline-block rounded-full bg-white/30 px-3 py-1 text-xs font-medium tracking-wide text-white ring-1 ring-white/20">
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
                className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <FontAwesomeIcon icon={faCalendarDays} />
                <span>Book your Visit</span>
              </a>
              <a
                href="#map"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white/90 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow hover:bg-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <FontAwesomeIcon icon={faMapLocationDot} />
                <span>Explore Map</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-10 py-12 bg-green-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Cards grid */}
          <div className="grid place-items-center sm:place-items-stretch grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatisticCard
              label="Attractions"
              value="10"
              icon={
                <FontAwesomeIcon icon={faLocationDot} className="text-2xl" />
              }
              iconBg="bg-blue-900"
              iconColor="text-white"
              className="border-0 shadow-sm"
            />
            <StatisticCard
              label="Tour Packages"
              value="8"
              icon={<FontAwesomeIcon icon={faBoxOpen} className="text-2xl" />}
              iconBg="bg-green-500"
              iconColor="text-gray-900"
              className="border-0 shadow-sm"
            />
            <StatisticCard
              label="Monthly Visitors"
              value="100"
              icon={
                <FontAwesomeIcon icon={faPeopleGroup} className="text-2xl" />
              }
              iconBg="bg-purple-900"
              iconColor="text-white"
              className="border-0 shadow-sm"
            />
            <StatisticCard
              label="Average Rating"
              value="4.8"
              icon={<FontAwesomeIcon icon={faStar} className="text-2xl" />}
              iconBg="bg-yellow-400"
              iconColor="text-gray-900"
              className="border-0 shadow-sm"
            />
          </div>
        </div>
      </section>

      <section id="map" className="relative z-10">
        <div className="bg-[#a9e2a3] flex flex-col gap-5 justify-center text-center py-15 px-10">
          <h1 className="font-semibold text-2xl md:text-4xl">
            Explore our Park Interactive Map
          </h1>
          <p>
            Click on any colored marker to zoom in and discover detailed
            information about each attraction.
          </p>
        </div>

        <div className="px-5 py-5 bg-green-50 grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* park map */}
          <div className="rounded-xl overflow-hidden shadow-2xl grid lg:col-span-3">
            <div className="px-5 py-5 h-fit bg-[#227B05]">
              <div className="flex flex-col justify-between sm:flex-row  gap-3">
                <h1 className="text-white font-semibold text-lg sm:text-2xl">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlassLocation}
                    className="text-white mr-1  "
                  />
                  CvSU Agri-Eco Tourism Park Map
                </h1>

                <div className="w-fit rounded-lg bg-white/70 p-1 ring-1 ring-black/5 backdrop-blur">
                  <button
                    type="button"
                    aria-pressed={mapMode === "2D"}
                    onClick={() => setMapMode("2D")}
                    className={`btn-sweep relative overflow-hidden px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      mapMode === "2D"
                        ? "bg-white text-gray-900 shadow"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    2D
                  </button>

                  <button
                    type="button"
                    aria-pressed={mapMode === "3D"}
                    onClick={() => setMapMode("3D")}
                    className={`btn-sweep relative overflow-hidden px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      mapMode === "3D"
                        ? "bg-white text-gray-900 shadow"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    3D
                  </button>
                </div>
              </div>
            </div>

            <div>
              {mapMode === "2D" ? (
                <img src="/images/park-map-2d.jpg" alt="2D-park-map" />
              ) : (
                <img
                  src="/images/park-map-2d.jpg"
                  alt="3D-park-map"
                  className="cover"
                />
              )}
            </div>
          </div>

          {/* side options */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Park attractions */}
            <div className="rounded-xl overflow-hidden shadow-2xl bg-white">
              <div className="bg-[#a9e2a3] p-3">
                <h3 className="font-semibold">Park Attractions</h3>
                <span>Click to view on map</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 text-center gap-1.5 px-3 py-1">
                <div>Attraction 1</div>
                <div>Attraction 2</div>
                <div>Attraction 3</div>
                <div>Attraction 4</div>
                <div>Attraction 5</div>
                <div>Attraction 6</div>
                <div>Attraction 7</div>
                <div>Attraction 8</div>
                <div>Attraction 9</div>
                <div>Attraction 10</div>
                <div>Attraction 11</div>
                <div>Attraction 12</div>
              </div>
            </div>

            {/* Plan your visit */}
            <div className="bg-[#227B05] text-white rounded-xl overflow-hidden shadow-2xl px-5 py-2">
              <h3 className="font-semibold py-2">Plan your visit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-5 py-2">
                <button className="bg-white text-green-600 font-semibold rounded-lg py-1.5">
                  <FontAwesomeIcon
                    icon={faCalendarDays}
                    className="text-black mr-2"
                  />
                  Book your visit
                </button>
                <button className="border-white bg-[#a9e2a3] text-black font-semibold rounded-lg py-1.5">
                  <FontAwesomeIcon
                    icon={faMessage}
                    className="text-black mr-2"
                  />
                  Share feedback
                </button>
              </div>
            </div>

            {/* Know more */}
            <div className="relative min-h-40 max-h-40 bg-[url('/images/homepage.png')] bg-cover bg-bottom bg-no-repeat rounded-xl flex items-center justify-center shadow-2xl overflow-hidden">
              <Link
                to="/about"
                className="z-10 bg-white/80 font-bold p-2 px-10 rounded-xl flex items-center justify-center"
              >
                <span className="text-[#227B05]">Know more</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="bg-[#227B05] text-white ml-3 p-2 rounded-full"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
