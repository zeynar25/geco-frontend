import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faPlus,
  faEdit,
  faClock,
  faUsers,
  faPesoSign,
} from "@fortawesome/free-solid-svg-icons";

function ShowTourPackage(props) {
  const [tourPackageFilter, setTourPackageFilter] = useState("ALL");

  const isPackageActive = (pkg) => {
    if (!pkg) return true;
    if (typeof pkg.isActive === "boolean") return pkg.isActive;
    if (typeof pkg.active === "boolean") return pkg.active;
    if (typeof pkg.enabled === "boolean") return pkg.enabled;
    if (typeof pkg.status === "string")
      return pkg.status.toUpperCase() === "ACTIVE";
    return true;
  };

  const {
    data: allPackages,
    error: allPackagesError,
    isPending: allPackagesPending,
  } = useQuery({
    queryKey: ["tourPackages", "ALL"],
    enabled:
      props.canViewDashboard && props.packagesIn && tourPackageFilter === "ALL",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const tourPackages = await fetch("http://localhost:8080/package", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!tourPackages.ok) {
        const error = await tourPackages.json();
        throw new Error(error?.error || "Getting tour packages failed");
      }
      return await tourPackages.json();
    },
  });

  if (allPackagesError) {
    alert("something went wrong in retrieving tour packages");
  }

  const {
    data: activePackages,
    error: activePackagesError,
    isPending: activePackagesPending,
  } = useQuery({
    queryKey: ["tourPackages", "ACTIVE"],
    enabled:
      props.canViewDashboard &&
      props.packagesIn &&
      tourPackageFilter === "ACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const tourPackages = await fetch("http://localhost:8080/package/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!tourPackages.ok) {
        const error = await tourPackages.json();
        throw new Error(error?.error || "Getting active tour packages failed");
      }
      return await tourPackages.json();
    },
  });

  if (activePackagesError) {
    alert("something went wrong in retrieving active tour packages");
  }

  const {
    data: inactivePackages,
    error: inactivePackagesError,
    isPending: inactivePackagesPending,
  } = useQuery({
    queryKey: ["tourPackages", "INACTIVE"],
    enabled:
      props.canViewDashboard &&
      props.packagesIn &&
      tourPackageFilter === "INACTIVE",
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const tourPackages = await fetch(
        "http://localhost:8080/package/inactive",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!tourPackages.ok) {
        const error = await tourPackages.json();
        throw new Error(
          error?.error || "Getting inactive tour packages failed"
        );
      }
      return await tourPackages.json();
    },
  });

  if (inactivePackagesError) {
    alert("something went wrong in retrieving inactive tour packages");
  }

  const isLoading =
    (tourPackageFilter === "ALL" && allPackagesPending) ||
    (tourPackageFilter === "ACTIVE" && activePackagesPending) ||
    (tourPackageFilter === "INACTIVE" && inactivePackagesPending);

  const packagesToShow =
    tourPackageFilter === "ALL"
      ? allPackages || []
      : tourPackageFilter === "ACTIVE"
      ? activePackages || []
      : inactivePackages || [];

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <div className="text-white bg-[#48BF56] p-4 font-bold flex justify-between gap-2">
        <div className="text-2xl flex items-center">
          <FontAwesomeIcon icon={faBoxOpen} className="mr-3" />
          <span>Tour Package Management</span>
        </div>
        <button
          type="button"
          className="text-lg text-[#FDDB3C] bg-[#227B05] px-3 py-2 rounded-lg flex items-center hover:bg-[#227B05]/90"
          onClick={() => props.onAddPackage?.()}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-3" />
          <span>Add Tour Package</span>
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <form className="flex justify-end flex-wrap gap-2">
          <div>
            <span className="font-semibold">Package Activity:</span>
            <select
              value={tourPackageFilter}
              onChange={(e) => setTourPackageFilter(e.target.value)}
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
            <p className="text-gray-600">Loading tour packages...</p>
          </div>
        ) : packagesToShow && packagesToShow.length > 0 ? (
          <div className="grid grid-cols-2 gap-10">
            {packagesToShow.map((pkg) => {
              const isActive = isPackageActive(pkg);

              return (
                <div
                  key={pkg.packageId}
                  className={`col-span-2 md:col-span-1 border rounded-lg p-5 flex flex-col gap-3 ${
                    isActive
                      ? "border-[#227B05]"
                      : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">
                          {pkg.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {pkg.duration != null && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FontAwesomeIcon icon={faClock} />
                          {pkg.duration === -1 ? (
                            <span className="italic text-gray-700">
                              Duration decided by staff
                            </span>
                          ) : (
                            <span>{pkg.duration} minutes</span>
                          )}
                        </div>
                      )}

                      {(pkg.minPerson > 0 || pkg.maxPerson > 0) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FontAwesomeIcon icon={faUsers} />
                          <span>
                            Group size:
                            {pkg.minPerson > 0 && pkg.maxPerson > 0
                              ? ` ${pkg.minPerson} - ${pkg.maxPerson} persons`
                              : pkg.minPerson > 0
                              ? ` minimum ${pkg.minPerson} persons`
                              : pkg.maxPerson > 0
                              ? ` up to ${pkg.maxPerson} persons`
                              : null}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 text-sm">
                      <div className="flex flex-col items-end">
                        {pkg.basePrice != null && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-semibold">
                              <FontAwesomeIcon icon={faPesoSign} />
                              {pkg.basePrice}
                            </span>
                          </div>
                        )}
                        {pkg.pricePerPerson != null && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Per Person:</span>
                            <span className="font-semibold">
                              <FontAwesomeIcon icon={faPesoSign} />
                              {pkg.pricePerPerson}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="text-gray-600 hover:text-[#227B05] mt-1"
                        onClick={() => props.onEditPackage?.(pkg)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </div>

                  {pkg.description && (
                    <div className="mt-2 text-sm">
                      <span className="font-semibold block mb-1">
                        Description:
                      </span>
                      <p className="text-gray-700">{pkg.description}</p>
                    </div>
                  )}

                  {pkg.notes && (
                    <div className="mt-2 text-sm">
                      <span className="font-semibold block mb-1">Notes:</span>
                      <p className="text-gray-700">{pkg.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 m-5">
            No tour packages found.
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowTourPackage;
