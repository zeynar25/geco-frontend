import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../apiConfig";
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

function ShowCalendar(props) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("AVAILABLE");
  const [show, setShow] = useState(true);

  const queryClient = useQueryClient();

  const currentDate = new Date(year, month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setSelectedDay(null);
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  const {
    data: calendarData,
    isPending: calendarPending,
    error: calendarError,
  } = useQuery({
    queryKey: ["calendar", year, month],
    enabled: props.canViewDashboard && props.calendarIn,
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/calendar/${year}/${month + 1}`
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting park calendar failed");
      }
      return response.json();
    },
  });

  if (calendarError) {
    alert("something went wrong in retrieving park calendar");
  }

  // Determine stats: for selected day or whole month
  let displayLabel;
  let totalBookings;
  let totalVisitors;
  let currentDayStatus = "AVAILABLE";

  if (selectedDay && calendarData?.[selectedDay]) {
    displayLabel = new Date(year, month, selectedDay).toLocaleString(
      "default",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
    const dayData = calendarData[selectedDay];
    totalBookings = dayData.bookings || 0;
    totalVisitors = dayData.visitors || 0;
    currentDayStatus = dayData.status || "AVAILABLE";
  } else {
    displayLabel = currentDate;
    totalBookings = Object.values(calendarData || {}).reduce(
      (sum, day) => sum + (day.bookings || 0),
      0
    );
    totalVisitors = Object.values(calendarData || {}).reduce(
      (sum, day) => sum + (day.visitors || 0),
      0
    );
  }

  // Keep selectedStatus in sync when day changes
  const handleDayClick = (dayNum) => {
    setShow(false);

    if (selectedDay === dayNum) {
      setTimeout(() => {
        setSelectedDay(null);
        setSelectedStatus("AVAILABLE");
        setShow(true);
      }, 250);
      return;
    }

    setTimeout(() => {
      setSelectedDay(dayNum);

      const dayData = calendarData?.[dayNum];
      if (dayData && dayData.status) {
        setSelectedStatus(dayData.status);
      } else {
        setSelectedStatus("AVAILABLE");
      }
      setShow(true);
    }, 250);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ date, status }) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/calendar-date`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, dateStatus: status }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating date status failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["calendar"],
        exact: false,
      });
      alert("Date status updated successfully.");
    },
    onError: (error) => {
      alert(error.message || "Updating date status failed");
    },
  });

  const handleSaveStatus = () => {
    if (!selectedDay) {
      alert("Please select a day to update its status.");
      return;
    }

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      selectedDay
    ).padStart(2, "0")}`;

    updateStatusMutation.mutate({ date: dateString, status: selectedStatus });
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <div className="text-white bg-[#48BF56] p-4 font-bold flex flex-wrap justify-between gap-2">
        <div className="text-2xl flex items-center">
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
          <span>Park Calendar & Booking Overview</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5 py-5 px-1 xs:px-5">
        {/* Calendar */}
        <div className="col-span-5 lg:col-span-3 border rounded-lg bg-white overflow-hidden">
          <div className="flex justify-between items-center mb-5 p-1 sm:p-3 border-b bg-gray-50">
            <button onClick={prevMonth}>
              <FontAwesomeIcon
                icon={faAngleLeft}
                className="text-xl p-2 rounded-lg hover:bg-[#020D00]/10 hover:cursor-pointer"
              />
            </button>
            <span className="font-bold">{currentDate}</span>
            <button onClick={nextMonth}>
              <FontAwesomeIcon
                icon={faAngleRight}
                className="text-xl p-2 rounded-lg hover:bg-[#020D00]/10 hover:cursor-pointer"
              />
            </button>
          </div>

          <div className="px-5 pb-5">
            <div className="grid grid-cols-7 text-center font-semibold mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {calendarPending ? (
              <div className="flex justify-center items-center py-10">
                <ClipLoader color="#17EB88" size={40} />
                <span className="ml-3 font-semibold">Loading calendar...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 text-center gap-1">
                {/* empty slots before first day */}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-3" />
                ))}

                {/* days of the month */}
                {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                  const dayNum = dayIdx + 1;
                  const dayData = calendarData?.[dayNum];

                  let bgColor = "";
                  if (dayData) {
                    if (
                      dayData.status === "AVAILABLE" ||
                      dayData.status == null
                    ) {
                      if (dayData.bookings > 0) {
                        bgColor = "bg-[#FDDB3C]/50";
                      } else {
                        bgColor = "bg-[#48BF56]";
                      }
                    } else if (dayData.status === "FULLY_BOOKED") {
                      bgColor = "bg-[#E32726]/50";
                    } else if (dayData.status === "CLOSED") {
                      bgColor = "bg-[#020D00]/50";
                    }
                  }

                  const isSelected = selectedDay === dayNum;
                  const border = isSelected
                    ? "border-2 border-[#020D00]"
                    : "border-2 border-transparent";

                  return (
                    <div
                      key={dayNum}
                      className={`p-3 rounded cursor-pointer ${bgColor} ${border} hover:border-2 hover:border-[#020D00]`}
                      onClick={() => handleDayClick(dayNum)}
                    >
                      <span className="font-bold">{dayNum}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side panel: legend + stats + status control */}
        <div className="col-span-5 lg:col-span-2 flex flex-col gap-5">
          {/* legend */}
          <div className="bg-white border rounded-lg">
            <div className="text-[#0A7A28] font-semibold text-center py-3 border-b">
              Availability Legend
            </div>
            <div className="grid grid-cols-4 items-center gap-3 m-auto py-5 px-3">
              <div className="bg-[#48BF56]/50 text-[#48BF56] rounded-xl flex items-center px-3 py-2 col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-1 h-full">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-xl mr-3"
                />
                <span className="font-semibold">Available</span>
              </div>
              <div className="bg-[#FDDB3C]/20 text-[#FDDB3C] py-2 px-3 rounded-xl flex items-center col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-1 h-full">
                <FontAwesomeIcon icon={faUser} className="text-xl mr-3" />
                <span className="font-semibold">Limited</span>
              </div>
              <div className="bg-[#E32726]/50 text-[#E32726] py-2 px-3 rounded-xl flex items-center col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-1 h-full">
                <FontAwesomeIcon
                  icon={faPeopleGroup}
                  className="text-xl mr-3"
                />
                <span className="font-semibold">Fully Booked</span>
              </div>
              <div className="bg-[#020D00]/50 text-[#020D00] py-2 px-3 rounded-xl flex items-center col-span-4 xs:col-span-2 md:col-span-1 lg:col-span-2 mx-1 h-full">
                <FontAwesomeIcon
                  icon={faBuildingCircleXmark}
                  className="text-xl mr-3"
                />
                <span className="font-semibold">Park Closed</span>
              </div>
            </div>
          </div>

          {/* Stats + status control */}
          <div
            className={`bg-white border rounded-lg transition-opacity duration-300 ${
              show ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-center gap-2 py-3 border-b">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="text-[#0A7A28]"
              />
              <span className="font-semibold text-[#0A7A28]">
                {displayLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 mb-5 mx-8 mt-4 items-center gap-y-2 text-sm">
              <span className="font-semibold">Expected Visitors:</span>
              <span className="text-center">{totalVisitors}</span>
              <span className="font-semibold">Total Bookings:</span>
              <span className="text-center">{totalBookings}</span>
            </div>

            {selectedDay && (
              <div className="border-t px-6 py-4 flex flex-col gap-2 text-sm">
                <span className="font-semibold mb-1">Day Status</span>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-gray-700 text-sm">
                    Current: <strong>{currentDayStatus}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">Set status to:</span>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={!selectedDay || updateStatusMutation.isPending}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="FULLY_BOOKED">FULLY_BOOKED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="w-full bg-[#0A7A28]/90 text-white border border-black rounded-lg py-2 px-3 hover:bg-[#0A7A28] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleSaveStatus}
                  disabled={!selectedDay || updateStatusMutation.isPending}
                >
                  <FontAwesomeIcon
                    icon={faCalendarCheck}
                    className="text-white"
                  />
                  <span>
                    {updateStatusMutation.isPending
                      ? "Saving status..."
                      : "Save day status"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowCalendar;
