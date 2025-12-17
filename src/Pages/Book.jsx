import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ValueCard from "../Components/ValueCard";
import HeaderCard from "../Components/HeaderCard";

import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCalendar,
  faCheck,
  faClock,
  faEarthAsia,
  faEnvelope,
  faMoneyBill,
  faPesoSign,
  faPhone,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import BackButton from "../Components/BackButton.jsx";
import { ClipLoader } from "react-spinners";

function isLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && Date.now() < decoded.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function Book() {
  const location = useLocation();
  const backTo = location.state?.from || "/";
  const navigate = useNavigate();

  const [loggedIn] = useState(isLoggedIn());
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedGroupSize, setSelectedGroupSize] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(
    location.state?.selectedPackageId || null
  );
  const [selectedPackage, setSelectedPackage] = useState(
    location.state?.selectedPackage || null
  );
  const [groupSizeError, setGroupSizeError] = useState("");
  // const [selectedInclusions, setSelectedInclusions] = useState([]);

  useEffect(() => {
    if (!loggedIn) {
      alert("Please log in to book a visit.");
      navigate("/signin");
    }
  }, [loggedIn, navigate]);

  useEffect(() => {
    // Scroll to the element with the ID matching the hash
    if (location.hash) {
      const targetId = location.hash.startsWith("#")
        ? location.hash.slice(1)
        : location.hash;

      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [location]);

  function handlePaymentMethodChange(method) {
    if (paymentMethod === method) {
      setPaymentMethod(null);
    } else {
      setPaymentMethod(method);
    }
  }

  function handleSelectedPackageIdChange(pkg) {
    if (selectedPackageId === pkg.packageId) {
      setSelectedPackageId(null);
      setSelectedPackage(null);
      setGroupSizeError("");
    } else {
      setSelectedPackageId(pkg.packageId);
      setSelectedPackage(pkg);
      // Re-validate group size if already set
      if (selectedGroupSize !== null && selectedGroupSize !== "") {
        validateGroupSize(selectedGroupSize, pkg);
      }
    }
  }

  function validateGroupSize(value, pkg = selectedPackage) {
    if (!pkg) {
      setGroupSizeError("Choose a tour package first");
      return;
    }
    const min = pkg.minPerson || 1;
    const max = pkg.maxPerson || 1000;
    if (value < min) {
      setGroupSizeError(`Group size for this package must be at least ${min}`);
    } else if (value > max) {
      setGroupSizeError(`Group size for this package must not exceed ${max}`);
    } else {
      setGroupSizeError("");
    }
  }

  // function handleInclusionToggle(inclusionId) {
  //   setSelectedInclusions((prev) =>
  //     prev.includes(inclusionId)
  //       ? prev.filter((id) => id !== inclusionId)
  //       : [...prev, inclusionId]
  //   );
  // }

  function handleSubmit(e) {
    e.preventDefault();

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (!selectedPackageId) {
      alert("Please select a tour package.");
      return;
    }

    // Validate group size before submit
    if (groupSizeError) {
      alert(groupSizeError);
      return;
    }

    const bookingRequest = {
      accountId: accountData.accountId,
      tourPackageId: selectedPackageId,
      bookingInclusionRequests: [],
      visitDate: document.getElementById("visitDate").value,
      visitTime: document.getElementById("visitTime").value,
      groupSize: selectedGroupSize,
      paymentMethod: paymentMethod,
    };

    console.log(bookingRequest);
    createBooking(bookingRequest);
  }

  const {
    data: accountData,
    error: accountError,
    isPending: accountPending,
  } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const account = await fetch(
        `http://localhost:8080/account/${decoded.sub}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!account.ok) {
        const error = await account.json();
        throw new Error(error?.error || "Getting account failed");
      }
      return await account.json();
    },
  });

  if (accountError) {
    alert("something went wrong in retrieving account");
  }

  const {
    data: packageData,
    error: packageError,
    isPending: packagePending,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
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
  //   queryKey: ["package-inclusions", selectedPackageId],
  //   queryFn: async () => {
  //     const packageInclusions = await fetch(
  //       `http://localhost:8080/package/${selectedPackageId}/inclusions/available`
  //     );
  //     if (!packageInclusions.ok) {
  //       const error = await packageInclusions.json();
  //       throw new Error(
  //         error?.error || "Getting tour package inclusions failed"
  //       );
  //     }
  //     return await packageInclusions.json();
  //   },
  //   enabled: !!selectedPackageId,
  // });

  // if (inclusionError) {
  //   alert("something went wrong in retrieving tour package inclusions");
  // }

  const addBooking = async (bookingRequest) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8080/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingRequest),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || "Booking failed");
    }
    return response.json();
  };

  const { mutate: createBooking } = useMutation({
    mutationFn: addBooking,
    onError: (error) => {
      alert(error.message || "Booking failed");
    },

    // Redirect to the confirmation page and pass booking data
    onSuccess: (data) => {
      navigate("/booking-success", { state: { booking: data } });
    },
  });

  return (
    <>
      <Header />

      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 flex flex-col gap-5">
        <BackButton
          to={backTo}
          title="Book Your Visit"
          description="Reserve your spot at CvSU Agri-Eco Tourism Park"
        />

        <div className="col-span-2 grid grid-cols-3 gap-5 items-stretch">
          <Link
            to="/operating-hours"
            state={{ from: location.pathname }}
            className="hover:shadow-2xl rounded-2xl overflow-hidden col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              className="h-full border-0 shadow"
              title="Operating Hours"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Monday-Thursday"
              description2="8:00 AM - 5:00 PM"
              icon={<FontAwesomeIcon icon={faClock} className="text-4xl" />}
              iconClasses="text-[#48BF56]"
            />
          </Link>

          <Link
            to="/packages-promos"
            state={{ from: location.pathname }}
            className="hover:shadow-2xl rounded-2xl overflow-hidden col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              className="h-full border-0 shadow"
              title="Packages & Promos"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Various packages available"
              description2="Starting from P100"
              icon={<FontAwesomeIcon icon={faBoxOpen} className="text-4xl" />}
              iconClasses="text-[#222EDA]"
            />
          </Link>

          <Link
            to="/park-calendar"
            state={{ from: location.pathname }}
            className="hover:shadow-2xl rounded-2xl overflow-hidden col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              className="h-full border-0 shadow"
              title="Park Calendar"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Check availability"
              description2="Plan your visit"
              icon={<FontAwesomeIcon icon={faCalendar} className="text-4xl" />}
              iconClasses="text-[#A86CCB]"
            />
          </Link>
        </div>

        <HeaderCard
          headerClass="bg-[#48BF56] text-white text-xl"
          title="Reservation Details"
          descriptionContent={
            <div className="m-5">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <header className="flex flex-col gap-2">
                    <span className="font-bold text-xl text-[#48BF56]">
                      Payment Method
                    </span>
                    <span>Choose how'd like to pay for your visit</span>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Online Down Payment Card */}
                    <HeaderCard
                      onClick={() => handlePaymentMethodChange("ONLINE")}
                      className={`cursor-pointer rounded-xl border-2 p-5 shadow transition-all ${
                        paymentMethod === "ONLINE"
                          ? "border-[#222EDA] ring-2 ring-[#222EDA]"
                          : "border-gray-300"
                      }`}
                      headerClass="pt-0 pl-0 pr-0"
                      icon={
                        <FontAwesomeIcon
                          icon={faEarthAsia}
                          className="text-[#222EDA] text-2xl"
                        />
                      }
                      title="Online Down Payment"
                      subtitle="Pay 50% down payment via GCash after admin approval"
                      descriptionContent={
                        <ul className="space-y-1">
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#222EDA] mr-2"
                            />
                            <span>
                              Submit proof of down payment after booking
                              confirmed
                            </span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#222EDA] mr-2"
                            />
                            <span>
                              Once proof is verified, your booking is all set
                            </span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#222EDA] mr-2"
                            />
                            <span>Balance payable at the park</span>
                          </li>
                        </ul>
                      }
                    />

                    {/* Pay at Park Card */}
                    <HeaderCard
                      onClick={() => handlePaymentMethodChange("PARK")}
                      className={`cursor-pointer rounded-xl border-2 p-5 shadow transition-all ${
                        paymentMethod === "PARK"
                          ? "border-[#FDDB3C] ring-2 ring-[#FDDB3C]"
                          : "border-gray-300"
                      }`}
                      headerClass="pt-0 pl-0 pr-0"
                      icon={
                        <FontAwesomeIcon
                          icon={faMoneyBill}
                          className="text-[#FDDB3C] text-2xl"
                        />
                      }
                      title="Pay at Park"
                      subtitle="Pay full amount in cash on your visit day"
                      descriptionContent={
                        <ul className="space-y-1">
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#FDDB3C] mr-2"
                            />
                            <span>No online payment needed</span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#FDDB3C] mr-2"
                            />
                            <span>Faster booking process</span>
                          </li>
                          <li>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-[#FDDB3C] mr-2"
                            />
                            <span>Full amount due on arrival</span>
                          </li>
                        </ul>
                      }
                    />
                  </div>
                  {paymentMethod === "ONLINE" && (
                    <div className="bg-[#222EDA]/20 text-[#222EDA] rounded-lg p-4 flex flex-col gap-3">
                      <div>
                        <span className="font-bold mr-2">Gcash Number:</span>
                        <span>09xx-xxx-xxxx (CvSU Agri-Eco Park)</span>
                      </div>
                      <p className="text-sm text-black">
                        After submitting this form, you’ll receive payment
                        instructions and a link to submit your proof of payment
                        within 24 hours of approval. You may track your booking
                        status anytime in “My Schedule”
                      </p>
                    </div>
                  )}
                </div>
                {/* Visit Schedule */}
                <div id="visitSchedule" className="flex flex-col gap-3">
                  <header className="flex flex-col gap-2">
                    <span className="font-bold text-xl text-[#48BF56]">
                      Visit Schedule
                    </span>
                  </header>
                  <div className="grid grid-cols-2 gap-2 xs:gap-10">
                    <div className="col-span-2 xs:col-span-1">
                      <label htmlFor="">Visit Date</label>
                      <input
                        className="w-full border px-5 py-3"
                        type="date"
                        id="visitDate"
                        name="visitDate"
                        defaultValue={location.state?.selectedDate || ""}
                        required
                      />
                    </div>
                    <div className="col-span-2 xs:col-span-1">
                      <label htmlFor="">Visit time</label>
                      <input
                        className="w-full border px-5 py-3"
                        type="time"
                        id="visitTime"
                        name="visitTime"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Tour packages */}
                <div id="package-selection" className="flex flex-col gap-3">
                  <header className="flex flex-col gap-2">
                    <span className="font-bold text-xl text-[#48BF56]">
                      Choose your package
                    </span>
                  </header>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                    {packagePending ? (
                      <div className="flex justify-center items-center col-span-2 lg:col-span-3 py-10">
                        <ClipLoader color="#17EB88" size={40} />
                        <span className="ml-3 font-semibold">
                          Loading Tour packages...
                        </span>
                      </div>
                    ) : (
                      packageData?.map((pkg) => (
                        <div
                          key={pkg.packageId}
                          id={pkg.packageId}
                          onClick={() => handleSelectedPackageIdChange(pkg)}
                          className={`cursor-pointer bg-white col-span-2 sm:col-span-1 rounded-xl border-2 transition-all ${
                            selectedPackageId === pkg.packageId
                              ? "border-[#0A7A28] ring-2 ring-[#0A7A28]"
                              : "border-transparent"
                          }`}
                        >
                          <HeaderCard
                            headerClass="bg-[#0A7A28] text-white"
                            title={pkg.name}
                            subtitle={
                              pkg.duration >= 0
                                ? pkg.duration + " minutes"
                                : undefined
                            }
                            descriptionContent={
                              <div className="flex flex-1 flex-col gap-4 my-5 mx-10">
                                <div className="flex flex-col gap-2 justify-between text-md">
                                  {pkg.basePrice > 0 && (
                                    <div className="flex">
                                      <h2 className="font-bold text-xl">
                                        <FontAwesomeIcon icon={faPesoSign} />
                                        {pkg.basePrice}
                                      </h2>
                                      <span className="ml-2 my-auto">
                                        Base price
                                      </span>
                                    </div>
                                  )}

                                  {pkg.pricePerPerson > 0 && (
                                    <div className="flex">
                                      <h2 className="font-bold text-xl">
                                        <FontAwesomeIcon icon={faPesoSign} />
                                        {pkg.pricePerPerson}
                                      </h2>
                                      <span className="ml-2 my-auto">
                                        per person
                                      </span>
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
                              </div>
                            }
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {/* Tour package inclusions */}
                {/* {selectedPackageId && (
                  <div className="flex flex-col gap-3">
                    <header className="flex flex-col gap-2">
                      <span className="font-bold text-xl text-[#48BF56]">
                        Enhance your Experience (Optional)
                      </span>
                    </header>
                    <HeaderCard
                      className="bg-white"
                      headerClass="bg-[#222EDA] text-white"
                      icon={
                        <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                      }
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
                            {inclusionData?.map((inclusion) => {
                              const isSelected = selectedInclusions.includes(
                                inclusion.inclusionId
                              );
                              return (
                                <div
                                  key={inclusion.inclusionId}
                                  onClick={() =>
                                    handleInclusionToggle(inclusion.inclusionId)
                                  }
                                  className={`cursor-pointer col-span-2 sm:col-span-1 border-2 rounded-xl transition-all ${
                                    isSelected
                                      ? "border-[#222EDA] ring-2 ring-[#222EDA] bg-[#f5f7ff]"
                                      : "border-gray-200 bg-white"
                                  }`}
                                >
                                  <HeaderCard
                                    className="bg-transparent shadow-none"
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
                                </div>
                              );
                            })}
                          </div>
                        )
                      }
                    />
                  </div>
                )} */}
                {/* account information */}
                <div className="flex flex-col gap-3 mb-10">
                  <header className="flex flex-col gap-2">
                    <span className="font-bold text-xl text-[#48BF56]">
                      Booking information
                    </span>
                  </header>
                  {accountPending ? (
                    <div className="flex justify-center items-center py-10">
                      <ClipLoader color="#17EB88" size={40} />
                      <span className="ml-3 font-semibold">
                        Loading account details...
                      </span>
                    </div>
                  ) : accountData?.detail?.surname &&
                    accountData?.detail?.firstName &&
                    accountData?.detail?.contactNumber ? (
                    // Display account details, and get the group size for this booking
                    <div className="grid grid-cols-2 gap-10">
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="absolute text-xl left-3 top-1/3"
                        />
                        <input
                          className="w-full border px-2 py-3 pl-11"
                          type="email"
                          id="email"
                          name="email"
                          value={`${accountData?.detail?.email}`}
                          required
                          readOnly
                        />
                      </div>
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="absolute text-xl left-3 top-1/3"
                        />
                        <input
                          className="w-full border px-2 py-3 pl-11"
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={`${accountData?.detail?.firstName} ${accountData?.detail?.surname}`}
                          required
                          readOnly
                        />
                      </div>
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="absolute text-xl left-3 top-1/3"
                        />
                        <input
                          className="w-full border px-2 py-3 pl-11"
                          type="text"
                          id="contactNumber"
                          name="contactNumber"
                          value={`${accountData?.detail?.contactNumber}`}
                          required
                          readOnly
                        />
                      </div>
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="absolute text-xl left-3 top-1/3"
                        />
                        <input
                          className={`w-full border px-2 py-3 pl-11 ${
                            groupSizeError ? "border-red-500" : ""
                          }`}
                          type="number"
                          id="groupSize"
                          name="groupSize"
                          required
                          placeholder="Enter your group size"
                          min={selectedPackage?.minPerson || 1}
                          max={selectedPackage?.maxPerson || 1000}
                          value={selectedGroupSize ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value);
                            setSelectedGroupSize(value);
                            validateGroupSize(value);
                          }}
                        />
                        {groupSizeError && (
                          <div className="absolute text-red-500 text-sm mt-1">
                            {groupSizeError}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#E32726]/20 text-[#E32726] rounded-lg p-4 flex flex-col gap-3 text-center">
                      <span className="font-bold mr-2">
                        Please register your details first
                      </span>
                      <Link to="/my-account" className="underline">
                        Register here
                      </Link>
                    </div>
                  )}
                </div>
                {selectedPackage &&
                  selectedGroupSize >= selectedPackage.minPerson &&
                  selectedGroupSize <= selectedPackage.maxPerson && (
                    <div className="flex flex-col xs:flex-row justify-between py-4 px-10 bg-green-50 rounded-lg border border-[#227B05]">
                      <div className="flex flex-col">
                        <span>Booking Summary</span>
                        <span>
                          {selectedPackage.basePrice > 0 &&
                            ` P${selectedPackage.basePrice} Base Price`}{" "}
                          {selectedPackage.basePrice > 0 &&
                            selectedPackage.pricePerPerson > 0 &&
                            +" + "}
                          {selectedPackage.pricePerPerson > 0 &&
                            `P${selectedPackage.pricePerPerson} per person`}{" "}
                          ({selectedPackage.name})
                        </span>
                      </div>
                      <div className="flex flex-col text-end">
                        <span className="font-bold text-xl">
                          <FontAwesomeIcon icon={faPesoSign} />
                          {selectedPackage.basePrice +
                            (selectedPackage.pricePerPerson
                              ? selectedPackage.pricePerPerson *
                                selectedGroupSize
                              : 0)}
                        </span>
                        <span>Estimated Total</span>
                      </div>
                    </div>
                  )}
                <div className="flex items-center justify-center mt-6">
                  <button
                    type="submit"
                    className="text-center bg-[#48BF56] text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                      !(
                        accountData?.detail?.surname &&
                        accountData?.detail?.firstName &&
                        accountData?.detail?.contactNumber
                      )
                    }
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            </div>
          }
        />
      </div>

      <Footer />
    </>
  );
}

export default Book;
