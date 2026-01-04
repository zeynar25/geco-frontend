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

        <p className="text-sm mb-3">Select a time (available slots shown).</p>

        <div className="grid grid-cols-4 gap-2">
          {times.map((t) => (
            <button
              key={t}
              onClick={() => {
                onSelect(t);
                onClose();
              }}
              className="px-3 py-2 border rounded hover:bg-[#f0fdf4]"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
