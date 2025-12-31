import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faFilter,
  faMagnifyingGlass,
  faAngleLeft,
  faAngleRight,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

function ShowLog(props) {
  const [startDate, setStartDate] = useState(""); // yyyy-MM-dd
  const [endDate, setEndDate] = useState(""); // yyyy-MM-dd
  const [entityName, setEntityName] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const [logPage, setLogPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [show, setShow] = useState(true);

  const handlePrevLogPage = () => {
    setLogPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextLogPage = () => {
    setLogPage((prev) => prev + 1);
  };

  const triggerFade = () => {
    setShow(false);
    setTimeout(() => {
      setShow(true);
    }, 250);
  };

  const {
    data: logData,
    isPending: logsPending,
    error: logsError,
  } = useQuery({
    queryKey: [
      "auditLogs",
      logPage,
      {
        startDate,
        endDate,
        entityName,
        action,
      },
    ],
    enabled: props.canViewDashboard && props.logsIn,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (startDate) {
        params.append("start", `${startDate}T00:00:00`);
      }
      if (endDate) {
        params.append("end", `${endDate}T23:59:59`);
      }
      if (entityName && entityName !== "ALL") {
        params.append("entityName", entityName);
      }
      if (action && action !== "ALL") {
        params.append("action", action);
      }

      params.append("page", logPage.toString());
      params.append("size", "20");

      const endpoint = params.toString()
        ? `${API_BASE_URL}/dashboard/logs?${params.toString()}`
        : `${API_BASE_URL}/dashboard/logs`;

      ensureTokenValidOrAlert();
      const response = await safeFetch(endpoint);

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting audit logs failed");
      }

      return response.json();
    },
  });

  if (logsError) {
    (async () => {
      const msg = "something went wrong in retrieving audit logs";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    })();
  }

  const logs = Array.isArray(logData?.content)
    ? logData.content
    : Array.isArray(logData)
    ? logData
    : [];

  const totalLogPages =
    typeof logData?.totalPages === "number"
      ? logData.totalPages
      : logs.length > 0
      ? 1
      : 0;

  const totalLogCount =
    typeof logData?.totalElements === "number"
      ? logData.totalElements
      : logs.length;

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const formatJson = (value) => {
    if (!value) return "-";

    if (typeof value === "string") {
      // Strip possible JSON_ERROR prefix from backend
      const trimmed = value.trim();
      if (trimmed.startsWith("JSON_ERROR")) {
        return trimmed;
      }

      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <div className="flex gap-3 flex-wrap justify-between text-white bg-[#48BF56] p-4 font-bold text-2xl">
        <div className="text-2xl flex items-center">
          <FontAwesomeIcon icon={faClockRotateLeft} className="mr-3" />
          <span>System Logs &amp; Audit Trail</span>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-4">
        {/* Filters */}
        <form className="flex flex-wrap gap-3 items-end bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1 w-full">
            <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
            <span className="font-semibold text-sm">Filters</span>
          </div>

          <div className="flex flex-col text-xs md:text-sm">
            <label className="font-medium mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setLogPage(0);
                triggerFade();
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col text-xs md:text-sm">
            <label className="font-medium mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setLogPage(0);
                triggerFade();
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col flex-1 min-w-20 text-xs md:text-sm">
            <label className="font-medium mb-1">Entity name</label>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-gray-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <select
                value={entityName}
                onChange={(e) => {
                  setEntityName(e.target.value);
                  setLogPage(0);
                  triggerFade();
                }}
                className="border border-gray-300 rounded pl-7 pr-2 py-1 text-sm w-full appearance-none bg-white"
              >
                <option value="ALL">All entities</option>
                <option value="Account">Account</option>
                <option value="Attraction">Attraction</option>
                <option value="Booking">Booking</option>
                <option value="CalendarDate">CalendarDate</option>
                <option value="Faq">Faq</option>
                <option value="Feedback">Feedback</option>
                <option value="FeedbackCategory">FeedbackCategory</option>
                <option value="PackageInclusion">PackageInclusion</option>
                <option value="TourPackage">TourPackage</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col text-xs md:text-sm">
            <label className="font-medium mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setLogPage(0);
                triggerFade();
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[130px]"
            >
              <option value="ALL">All</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DISABLE">Disable</option>
              <option value="DELETE">Delete</option>
              <option value="RESTORE">Restore</option>
            </select>
          </div>
        </form>

        {/* Logs table / list */}
        <div
          className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-opacity duration-300 ${
            show ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {logsPending ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">
              No logs found for the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-between items-center text-sm text-gray-600 px-3 pt-3">
                <span>
                  Page {logPage + 1} of {Math.max(totalLogPages, 1)} ·
                  <span className="ml-1">{totalLogCount} log(s)</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePrevLogPage}
                    disabled={logPage === 0}
                  >
                    <FontAwesomeIcon icon={faAngleLeft} />
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNextLogPage}
                    disabled={
                      totalLogPages === 0 || logPage + 1 >= totalLogPages
                    }
                  >
                    <FontAwesomeIcon icon={faAngleRight} />
                  </button>
                </div>
              </div>

              <table className="min-w-full text-xs md:text-sm mt-2">
                <thead className="bg-gray-100 text-gray-700 border-b text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2 text-left">Timestamp</th>
                    <th className="px-3 py-2 text-left">Entity</th>
                    <th className="px-3 py-2 text-left">Entity ID</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Performed By</th>
                    <th className="px-3 py-2 text-left">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        {log.entityName || "-"}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        {log.entityId ?? "-"}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.7rem] font-semibold ${
                            log.action === "CREATE"
                              ? "bg-emerald-100 text-emerald-700"
                              : log.action === "UPDATE"
                              ? "bg-blue-100 text-blue-700"
                              : log.action === "DISABLE"
                              ? "bg-yellow-100 text-yellow-800"
                              : log.action === "DELETE"
                              ? "bg-red-100 text-red-700"
                              : log.action === "RESTORE"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.action || "-"}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-xs md:text-sm">
                            {log.performedByEmail || "-"}
                          </span>
                          <span className="text-[0.7rem] text-gray-500">
                            {log.performedByRole || ""}
                            {log.performedByAccountId
                              ? ` · #${log.performedByAccountId}`
                              : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2 py-1 border border-[#227B05] text-[#227B05] rounded text-[0.7rem] hover:bg-[#227B05]/5"
                          onClick={() => setSelectedLog(log)}
                        >
                          <FontAwesomeIcon icon={faCircleInfo} />
                          <span>What changed</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {selectedLog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-[#48BF56]/5">
              <div className="flex flex-col gap-0.5 text-sm">
                <span className="font-semibold flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="text-[#227B05]"
                  />
                  <span>Change details</span>
                </span>
                <span className="text-xs text-gray-600">
                  {selectedLog.entityName || "-"} · ID{" "}
                  {selectedLog.entityId ?? "-"}
                  {" · "}
                  {selectedLog.action || "-"} at{" "}
                  {formatDateTime(selectedLog.timestamp)}
                </span>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                onClick={() => setSelectedLog(null)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="border border-red-100 rounded-md p-3 bg-red-50/40 flex flex-col gap-2">
                <span className="font-semibold text-xs uppercase text-red-700">
                  Old Value
                </span>
                <pre className="whitespace-pre-wrap wrap-break-word text-[0.7rem] md:text-xs text-gray-800 max-h-60 overflow-auto bg-white rounded p-2 border border-red-100 font-mono">
                  {formatJson(selectedLog.oldValue)}
                </pre>
              </div>
              <div className="border border-emerald-100 rounded-md p-3 bg-emerald-50/40 flex flex-col gap-2">
                <span className="font-semibold text-xs uppercase text-emerald-700">
                  New Value
                </span>
                <pre className="whitespace-pre-wrap wrap-break-word text-[0.7rem] md:text-xs text-gray-800 max-h-60 overflow-auto bg-white rounded p-2 border border-emerald-100 font-mono">
                  {formatJson(selectedLog.newValue)}
                </pre>
              </div>
            </div>
            <div className="px-4 py-3 border-t flex justify-end bg-gray-50">
              <button
                type="button"
                className="px-4 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowLog;
