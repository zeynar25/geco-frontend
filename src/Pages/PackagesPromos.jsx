import Footer from "../Components/Footer";
import Header from "../Components/Header";
import BackButton from "../Components/BackButton";
import HeaderCard from "../Components/HeaderCard";

import { useLocation, Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";

import { ClipLoader } from "react-spinners";

import { useQuery } from "@tanstack/react-query";

function PackagesPromos() {
  const location = useLocation();
  const backTo = location.state?.from || "/";

  const {
    data: packageData,
    error: packageError,
    isPending: packagePending,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      // Simulate network delay
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      const tourPackages = await fetch("http://localhost:8080/package/active");
      if (!tourPackages.ok) {
        const error = await tourPackages.json();
        throw new Error(error?.error || "Getting tour packages failed");
      }
      return await tourPackages.json();
    },
  });

  if (packageError) {
    alert("something went wrong in retrieving tour packages");
  }

  // const {
  //   data: inclusionData,
  //   error: inclusionError,
  //   isPending: inclusionPending,
  // } = useQuery({
  //   queryKey: ["package-inclusions"],
  //   queryFn: async () => {
  //     // Simulate network delay
  //     // await new Promise((resolve) => setTimeout(resolve, 10000));

  //     const packageInclusions = await fetch(
  //       "http://localhost:8080/package-inclusion/active"
  //     );
  //     if (!packageInclusions.ok) {
  //       const error = await packageInclusions.json();
  //       throw new Error(
  //         error?.error || "Getting tour package inclusions failed"
  //       );
  //     }
  //     return await packageInclusions.json();
  //   },
  // });

  // if (inclusionError) {
  //   alert("something went wrong in retrieving tour package inclusions");
  // }

  return (
    <>
      <Header />
      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 flex flex-col gap-5">
        <BackButton
          to={backTo}
          title="Packages & Promos"
          description="Choose the perfect experience for your visit"
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {packagePending ? (
            <div className="flex justify-center items-center col-span-2 lg:col-span-3 py-10">
              <ClipLoader color="#17EB88" size={40} />
              <span className="ml-3 font-semibold">
                Loading Tour packages...
              </span>
            </div>
          ) : (
            packageData?.map((pkg) => (
              <HeaderCard
                key={pkg.packageId}
                className="bg-white col-span-2 sm:col-span-1"
                headerClass="bg-[#0A7A28] text-white"
                title={pkg.name}
                subtitle={
                  pkg.duration >= 0 ? pkg.duration + " minutes" : undefined
                }
                descriptionContent={
                  <div className="flex flex-1 flex-col gap-4 my-5 mx-10">
                    <div className="flex gap-2 justify-between">
                      {pkg.basePrice > 0 && (
                        <div className="flex">
                          <h2 className="font-bold text-xl">
                            P{pkg.basePrice}
                          </h2>
                          <span className="ml-2 my-auto">Base price</span>
                        </div>
                      )}
                      {pkg.pricePerPerson > 0 && (
                        <div className="flex">
                          <h2 className="font-bold text-xl">
                            P{pkg.pricePerPerson}
                          </h2>
                          <span className="ml-2 my-auto">per person</span>
                        </div>
                      )}
                    </div>
                    {pkg.minPerson > 0 && pkg.maxPerson > 0 && (
                      <div className="flex">
                        <h2 className="font-bold text-sm mb-2">
                          {pkg.minPerson} - {pkg.maxPerson} pax
                        </h2>
                      </div>
                    )}
                    <p>{pkg.description}</p>
                    <div>
                      <h3 className="font-semibold text-lg">
                        What's included:{" "}
                      </h3>
                      <ul>
                        {pkg.inclusions?.map((inclusion) => (
                          <li key={inclusion.inclusionId}>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#17EB88] mr-2"
                            />
                            {inclusion.inclusionName}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      to={"/book#" + pkg.packageId}
                      state={{
                        from: location.pathname,
                        selectedPackageId: pkg.packageId,
                        selectedPackage: pkg,
                      }}
                      className="bg-[#0A7A28]/90 text-white border-2 border-black rounded-lg py-2 px-3 hover:bg-[#0A7A28] hover:cursor-pointer mt-auto flex items-center justify-center"
                    >
                      <FontAwesomeIcon
                        icon={faCalendarCheck}
                        className="text-white mr-2"
                      />
                      <span>Book your visit now</span>
                    </Link>
                  </div>
                }
              />
            ))
          )}
        </div>

        {/* <HeaderCard
          className="bg-white"
          headerClass="bg-[#222EDA] text-white"
          icon={<FontAwesomeIcon icon={faPlus} className="text-2xl" />}
          title="Available Package Inclusions"
          subtitle="Enhance your experience with these optional extras"
          descriptionContent={
            inclusionPending ? (
              <div className="flex justify-center items-center col-span-3 py-10">
                <ClipLoader color="#17EB88" size={40} />
                <span className="ml-3 font-semibold">
                  Loading Tour package inclusions...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 my-5 mx-10">
                {inclusionData?.map((inclusion) => (
                  <HeaderCard
                    key={inclusion.inclusionId}
                    className="bg-whitecol-span-2 sm:col-span-1 border-2"
                    headerContent={
                      <div className="flex flex-col xl:flex-row justify-between gap-2 px-10 pt-5">
                        <span className="font-bold w-fit mx-auto xl:mx-0">
                          {inclusion.inclusionName}
                        </span>
                        <span className="bg-[#222EDA]/30 px-3 rounded-md w-fit mx-auto xl:mx-0">
                          + P{inclusion.inclusionPricePerPerson}
                        </span>
                      </div>
                    }
                    description={inclusion.inclusionDescription}
                  />
                ))}
              </div>
            )
          }
        /> */}
      </div>
      <Footer />
    </>
  );
}

export default PackagesPromos;
