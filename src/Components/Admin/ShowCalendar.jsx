import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [selectedBookingLimitDraft, setSelectedBookingLimitDraft] =
    useState("");
  const [isEditingSelectedBookingLimit, setIsEditingSelectedBookingLimit] =
    useState(false);
  const [globalBookingLimit, setGlobalBookingLimit] = useState("");
  const [isEditingGlobalBookingLimit, setIsEditingGlobalBookingLimit] =
    useState(false);
  const [show, setShow] = useState(true);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
        `${API_BASE_URL}/calendar/${year}/${month + 1}`,
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting park calendar failed");
      }
      return response.json();
    },
  });

  const {
    data: bookingLimitRestriction,
    isPending: bookingLimitRestrictionPending,
    error: bookingLimitRestrictionError,
  } = useQuery({
    queryKey: ["restriction", "name", "booking_limit"],
    enabled: props.canViewDashboard && props.calendarIn,
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/restriction/name/${encodeURIComponent("booking_limit")}`,
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(
          error?.error || "Getting booking limit restriction failed",
        );
      }
      return response.json();
    },
  });

  const globalBookingLimitDisplayValue = isEditingGlobalBookingLimit
    ? globalBookingLimit
    : bookingLimitRestriction?.value != null
      ? String(bookingLimitRestriction.value)
      : "";

  const globalBookingLimitValue =
    bookingLimitRestriction?.value != null
      ? bookingLimitRestriction.value
      : null;

  useEffect(() => {
    if (!calendarError) return;
    const handle = async () => {
      const msg = "Your session has expired. Please sign in again.";
      if (calendarError?.message === "TOKEN_EXPIRED") {
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }
      const errorMsg = "something went wrong in retrieving park calendar";
      if (window.__showAlert) await window.__showAlert(errorMsg);
      else window.__nativeAlert?.(errorMsg) || alert(errorMsg);
    };
    handle();
  }, [calendarError, navigate]);

  // Determine stats: for selected day or whole month
  let displayLabel;
  let totalBookings;
  let totalVisitors;
  let currentDayStatus = "AVAILABLE";

  const selectedDayData = selectedDay ? calendarData?.[selectedDay] : null;
  const selectedDayBookingLimitOverride = selectedDayData?.bookingLimit ?? null;

  if (selectedDay && selectedDayData) {
    displayLabel = new Date(year, month, selectedDay).toLocaleString(
      "default",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    );

    totalBookings = selectedDayData.bookings || 0;
    totalVisitors = selectedDayData.visitors || 0;
    currentDayStatus = selectedDayData.status || "AVAILABLE";
  } else {
    displayLabel = currentDate;
    totalBookings = Object.values(calendarData || {}).reduce(
      (sum, day) => sum + (day.bookings || 0),
      0,
    );
    totalVisitors = Object.values(calendarData || {}).reduce(
      (sum, day) => sum + (day.visitors || 0),
      0,
    );
  }

  const isSelectedDayInheritingGlobalBookingLimit =
    !!selectedDay && selectedDayBookingLimitOverride == null;

  const selectedBookingLimitDisplayValue = isEditingSelectedBookingLimit
    ? selectedBookingLimitDraft
    : selectedDayBookingLimitOverride != null
      ? String(selectedDayBookingLimitOverride)
      : globalBookingLimitValue != null
        ? String(globalBookingLimitValue)
        : "";

  const isDayStatusUnchanged =
    !!selectedDay && String(selectedStatus) === String(currentDayStatus);

  // Disable per-date booking limit save only when the date has an explicit bookingLimit
  // and the input matches it. If bookingLimit is null (inheriting global), keep save enabled.
  const isSelectedDateBookingLimitUnchanged = (() => {
    if (!selectedDay) return true;
    if (selectedDayBookingLimitOverride == null) return false;
    const parsed = Number.parseInt(
      String(selectedBookingLimitDisplayValue).trim(),
      10,
    );
    return (
      Number.isFinite(parsed) &&
      parsed === Number(selectedDayBookingLimitOverride)
    );
  })();

  // Keep selectedStatus in sync when day changes
  const handleDayClick = (dayNum) => {
    setShow(false);

    if (selectedDay === dayNum) {
      setTimeout(() => {
        setSelectedDay(null);
        setSelectedStatus("AVAILABLE");
        setSelectedBookingLimitDraft("");
        setIsEditingSelectedBookingLimit(false);
        setGlobalBookingLimit("");
        setIsEditingGlobalBookingLimit(false);
        setShow(true);
      }, 250);
      return;
    }

    setTimeout(() => {
      setSelectedDay(dayNum);

      // Switching to a day hides global controls; cancel any in-progress global edit.
      setGlobalBookingLimit("");
      setIsEditingGlobalBookingLimit(false);
      setSelectedBookingLimitDraft("");
      setIsEditingSelectedBookingLimit(false);

      const dayData = calendarData?.[dayNum];
      if (dayData && dayData.status) {
        setSelectedStatus(dayData.status);
      } else {
        setSelectedStatus("AVAILABLE");
      }
      setShow(true);
    }, 250);
  };

  const startEditingSelectedDateBookingLimit = async () => {
    if (!selectedDay) return;

    // Prefill draft with what's currently displayed (override or global fallback)
    setSelectedBookingLimitDraft(
      String(selectedBookingLimitDisplayValue || ""),
    );
    setIsEditingSelectedBookingLimit(true);
  };

  const cancelEditingSelectedDateBookingLimit = () => {
    setSelectedBookingLimitDraft("");
    setIsEditingSelectedBookingLimit(false);
  };

  const updateBookingLimitRestrictionMutation = useMutation({
    mutationFn: async ({ id, value }) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/restriction/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating booking limit failed");
      }

      return response.json();
    },
    onSuccess: async (updatedRestriction) => {
      // Keep restriction query data in sync so the UI updates immediately.
      if (updatedRestriction) {
        queryClient.setQueryData(
          ["restriction", "name", "booking_limit"],
          updatedRestriction,
        );
      }

      // Clear any draft so the input reflects the latest saved value.
      setGlobalBookingLimit("");
      setIsEditingGlobalBookingLimit(false);

      queryClient.invalidateQueries({
        queryKey: ["calendar"],
        exact: false,
      });
      const successMsg = "Booking limit updated successfully.";
      if (typeof window !== "undefined" && window.__showAlert) {
        await window.__showAlert(successMsg);
      } else {
        window.__nativeAlert?.(successMsg) || alert(successMsg);
      }
    },
    onError: async (error) => {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }
      const msg = error.message || "Updating booking limit failed";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

  const startEditingGlobalBookingLimit = async () => {
    if (bookingLimitRestrictionPending || bookingLimitRestrictionError) return;
    if (!bookingLimitRestriction?.id) {
      const msg =
        "BOOKING_LIMIT restriction not loaded yet. Please refresh and try again.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    if (bookingLimitRestriction?.value != null) {
      setGlobalBookingLimit(String(bookingLimitRestriction.value));
    } else {
      setGlobalBookingLimit("");
    }
    setIsEditingGlobalBookingLimit(true);
  };

  const cancelEditingGlobalBookingLimit = () => {
    setGlobalBookingLimit("");
    setIsEditingGlobalBookingLimit(false);
  };

  const updateSingleDateBookingLimitMutation = useMutation({
    mutationFn: async ({ date, dateStatus, bookingLimit }) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/calendar-date`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, dateStatus, bookingLimit }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating date booking limit failed");
      }

      return response.json();
    },
    onSuccess: async () => {
      setSelectedBookingLimitDraft("");
      setIsEditingSelectedBookingLimit(false);
      queryClient.invalidateQueries({
        queryKey: ["calendar"],
        exact: false,
      });
      const successMsg = "Date booking limit updated successfully.";
      if (typeof window !== "undefined" && window.__showAlert) {
        await window.__showAlert(successMsg);
      } else {
        window.__nativeAlert?.(successMsg) || alert(successMsg);
      }
    },
    onError: async (error) => {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }
      const msg = error.message || "Updating date booking limit failed";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

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
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["calendar"],
        exact: false,
      });
      const successMsg = "Date status updated successfully.";
      if (typeof window !== "undefined" && window.__showAlert) {
        await window.__showAlert(successMsg);
      } else {
        window.__nativeAlert?.(successMsg) || alert(successMsg);
      }
    },
    onError: async (error) => {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        try {
          if (typeof window !== "undefined" && window.__showAlert) {
            await window.__showAlert(msg);
          } else if (typeof window !== "undefined" && window.__nativeAlert) {
            window.__nativeAlert(msg);
          } else {
            window.__nativeAlert?.(msg) || alert(msg);
          }
        } catch {
          try {
            (window.__nativeAlert || window.alert)(msg);
          } catch {
            /* empty */
          }
        }
        navigate("/signin");
        return;
      }
      const msg = error.message || "Updating date status failed";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

  const handleSaveStatus = async () => {
    if (!selectedDay) {
      const msg = "Please select a day to update its status.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      selectedDay,
    ).padStart(2, "0")}`;

    updateStatusMutation.mutate({ date: dateString, status: selectedStatus });
  };

  const handleSaveGlobalBookingLimit = async () => {
    const restrictionId = bookingLimitRestriction?.id;
    if (restrictionId == null) {
      const msg =
        "BOOKING_LIMIT restriction not loaded yet. Please refresh and try again.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    const valueNum = Number.parseInt(
      String(globalBookingLimitDisplayValue).trim(),
      10,
    );
    if (!Number.isFinite(valueNum) || valueNum < 0) {
      const msg = "Please enter a valid booking limit (0 or greater).";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    if (bookingLimitRestriction?.value != null) {
      const current = Number.parseInt(
        String(bookingLimitRestriction.value),
        10,
      );
      if (Number.isFinite(current) && current === valueNum) {
        const msg = "No changes detected.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        return;
      }
    }

    updateBookingLimitRestrictionMutation.mutate({
      id: restrictionId,
      value: valueNum,
    });
  };

  const handleSaveSelectedDateBookingLimit = async () => {
    if (!selectedDay) {
      const msg = "Please select a day to update its booking limit.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    const valueNum = Number.parseInt(
      String(selectedBookingLimitDisplayValue).trim(),
      10,
    );
    if (!Number.isFinite(valueNum) || valueNum < 0) {
      const msg = "Please enter a valid booking limit (0 or greater).";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      selectedDay,
    ).padStart(2, "0")}`;

    // Preserve status by default when only changing booking limit.
    const dayData = calendarData?.[selectedDay];
    const dateStatus = dayData?.status || "AVAILABLE";

    updateSingleDateBookingLimitMutation.mutate({
      date: dateString,
      dateStatus,
      bookingLimit: valueNum,
    });
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
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-gray-700 text-sm">
                    Day Status: <strong>{currentDayStatus}</strong>
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
                  disabled={
                    !selectedDay ||
                    updateStatusMutation.isPending ||
                    isDayStatusUnchanged
                  }
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

                <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                  <span className="font-semibold">
                    Booking Limit (Selected Date)
                  </span>
                  {isSelectedDayInheritingGlobalBookingLimit && (
                    <div className="text-xs text-gray-600">
                      No per-date booking limit set (using global).
                    </div>
                  )}
                  <input
                    className="border border-gray-300 rounded px-2 py-2"
                    value={selectedBookingLimitDisplayValue}
                    onChange={(e) =>
                      setSelectedBookingLimitDraft(e.target.value)
                    }
                    placeholder="e.g. 200"
                    inputMode="numeric"
                    disabled={
                      updateSingleDateBookingLimitMutation.isPending ||
                      !isEditingSelectedBookingLimit
                    }
                  />

                  {!isEditingSelectedBookingLimit ? (
                    <button
                      type="button"
                      className="w-full bg-[#0A7A28]/90 text-white border border-black rounded-lg py-2 px-3 hover:bg-[#0A7A28] disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={startEditingSelectedDateBookingLimit}
                      disabled={
                        !selectedDay ||
                        updateSingleDateBookingLimitMutation.isPending
                      }
                    >
                      Update booking limit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 bg-[#0A7A28]/90 text-white border border-black rounded-lg py-2 px-3 hover:bg-[#0A7A28] disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={handleSaveSelectedDateBookingLimit}
                        disabled={
                          updateSingleDateBookingLimitMutation.isPending ||
                          isSelectedDateBookingLimitUnchanged
                        }
                      >
                        {updateSingleDateBookingLimitMutation.isPending
                          ? "Saving..."
                          : "Save"}
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-white text-[#0A7A28] border border-black rounded-lg py-2 px-3 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={cancelEditingSelectedDateBookingLimit}
                        disabled={
                          updateSingleDateBookingLimitMutation.isPending
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* booking limit controls (only when no day is selected) */}
          {!selectedDay && (
            <div className="bg-white border rounded-lg">
              <div className="text-[#0A7A28] font-semibold text-center py-3 border-b">
                Global Booking Limit
              </div>
              <div className="px-4 py-4 text-sm flex flex-col gap-3">
                {bookingLimitRestrictionPending ? (
                  <div className="text-xs text-gray-600">
                    Loading BOOKING_LIMIT restriction...
                  </div>
                ) : bookingLimitRestrictionError ? (
                  <div className="text-xs text-red-700">
                    Failed to auto-load BOOKING_LIMIT restriction. Global
                    booking limit update is unavailable.
                  </div>
                ) : null}

                <div className="flex flex-col gap-1">
                  <input
                    className="border border-gray-300 rounded px-2 py-2"
                    value={globalBookingLimitDisplayValue}
                    onChange={(e) => setGlobalBookingLimit(e.target.value)}
                    placeholder="e.g. 250"
                    inputMode="numeric"
                    disabled={!isEditingGlobalBookingLimit}
                  />
                </div>

                {!isEditingGlobalBookingLimit ? (
                  <button
                    type="button"
                    className="w-full bg-[#0A7A28]/90 text-white border border-black rounded-lg py-2 px-3 hover:bg-[#0A7A28] disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={startEditingGlobalBookingLimit}
                    disabled={
                      bookingLimitRestrictionPending ||
                      bookingLimitRestrictionError ||
                      !bookingLimitRestriction?.id
                    }
                  >
                    Update Global Booking Limit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 bg-[#0A7A28]/90 text-white border border-black rounded-lg py-2 px-3 hover:bg-[#0A7A28] disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={handleSaveGlobalBookingLimit}
                      disabled={updateBookingLimitRestrictionMutation.isPending}
                    >
                      {updateBookingLimitRestrictionMutation.isPending
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-white text-[#0A7A28] border border-black rounded-lg py-2 px-3 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={cancelEditingGlobalBookingLimit}
                      disabled={updateBookingLimitRestrictionMutation.isPending}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowCalendar;
