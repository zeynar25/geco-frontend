import Footer from "../Components/Footer";
import Header from "../Components/Header";
import ValueCard from "../Components/ValueCard";
import HeaderCard from "../Components/HeaderCard";

import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCalendar,
  faCheck,
  faClock,
  faEarthAsia,
  faMoneyBill,
  faPesoSign,
} from "@fortawesome/free-solid-svg-icons";
import BackButton from "../Components/BackButton.jsx";
import { ClipLoader } from "react-spinners";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";

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
  const [loggedIn] = useState(isLoggedIn());
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const location = useLocation();
  const backTo = location.state?.from || "/";
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      alert("Please log in to book a visit.");
      navigate("/signin");
    }
  }, [loggedIn, navigate]);

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

    alert(`Selected: ${paymentMethod}, Package ID: ${selectedPackageId}`);
  }

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);

  const {
    data: accountData,
    error: accountError,
    isPending: accountPending,
  } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
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
            className="col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              title="Operating Hours"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Monday-Thursday"
              description2="8:00 AM - 5:00 PM"
              icon={<FontAwesomeIcon icon={faClock} className="text-4xl" />}
              iconClasses="text-[#48BF56]"
              className="h-full border-0 shadow-2xl"
            />
          </Link>

          <Link
            to="/packages-promos"
            state={{ from: location.pathname }}
            className="col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              title="Packages & Promos"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Various packages available"
              description2="Starting from P100"
              icon={<FontAwesomeIcon icon={faBoxOpen} className="text-4xl" />}
              iconClasses="text-[#222EDA]"
              className="h-full border-0 shadow-2xl"
            />
          </Link>

          <Link
            to="/park-calendar"
            state={{ from: location.pathname }}
            className="col-span-3 md:col-span-1 h-full"
          >
            <ValueCard
              title="Park Calendar"
              titleClasses="text-[#227B05] text-xl mb-3"
              description="Check availability"
              description2="Plan your visit"
              icon={<FontAwesomeIcon icon={faCalendar} className="text-4xl" />}
              iconClasses="text-[#A86CCB]"
              className="h-full border-0 shadow-2xl"
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
                    <span>Choose how you'd like to pay for your visit</span>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Online Down Payment Card */}
                    <HeaderCard
                      onClick={() => setPaymentMethod("online")}
                      className={`cursor-pointer rounded-xl border-2 p-5 shadow transition-all ${
                        paymentMethod === "online"
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
                      onClick={() => setPaymentMethod("park")}
                      className={`cursor-pointer rounded-xl border-2 p-5 shadow transition-all ${
                        paymentMethod === "park"
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
                  {paymentMethod === "online" && (
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

                <div className="flex flex-col gap-3">
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
                      <div>
                        <label htmlFor="">Email</label>
                        <input
                          className="w-full border px-2 py-3 pl-10"
                          type="email"
                          id="email"
                          name="email"
                          value={`${accountData?.detail?.email}`}
                          required
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="">Your Name</label>
                        <input
                          className="w-full border px-2 py-3 pl-10"
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={`${accountData?.detail?.firstName} ${accountData?.detail?.surname}`}
                          required
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="">Contact Number</label>
                        <input
                          className="w-full border px-2 py-3 pl-10"
                          type="text"
                          id="contactNumber"
                          name="contactNumber"
                          value={`${accountData?.detail?.contactNumber}`}
                          required
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="">Group size</label>
                        <input
                          className="w-full border px-2 py-3 pl-10"
                          type="number"
                          id="groupSize"
                          name="groupSize"
                          required
                        />
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

                <div className="flex flex-col gap-3">
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
                          onClick={() => setSelectedPackageId(pkg.packageId)}
                          className={`cursor-pointer bg-white col-span-2 sm:col-span-1 rounded-xl border-2 transition-all ${
                            selectedPackageId === pkg.packageId
                              ? "border-[#0A7A28] ring-2 ring-[#0A7A28]"
                              : "border-transparent"
                          }`}
                        >
                          <HeaderCard
                            headerClass="bg-[#0A7A28] text-white"
                            title={pkg.name}
                            subtitle={pkg.duration + " minutes"}
                            descriptionContent={
                              <div className="flex flex-1 flex-col gap-4 my-5 mx-10">
                                <div className="flex">
                                  <h2 className="font-bold text-xl">
                                    <FontAwesomeIcon icon={faPesoSign} />
                                    {pkg.basePrice}
                                  </h2>
                                  <span className="ml-2 my-auto">
                                    per person
                                  </span>
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
                              </div>
                            }
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <header className="flex flex-col gap-2">
                    <span className="font-bold text-xl text-[#48BF56]">
                      Enhance your Experience (Optional)
                    </span>
                  </header>
                </div>

                <div className="flex justify-between py-4 px-10 bg-green-50 rounded-lg border border-[#227B05]">
                  <div className="flex flex-col">
                    <span>Booking Summary</span>
                    <span>1 visitor * P100 (First Package)</span>
                  </div>
                  <div className="flex flex-col text-end">
                    <span className="font-bold text-xl">
                      <FontAwesomeIcon icon={faPesoSign} />
                      100
                    </span>
                    <span>Estimated Total</span>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-6">
                  <button
                    type="submit"
                    className="text-center bg-[#48BF56] text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                    // disabled={
                    //   !(
                    //     accountData?.detail?.surname &&
                    //     accountData?.detail?.firstName &&
                    //     accountData?.detail?.contactNumber
                    //   )
                    // }
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
