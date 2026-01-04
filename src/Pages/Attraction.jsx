import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer.jsx";
import BackButton from "../Components/BackButton.jsx";
import ParkMap3D from "../Components/ParkMap3D.jsx";
import { API_BASE_URL } from "../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { faLightbulb } from "@fortawesome/free-regular-svg-icons";

function Attraction() {
  const location = useLocation();
  const backTo = location.state?.from || "/";

  const { id } = useParams();

  const [mapMode, setMapMode] = useState("2D");

  const {
    data: attractionData,
    isPending,
    error,
  } = useQuery({
    queryKey: ["attraction", id],
    queryFn: async () => {
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const res = await fetch(`${API_BASE_URL}/attraction/${id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Getting attraction details failed");
      }
      return await res.json();
    },
    enabled: !!id,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!error) return;
    const handle = async () => {
      const msg = "Your session has expired. Please sign in again.";
      if (error?.message === "TOKEN_EXPIRED") {
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }
      const errMsg = "Something went wrong in retrieving attraction details";
      if (window.__showAlert) await window.__showAlert(errMsg);
      else window.__nativeAlert?.(errMsg) || alert(errMsg);
    };
    handle();
  }, [error, navigate]);

  return (
    <>
      <Header />
      <main className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 min-h-screen">
        <BackButton
          to={backTo}
          title="Interactive Park Map"
          description="About this attraction"
        />

        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-4 h-100">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading attraction details...</p>
          </div>
        ) : (
          <div className="px-3 py-2 rounded-lg overflow-hidden grid grid-cols-2 gap-5 bg-white shadow-md">
            <div className="col-span-2 lg:col-span-1 self-center">
              <div></div>
              <div>
                <div className="mb-3">
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

                <div className="aspect-video flex">
                  {mapMode === "2D" ? (
                    attractionData?.photo2dUrl ? (
                      <img
                        src={`${API_BASE_URL}${attractionData.photo2dUrl}`}
                        alt={attractionData?.name || "Attraction image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm self-center mx-auto">
                        No image available
                      </span>
                    )
                  ) : attractionData?.glbUrl ? (
                    <ParkMap3D
                      modelPath={`${API_BASE_URL}${attractionData.glbUrl}`}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm self-center mx-auto">
                      No 3D model available
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-2 lg:col-span-1 flex flex-col gap-5 p-3">
              <div
                className="relative bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden"
                style={
                  attractionData?.photo2dUrl
                    ? {
                        backgroundImage: `url(${API_BASE_URL}${attractionData.photo2dUrl})`,
                      }
                    : undefined
                }
              >
                <div className="absolute inset-0 bg-linear-to-b from-black/50 to-black/40" />
                <div className="relative z-10 text-center my-auto font-bold text-xl p-3 text-white">
                  {attractionData?.name || "Attraction"}
                </div>
              </div>
              <div className="p-2">
                <div className="text-[#0A7A28] text-lg flex items-center mb-2">
                  <FontAwesomeIcon
                    icon={faInfo}
                    className="bg-[#48BF56]/15 p-2 rounded-lg mr-2"
                  />
                  <span className="font-semibold">About This Place</span>
                </div>
                <div>
                  {attractionData?.description || "No description provided."}
                </div>
              </div>
              {attractionData?.funFact && (
                <div className="bg-[#FDDB3C]/10 text-[#97750B] p-2 rounded-lg">
                  <div className="text-lg flex items-center mb-2">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="bg-[#FDDB3C]/25 p-2 rounded-lg mr-2"
                    />
                    <span className="font-semibold">Did you know?</span>
                  </div>
                  <div>{attractionData?.funFact}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Attraction;
