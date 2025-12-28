import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faPlus,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

function ShowAttraction(props) {
  const [activityFilter, setActivityFilter] = useState("ALL");

  const isActive = (attraction) => {
    if (!attraction) return true;
    if (typeof attraction.isActive === "boolean") return attraction.isActive;
    if (typeof attraction.active === "boolean") return attraction.active;
    if (typeof attraction.enabled === "boolean") return attraction.enabled;
    if (typeof attraction.status === "string")
      return attraction.status.toUpperCase() === "ACTIVE";
    return true;
  };

  const {
    data: allAttractions,
    error: allError,
    isPending: allPending,
  } = useQuery({
    queryKey: ["attractions", "ALL", props.refreshToken],
    enabled:
      props.canViewDashboard && props.attractionsIn && activityFilter === "ALL",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/attraction", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Getting attractions failed");
      }
      return await res.json();
    },
  });

  if (allError) {
    alert("something went wrong in retrieving attractions");
  }

  const {
    data: activeAttractions,
    error: activeError,
    isPending: activePending,
  } = useQuery({
    queryKey: ["attractions", "ACTIVE", props.refreshToken],
    enabled:
      props.canViewDashboard &&
      props.attractionsIn &&
      activityFilter === "ACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/attraction/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Getting active attractions failed");
      }
      return await res.json();
    },
  });

  if (activeError) {
    alert("something went wrong in retrieving active attractions");
  }

  const {
    data: inactiveAttractions,
    error: inactiveError,
    isPending: inactivePending,
  } = useQuery({
    queryKey: ["attractions", "INACTIVE", props.refreshToken],
    enabled:
      props.canViewDashboard &&
      props.attractionsIn &&
      activityFilter === "INACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/attraction/inactive", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Getting inactive attractions failed");
      }
      return await res.json();
    },
  });

  if (inactiveError) {
    alert("something went wrong in retrieving inactive attractions");
  }

  const isLoading =
    (activityFilter === "ALL" && allPending) ||
    (activityFilter === "ACTIVE" && activePending) ||
    (activityFilter === "INACTIVE" && inactivePending);

  const attractionsToShow =
    activityFilter === "ALL"
      ? allAttractions || []
      : activityFilter === "ACTIVE"
      ? activeAttractions || []
      : inactiveAttractions || [];

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <div className="text-white bg-[#48BF56] p-4 font-bold flex flex-wrap justify-between gap-2">
        <div className="text-2xl flex items-center">
          <FontAwesomeIcon icon={faMapLocationDot} className="mr-3" />
          <span>Attraction Management</span>
        </div>
        <button
          type="button"
          className="text-lg text-[#FDDB3C] bg-[#227B05] px-3 py-2 rounded-lg flex items-center hover:bg-[#227B05]/90"
          onClick={() => props.onAddAttraction?.()}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-3" />
          <span>Add Attraction</span>
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <form className="flex justify-end flex-wrap gap-2 text-sm">
          <div>
            <span className="font-semibold">Attraction Activity:</span>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="ml-2 border border-[#227B05] rounded px-2 py-1 text-sm"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </form>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 h-32">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading attractions...</p>
          </div>
        ) : attractionsToShow && attractionsToShow.length > 0 ? (
          <div className="grid grid-cols-2 gap-8">
            {attractionsToShow.map((attraction) => {
              const active = isActive(attraction);

              const descriptionSnippet = attraction.description
                ? attraction.description.length > 140
                  ? attraction.description.slice(0, 140) + "..."
                  : attraction.description
                : "No description provided.";

              const funFactSnippet = attraction.funFact
                ? attraction.funFact.length > 120
                  ? attraction.funFact.slice(0, 120) + "..."
                  : attraction.funFact
                : null;

              return (
                <div
                  key={attraction.attractionId}
                  className={`col-span-2 lg:col-span-1 border rounded-lg p-4 flex flex-col gap-3 ${
                    active
                      ? "border-[#227B05]"
                      : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-lg">
                          {attraction.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ID #{attraction.attractionId}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="text-gray-600 hover:text-[#227B05]"
                      onClick={() => props.onEditAttraction?.(attraction)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-start">
                    <div className="col-span-1">
                      <div className="aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {attraction.photo2dUrl ? (
                          <img
                            src={`http://localhost:8080${attraction.photo2dUrl}`}
                            alt={attraction.name || "Attraction image"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 px-2 text-center">
                            No image available
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-2 text-sm">
                      <div>
                        <p className="text-gray-700">{descriptionSnippet}</p>
                      </div>

                      {funFactSnippet && (
                        <div className="bg-[#FDDB3C]/10 text-[#97750B] px-2 py-1 rounded">
                          <span className="font-semibold block text-xs mb-0.5">
                            Fun fact
                          </span>
                          <p className="text-xs">{funFactSnippet}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 m-5">
            No attractions found.
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowAttraction;
