import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faFilter,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

function ShowLog(props) {
  const [startDate, setStartDate] = useState(""); // yyyy-MM-dd
  const [endDate, setEndDate] = useState(""); // yyyy-MM-dd
  const [entityName, setEntityName] = useState("");
  const [action, setAction] = useState("ALL");

  const {
    data: logData,
    isPending: logsPending,
    error: logsError,
  } = useQuery({
    queryKey: [
      "auditLogs",
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
      if (entityName.trim()) {
        params.append("entityName", entityName.trim());
      }
      if (action && action !== "ALL") {
        params.append("action", action);
      }

      const endpoint = params.toString()
        ? `http://localhost:8080/dashboard/logs?${params.toString()}`
        : "http://localhost:8080/dashboard/logs";

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting audit logs failed");
      }

      return response.json();
    },
  });

  if (logsError) {
    alert("something went wrong in retrieving audit logs");
  }

  const logs = Array.isArray(logData)
    ? [...logData].sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
    : [];

  const truncate = (text, max = 80) => {
    if (!text) return "-";
    if (text.length <= max) return text;
    return text.slice(0, max) + "...";
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
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
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col text-xs md:text-sm">
            <label className="font-medium mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col flex-1 min-w-40 text-xs md:text-sm">
            <label className="font-medium mb-1">Entity name</label>
            <div className="relative">
              <span className="absolute left-2 top-1.5 text-gray-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="e.g. Account, TourPackage, Faq"
                className="border border-gray-300 rounded px-7 py-1 text-sm w-full"
              />
            </div>
          </div>

          <div className="flex flex-col text-xs md:text-sm">
            <label className="font-medium mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-gray-100 text-gray-700 border-b text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2 text-left">Timestamp</th>
                    <th className="px-3 py-2 text-left">Entity</th>
                    <th className="px-3 py-2 text-left">Entity ID</th>
                    <th className="px-3 py-2 text-left">Action</th>
                    <th className="px-3 py-2 text-left">Performed By</th>
                    <th className="px-3 py-2 text-left">Old Value</th>
                    <th className="px-3 py-2 text-left">New Value</th>
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
                      <td className="px-3 py-2 align-top max-w-xs">
                        <span className="wrap-break-word">
                          {truncate(log.oldValue)}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top max-w-xs">
                        <span className="wrap-break-word">
                          {truncate(log.newValue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowLog;
