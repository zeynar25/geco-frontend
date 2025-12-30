import Footer from "../Components/Footer";
import Header from "../Components/Header";
import BackButton from "../Components/BackButton";
import HeaderCard from "../Components/HeaderCard";
import { API_BASE_URL } from "../apiConfig";

import { useLocation, Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faBuildingCircleXmark,
  faPeopleGroup,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCalendarCheck,
  faCircleCheck,
} from "@fortawesome/free-regular-svg-icons";

import { ClipLoader } from "react-spinners";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function ParkCalendar() {
  const [show, setShow] = useState(true);

  function setDay(day) {
    setShow(false);

    // Deselect if already selected
    if (selectedDay === day) {
      setTimeout(() => {
        setSelectedDay(null);
        setSelectedDayStatus(null);
        setShow(true);
      }, 250);
    } else {
      setTimeout(() => {
        setSelectedDay(day);
        setShow(true);
      }, 250);
    }
  }
  const location = useLocation();
  const backTo = location.state?.from || "/";

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // NEW: State for selected day
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayStatus, setSelectedDayStatus] = useState(null);

  const currentDate = new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    setSelectedDay(null); // reset selection on month change
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    setSelectedDay(null); // reset selection on month change
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const {
    data: calendarData,
    isPending: calendarPending,
    error: calendarError,
  } = useQuery({
    queryKey: ["calendar", year, month],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/calendar/${year}/${month + 1}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Getting park calendar failed");
      }
      return response.json();
    },
  });

  if (calendarError) {
    alert("something went wrong in retrieving park calendar");
  }

  // If a day is selected, show its stats, else show monthly stats
  let swappableDate, totalBookings, totalVisitors;
  if (selectedDay && calendarData?.[selectedDay]) {
    swappableDate = new Date(year, month, selectedDay).toLocaleString(
      "default",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
    totalBookings = calendarData[selectedDay].bookings || 0;
    totalVisitors = calendarData[selectedDay].visitors || 0;
  } else {
    swappableDate = currentDate;
    totalBookings = Object.values(calendarData || {}).reduce(
      (sum, day) => sum + (day.bookings || 0),
      0
    );
    totalVisitors = Object.values(calendarData || {}).reduce(
      (sum, day) => sum + (day.visitors || 0),
      0
    );
  }

  return (
    <>
      <Header />
      <div className="bg-green-50 px-5 sm:px-10 md:px-15 lg:px-20 py-10 flex flex-col gap-5">
        <BackButton
          to={backTo}
          title="Park Availability Calendar"
          description="Click on any date to see availability details for that day"
        />

        <div className="grid grid-cols-5 gap-5">
          {/* Calendar */}
          <HeaderCard
            className="bg-white col-span-5 lg:col-span-3"
            headerClass="bg-[#48BF56] text-white"
            icon={
              <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl" />
            }
            title="Park Calendar"
            subtitle="Click on any date to see availability details for that day"
            descriptionContent={
              <div>
                <header className="flex justify-between items-center mb-5 p-3">
                  <button onClick={prevMonth}>
                    <FontAwesomeIcon
                      icon={faAngleLeft}
                      className="text-xl p-2 rounded-lg hover:bg-[#020D00]/20 hover:cursor-pointer"
                    />
                  </button>
                  <span className="font-bold">{currentDate}</span>
                  <button onClick={nextMonth}>
                    <FontAwesomeIcon
                      icon={faAngleRight}
                      className="text-xl p-2 rounded-lg hover:bg-[#020D00]/20 hover:cursor-pointer"
                    />
                  </button>
                </header>
                <div className="my-5 mx-5 xs:mx-10">
                  {/* day labels */}
                  <div className="col-span-7 grid grid-cols-7 text-center font-semibold mb-2">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>
                  {/* dates */}
                  <div>
                    {calendarPending ? (
                      <div className="flex justify-center items-center py-10">
                        <ClipLoader color="#17EB88" size={40} />
                        <span className="ml-3 font-semibold">
                          Loading calendar...
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-7 text-center gap-1 xs:gap-2">
                        {/* empty slots before first day */}
                        {Array.from({ length: firstDayOfMonth }).map(
                          (_, index) => (
                            <div key={`empty-${index}`} className="p-3"></div>
                          )
                        )}

                        {/* days of the month */}
                        {Array.from({ length: daysInMonth }).map(
                          (_, dayIdx) => {
                            const dayNum = dayIdx + 1;
                            const dayData = calendarData?.[dayNum];

                            // Determine background color based on bookings
                            let bgColor = "";
                            if (dayData) {
                              console.log(dayData);
                              if (
                                dayData.status === "AVAILABLE" ||
                                dayData.status === null
                              ) {
                                if (dayData.bookings > 0) {
                                  bgColor = "bg-[#FDDB3C]/50";
                                } else {
                                  bgColor = "bg-[#48BF56]";
                                }
                              } else if (dayData.status === "FULLY_BOOKED")
                                bgColor = "bg-[#E32726]/50";
                              else if (dayData.status === "CLOSED")
                                bgColor = "bg-[#020D00]/50";
                            }

                            // Highlight if selected
                            const isSelected = selectedDay === dayNum;
                            const border = isSelected
                              ? "border-2"
                              : "border-2 border-transparent";

                            return (
                              <div
                                key={dayNum}
                                className={`p-3 rounded cursor-pointer ${bgColor} ${border} hover:border-2 hover:border-[#020D00]`}
                                onClick={() => (
                                  setDay(dayNum),
                                  setSelectedDayStatus(dayData?.status)
                                )}
                              >
                                <span className="font-bold">{dayNum}</span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            }
          />

          <div className="col-span-5 lg:col-span-2 flex flex-col gap-5">
            {/* legend */}
            <HeaderCard
              className="bg-white min-h-fit"
              headerClass="text-[#0A7A28] justify-center"
              title="Availability Legend"
              descriptionContent={
                <div className="grid grid-cols-4 items-center gap-3 m-auto py-5 md:py-10 lg:py-5">
                  <div className="bg-[#48BF56]/50 text-[#48BF56] rounded-xl flex items-center px-3 py-2 col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-3 h-full">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-xl mr-3"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">Available</span>
                    </div>
                  </div>
                  <div className="bg-[#FDDB3C]/20 text-[#FDDB3C] py-2 px-3 rounded-xl flex items-center col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-3 h-full">
                    <FontAwesomeIcon icon={faUser} className="text-xl mr-3" />
                    <div className="flex flex-col">
                      <span className="font-semibold">Limited</span>
                    </div>
                  </div>
                  <div className="bg-[#E32726]/50 text-[#E32726] py-2 px-3 rounded-xl flex items-center col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-3 h-full">
                    <FontAwesomeIcon
                      icon={faPeopleGroup}
                      className="text-xl mr-3"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">Fully Booked</span>
                    </div>
                  </div>
                  <div className="bg-[#020D00]/50 text-[#020D00] py-2 px-3 rounded-xl flex items-center col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-3 h-full">
                    <FontAwesomeIcon
                      icon={faBuildingCircleXmark}
                      className="text-xl mr-3"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">Park Closed</span>
                    </div>
                  </div>
                </div>
              }
            />
            <HeaderCard
              className={`bg-white transition-opacity duration-300 ${
                show ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              headerClass="bg-white text-[#0A7A28] justify-center"
              title={swappableDate}
              descriptionContent={
                <div className="grid grid-cols-2 mb-5 mx-10 h-full items-center">
                  <span className="font-semibold">Expected Visitors:</span>
                  <span className="text-center">{totalVisitors}</span>
                  <span className="font-semibold">Total Bookings:</span>
                  <span className="text-center">{totalBookings}</span>

                  {swappableDate !== currentDate &&
                    selectedDayStatus !== "CLOSED" && (
                      <div className="col-span-2 text-center">
                        <Link
                          className="bg-[#0A7A28]/90 text-white border-2 border-black rounded-lg py-2 px-3 hover:bg-[#0A7A28] hover:cursor-pointer mt-5 flex items-center justify-center"
                          to="/book#visitSchedule"
                          state={{
                            from: location.pathname,
                            selectedDate: `${year}-${String(month + 1).padStart(
                              2,
                              "0"
                            )}-${String(selectedDay).padStart(2, "0")}`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faCalendarCheck}
                            className="text-white mr-2"
                          />
                          <span>Book your visit now</span>
                        </Link>
                      </div>
                    )}
                </div>
              }
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ParkCalendar;
