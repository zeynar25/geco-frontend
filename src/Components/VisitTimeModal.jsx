import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function pad(n) {
  return String(n).padStart(2, "0");
}

function timeStrings(startHour, endHour, stepMinutes = 30) {
  const list = [];
  let date = new Date();
  date.setHours(startHour, 0, 0, 0);
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);
  while (date <= end) {
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    list.push(`${hh}:${mm}`);
    date = new Date(date.getTime() + stepMinutes * 60 * 1000);
  }
  return list;
}

export default function VisitTimeModal({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  allowedStartTimes = [],
}) {
  // compute date and weekday unconditionally so hooks can be called in same order
  const dateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
  const weekday = dateObj ? dateObj.getDay() : null; // 0 Sun .. 6 Sat

  // compute available times with a hook that always runs
  const times = useMemo(() => {
    if (!selectedDate) return [];
    if (weekday === 0 || weekday === 6) return [];
    const [startHour, endHour] = weekday === 5 ? [7, 16] : [7, 17];
    return timeStrings(startHour, endHour, 30);
  }, [selectedDate, weekday]);

  const normalizedAllowed = useMemo(() => {
    if (!allowedStartTimes || !allowedStartTimes.length) return null;
    const normalize = (t) => {
      if (!t) return null;
      const parts = t.trim().split(":");
      const hhRaw = parts[0] || "";
      const mmRaw = parts[1] || "00";
      const hh = hhRaw.trim().padStart(2, "0").slice(-2);
      const mm = mmRaw.trim().padStart(2, "0").slice(0, 2);
      if (!/^[0-9]{2}$/.test(hh) || !/^[0-9]{2}$/.test(mm)) return null;
      return `${hh}:${mm}`;
    };
    const arr = allowedStartTimes.map(normalize).filter(Boolean);
    return arr.length ? arr : null;
  }, [allowedStartTimes]);

  if (!isOpen) return null;

  // require selectedDate in YYYY-MM-DD
  if (!selectedDate) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-[90%] max-w-md p-6 text-center">
          <div className="flex justify-end">
            <button onClick={onClose} className="p-2" aria-label="Close">
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>
          <p className="mb-4">Please pick a visit date first.</p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#48BF56] text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  // if weekend, no times
  if (weekday === 0 || weekday === 6) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg w-[90%] max-w-md p-6 text-center">
          <div className="flex justify-end">
            <button onClick={onClose} className="p-2" aria-label="Close">
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>
          <p className="mb-4">
            Selected date falls on a weekend. Please choose another date.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#48BF56] text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[95%] max-w-3xl p-4">
        <header className="flex justify-between items-center mb-3">
          <div>
            <strong>
              {new Date(selectedDate).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
          </div>
          <div>
            <button
              onClick={onClose}
              className="px-3 py-1 border rounded hover:bg-red-100 hover:border-red-300 hover:text-red-600 transition-colors"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>
        </header>

        <p className="text-sm mb-3">
          Select a time (available slots shown).
          {normalizedAllowed && (
            <span className="block text-xs text-gray-500 mt-1">
              Package allowed times: {normalizedAllowed.join(", ")}
            </span>
          )}
        </p>

        <div className="grid grid-cols-4 gap-2">
          {times.map((t) => {
            const isAllowed =
              !normalizedAllowed || normalizedAllowed.includes(t);
            return (
              <button
                key={t}
                onClick={() => {
                  if (!isAllowed) return;
                  onSelect(t);
                  onClose();
                }}
                disabled={!isAllowed}
                className={`px-3 py-2 border rounded transition-colors ${
                  isAllowed
                    ? "hover:bg-[#f0fdf4]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
