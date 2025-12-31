import { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faList,
  faPesoSign,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

function ShowPackageInclusion(props) {
  const [inclusionFilter, setInclusionFilter] = useState("ALL");

  const isInclusionActive = (inclusion) => {
    if (!inclusion) return true;
    if (typeof inclusion.isActive === "boolean") return inclusion.isActive;
    if (typeof inclusion.active === "boolean") return inclusion.active;
    if (typeof inclusion.enabled === "boolean") return inclusion.enabled;
    if (typeof inclusion.status === "string")
      return inclusion.status.toUpperCase() === "ACTIVE";
    return true;
  };

  const {
    data: allInclusions,
    error: allError,
    isPending: allPending,
  } = useQuery({
    queryKey: ["packageInclusions", "ALL"],
    enabled:
      props.canViewDashboard && props.packagesIn && inclusionFilter === "ALL",
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/package-inclusion/staff`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.error || "Getting package inclusions (all) failed"
        );
      }
      return await response.json();
    },
  });

  const {
    data: activeInclusions,
    error: activeError,
    isPending: activePending,
  } = useQuery({
    queryKey: ["packageInclusions", "ACTIVE"],
    enabled:
      props.canViewDashboard &&
      props.packagesIn &&
      inclusionFilter === "ACTIVE",
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/package-inclusion/active`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.error || "Getting active package inclusions failed"
        );
      }
      return await response.json();
    },
  });

  const {
    data: inactiveInclusions,
    error: inactiveError,
    isPending: inactivePending,
  } = useQuery({
    queryKey: ["packageInclusions", "INACTIVE"],
    enabled:
      props.canViewDashboard &&
      props.packagesIn &&
      inclusionFilter === "INACTIVE",
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/package-inclusion/staff/inactive`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.error || "Getting inactive package inclusions failed"
        );
      }
      return await response.json();
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    const err = allError || activeError || inactiveError;
    if (!err) return;

    (async () => {
      const tokenExpired = err?.message === "TOKEN_EXPIRED";
      const msg = tokenExpired
        ? "Your session has expired. Please sign in again."
        : "Something went wrong retrieving package inclusions.";

      if (window.__showAlert) {
        await window.__showAlert(msg);
      } else if (window.__nativeAlert) {
        window.__nativeAlert(msg);
      } else {
        alert(msg);
      }

      if (tokenExpired) navigate("/signin");
    })();
  }, [allError, activeError, inactiveError, navigate]);

  const isLoading =
    (inclusionFilter === "ALL" && allPending) ||
    (inclusionFilter === "ACTIVE" && activePending) ||
    (inclusionFilter === "INACTIVE" && inactivePending);

  const inclusionsToShow =
    inclusionFilter === "ALL"
      ? allInclusions || []
      : inclusionFilter === "ACTIVE"
      ? activeInclusions || []
      : inactiveInclusions || [];

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl mt-6">
      <div className="text-white bg-[#48BF56] p-4 font-bold flex flex-wrap justify-between gap-2">
        <div className="text-2xl flex items-center">
          <FontAwesomeIcon icon={faList} className="mr-3" />
          <span>Package Inclusion Management</span>
        </div>
        <button
          type="button"
          className="text-lg text-[#FDDB3C] bg-[#227B05] px-3 py-2 rounded-lg flex items-center hover:bg-[#227B05]/90"
          onClick={() => props.onAddInclusion?.()}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-3" />
          <span>Add Inclusion</span>
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <form className="flex justify-end flex-wrap gap-2">
          <div>
            <span className="font-semibold">Inclusion Activity:</span>
            <select
              value={inclusionFilter}
              onChange={(e) => setInclusionFilter(e.target.value)}
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
            <p className="text-gray-600">Loading package inclusions...</p>
          </div>
        ) : inclusionsToShow && inclusionsToShow.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {inclusionsToShow.map((inclusion) => {
              const active = isInclusionActive(inclusion);

              return (
                <div
                  key={inclusion.inclusionId}
                  className={`col-span-4 md:col-span-2 lg:col-span-1 border rounded-lg p-3 flex flex-col md:flex-row md:items-start md:justify-between gap-3 text-sm ${
                    active
                      ? "border-[#227B05] bg-white"
                      : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">
                        {inclusion.inclusionName}
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

                    <div className="flex items-center gap-1 text-gray-600">
                      <span>Price per person:</span>
                      <span className="font-semibold">
                        <FontAwesomeIcon icon={faPesoSign} />
                        {inclusion.inclusionPricePerPerson}
                      </span>
                    </div>

                    {inclusion.inclusionDescription && (
                      <p className="text-gray-700 mt-1">
                        {inclusion.inclusionDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex md:flex-col items-end justify-between gap-2 md:gap-3">
                    <button
                      type="button"
                      className="text-gray-600 hover:text-[#227B05]"
                      onClick={() => props.onEditInclusion?.(inclusion)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 m-5">
            No package inclusions found.
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowPackageInclusion;
