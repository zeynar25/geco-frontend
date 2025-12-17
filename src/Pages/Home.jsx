import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { ClipLoader } from "react-spinners";

import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer.jsx";
import ValueCard from "../Components/ValueCard.jsx";
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
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const location = useLocation();
  const [mapMode, setMapMode] = useState("2D");

  useEffect(() => {
    // Scroll to the element with the ID matching the hash
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const {
    data: homeData,
    isPending: homePending,
    error: homeError,
  } = useQuery({
    queryKey: ["home-stats"],
    // runs whenever we run the query with this key.
    queryFn: async () => {
      const homestats = await fetch("http://localhost:8080/home");
      if (!homestats.ok) {
        const error = await homestats.json();
        throw new Error(error?.error || "Getting home statistics failed");
      }
      return await homestats.json();
    },
  });

  if (homeError) {
    alert("something went wrong in retrieving home statistics");
  }

  const {
    data: attractionData,
    isPending: attractionPending,
    error: attractionError,
  } = useQuery({
    queryKey: ["attractions"],
    // runs whenever we run the query with this key.
    queryFn: async () => {
      const attractions = await fetch(
        "http://localhost:8080/attraction/active"
      );
      if (!attractions.ok) {
        const error = await attractions.json();
        throw new Error(error?.error || "Getting attractions failed");
      }
      return await attractions.json();
    },
  });

  if (attractionError) {
    alert("something went wrong in retrieving attractions");
  }

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
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-[#17EB88] sm:text-5xl lg:text-6xl">
              Tourism Park
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-200 sm:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#48BF56] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#48BF56]/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17EB88]"
              >
                <FontAwesomeIcon icon={faCalendarDays} />
                <span>Book your Visit</span>
              </a>
              <a
                href="#map"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow hover:bg-white/90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
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
            <ValueCard
              title={homePending ? "..." : homeData?.attractionNumber}
              titleClasses="text-gray-900"
              description="Attractions"
              descriptionClasses="text-gray-500"
              icon={
                <FontAwesomeIcon icon={faLocationDot} className="text-2xl" />
              }
              iconClasses="bg-blue-900 text-white"
              className="w-80 sm:w-auto border-0 shadow-sm"
            />
            <Link to="/packages-promos" state={{ from: location.pathname }}>
              <ValueCard
                title={homePending ? "..." : homeData?.tourPackageNumber}
                titleClasses="text-gray-900"
                description="Tour Packages"
                descriptionClasses="text-gray-500"
                icon={<FontAwesomeIcon icon={faBoxOpen} className="text-2xl" />}
                iconClasses="bg-green-500 text-gray-900"
                className="w-80 sm:w-auto border-0 shadow-sm"
              />
            </Link>
            <ValueCard
              title={homePending ? "..." : homeData?.averageVisitor}
              titleClasses="text-gray-900"
              description="Monthly Visitors"
              descriptionClasses="text-gray-500"
              icon={
                <FontAwesomeIcon icon={faPeopleGroup} className="text-2xl" />
              }
              iconClasses="bg-purple-900 text-white"
              className="w-80 sm:w-auto border-0 shadow-sm"
            />
            <ValueCard
              title={homePending ? "..." : homeData?.averageRating}
              titleClasses="text-gray-900"
              description="Average Rating"
              descriptionClasses="text-gray-500"
              icon={<FontAwesomeIcon icon={faStar} className="text-2xl" />}
              iconClasses="bg-yellow-400 text-gray-900"
              className="w-80 sm:w-auto border-0 shadow-sm"
            />
          </div>
        </div>
      </section>

      <section id="map" className="relative z-10">
        <div className="bg-[#227B05]/20 flex flex-col gap-5 justify-center text-center py-15 px-10">
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
              <div className="bg-[#0A7A28]/30 p-3">
                <h3 className="font-semibold">Park Attractions</h3>
                <span>Click to view</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 text-center gap-1.5 px-3 py-1 max-h-50 overflow-y-auto">
                {/* Attractions */}
                {attractionPending ? (
                  <div className="flex justify-center items-center col-span-2 lg:col-span-3 py-10">
                    <ClipLoader color="#17EB88" size={40} />
                    <span className="ml-3 font-semibold">
                      Loading Attractions...
                    </span>
                  </div>
                ) : (
                  attractionData?.map((attraction) => (
                    <Link
                      to={`/attractions/${attraction.attractionId}`}
                      key={attraction.attractionId}
                      id={attraction.attractionId}
                      className="self-center text-sm"
                    >
                      {attraction.name}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Know more */}
            <div className="relative min-h-35 max-h-60 bg-[url('/images/homepage.png')] bg-cover bg-bottom bg-no-repeat rounded-xl flex items-center justify-center shadow-2xl overflow-hidden">
              <Link
                to="/about"
                className="z-10 bg-white/90 hover:bg-white/80 font-bold p-2 px-10 rounded-xl flex items-center justify-center"
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
