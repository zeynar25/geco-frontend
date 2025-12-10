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

  return (
    <>
      <Header />
      <div className="bg-green-50 px-20 py-10 min-h-fit">
        <BackButton
          to={backTo}
          title="Operating Hours and Schedule"
          description="Plan your visit with our detailed schedule information"
        />
        <div className="grid grid-cols-2 gap-5 px-20 m-5">
          {packagePending ? (
            <div className="flex justify-center items-center col-span-2 py-10">
              <ClipLoader color="#17EB88" size={40} />
              <span className="ml-3 text-[#17EB88] font-semibold">
                Loading packages...
              </span>
            </div>
          ) : (
            packageData?.map((pkg) => (
              <HeaderCard
                key={pkg.packageId}
                className="col-span-2 md:col-span-1"
                headerClass="bg-[#17EB88] text-white"
                title={pkg.name}
                subtitle={pkg.duration + " minutes"}
                descriptionClass="flex flex-1 flex-col gap-4"
                descriptionContent={
                  <>
                    <div className="flex">
                      <h2 className="font-bold text-xl">P{pkg.basePrice}</h2>
                      <span className="ml-2 my-auto">per person</span>
                    </div>
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
                    <button className="group bg-[#17EB88]/80 text-white border-2 border-black rounded-lg py-2 px-3 hover:bg-[#17EB88] hover:text-black hover:cursor-pointer mt-auto">
                      <FontAwesomeIcon
                        icon={faCalendarCheck}
                        className="text-white mr-2 group-hover:text-black"
                      />
                      <span>Book your visit now</span>
                    </button>
                  </>
                }
              />
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PackagesPromos;
