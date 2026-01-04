import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../apiConfig";

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDate(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export default function VisitDateModal({ isOpen, onClose, onSelect }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // normalize today and compute cutoff: dates up to (today + 2 days) are disabled
  const todayNormalized = new Date();
  todayNormalized.setHours(0, 0, 0, 0);
  const cutoffDate = new Date(todayNormalized);
  cutoffDate.setDate(cutoffDate.getDate() + 2);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { data: calendarData, isPending } = useQuery({
    queryKey: ["visit-date-modal-calendar", year, month],
    queryFn: async () => {
      const resp = await fetch(`${API_BASE_URL}/calendar/${year}/${month + 1}`);
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err?.error || "Getting park calendar failed");
      }
      return resp.json();
    },
  });

  if (!isOpen) return null;

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function isWeekend(day) {
    const d = new Date(year, month, day).getDay();
    return d === 0 || d === 6;
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[95%] max-w-3xl p-4">
        <header className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="px-2">
              ◀
            </button>
            <strong>
              {new Date(year, month).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </strong>
            <button onClick={nextMonth} className="px-2">
              ▶
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 border rounded hover:bg-red-100 hover:border-red-300 hover:text-red-600 transition-colors"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-7 text-center font-semibold mb-2 text-sm">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center mb-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-200 border" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-yellow-200 border" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-200 border" />
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-gray-200 border" />
            <span>Closed</span>
          </div>
        </div>

        {isPending ? (
          <div className="flex justify-center items-center py-6">
            Loading calendar...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-3"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayData = calendarData?.[dayNum];
              const weekend = isWeekend(dayNum);

              // date object for this cell (normalized)
              const dateObj = new Date(year, month, dayNum);
              dateObj.setHours(0, 0, 0, 0);

              // Treat weekends as CLOSED by default
              let effectiveStatus =
                dayData?.status ?? (weekend ? "CLOSED" : null);

              // Disable past dates and dates within two days from today
              if (dateObj.getTime() <= cutoffDate.getTime()) {
                effectiveStatus = "CLOSED";
              }

              // Disable CLOSED and FULLY_BOOKED
              const disabled =
                effectiveStatus === "CLOSED" ||
                effectiveStatus === "FULLY_BOOKED";

              let bg = "";
              if (effectiveStatus === "CLOSED") {
                bg = "bg-gray-200 text-gray-400";
              } else if (effectiveStatus === "FULLY_BOOKED") {
                bg = "bg-red-200 text-gray-500 opacity-60";
              } else if (dayData) {
                bg = dayData.bookings > 0 ? "bg-yellow-200" : "bg-green-200";
              }

              return (
                <div
                  key={dayNum}
                  className={`p-3 rounded cursor-pointer ${bg} ${
                    disabled ? "opacity-60 pointer-events-none" : "hover:ring-2"
                  }`}
                  onClick={() => {
                    if (disabled) return;
                    onSelect(formatDate(year, month, dayNum));
                  }}
                >
                  <span className="font-bold">{dayNum}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
