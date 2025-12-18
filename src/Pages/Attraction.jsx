import { useLocation, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Header from "../Components/Header.jsx";
import Footer from "../Components/Footer.jsx";
import BackButton from "../Components/BackButton.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { faLightbulb } from "@fortawesome/free-regular-svg-icons";

function Attraction() {
  const location = useLocation();
  const backTo = location.state?.from || "/";

  const { id } = useParams();

  const {
    data: attractionData,
    isPending,
    error,
  } = useQuery({
    queryKey: ["attraction", id],
    queryFn: async () => {
      // await new Promise((resolve) => setTimeout(resolve, 10000));

      const res = await fetch(`http://localhost:8080/attraction/${id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Getting attraction details failed");
      }
      return await res.json();
    },
    enabled: !!id,
  });

  if (error) {
    alert("Something went wrong in retrieving attraction details");
  }

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
              <div className="aspect-video flex">
                {attractionData?.photo2dUrl ? (
                  <img
                    src={`http://localhost:8080${attractionData.photo2dUrl}`}
                    alt={attractionData?.name || "Attraction image"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm self-center mx-auto">
                    No image available
                  </span>
                )}
              </div>
            </div>
            <div className="col-span-2 lg:col-span-1 flex flex-col gap-5 p-3">
              <div
                className="relative bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden"
                style={
                  attractionData?.photo2dUrl
                    ? {
                        backgroundImage: `url(http://localhost:8080${attractionData.photo2dUrl})`,
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
