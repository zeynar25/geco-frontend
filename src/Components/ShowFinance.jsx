import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartColumn,
  faChartLine,
  faCheck,
  faPesoSign,
} from "@fortawesome/free-solid-svg-icons";
import { faPeopleGroup } from "@fortawesome/free-solid-svg-icons/faPeopleGroup";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ShowFinance(props) {
  const [viewMode, setViewMode] = useState("MONTHLY");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const {
    data: financeData,
    error: financeError,
    isPending: financePending,
  } = useQuery({
    queryKey: ["financeStatistics"],
    enabled: props.canViewDashboard && props.financesIn,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const stats = await fetch("http://localhost:8080/dashboard/finances", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!stats.ok) {
        const error = await stats.json();
        throw new Error(error?.error || "Getting finance statistics failed");
      }
      return await stats.json();
    },
  });

  if (financeError) {
    alert("something went wrong in retrieving finance statistics");
  }

  const {
    data: graphMonthlyData,
    error: graphMonthlyError,
    isPending: graphMonthlyPending,
  } = useQuery({
    queryKey: ["graphFinanceMonthlyData", selectedYear],
    enabled:
      props.canViewDashboard &&
      props.financesIn &&
      viewMode === "MONTHLY" &&
      !!selectedYear,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const stats = await fetch(
        `http://localhost:8080/dashboard/finances/revenue/monthly?year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!stats.ok) {
        const error = await stats.json();
        throw new Error(error?.error || "Getting finance statistics failed");
      }
      return await stats.json();
    },
  });

  if (graphMonthlyError) {
    alert("something went wrong in retrieving monthly statistics");
  }

  const {
    data: graphYearlyData,
    error: graphYearlyError,
    isPending: graphYearlyPending,
  } = useQuery({
    queryKey: ["graphFinanceYearlyData", yearFrom, yearTo],
    enabled:
      props.canViewDashboard &&
      props.financesIn &&
      viewMode === "YEARLY" &&
      !!yearFrom &&
      !!yearTo,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const stats = await fetch(
        `http://localhost:8080/dashboard/finances/revenue/yearly?startYear=${yearFrom}&endYear=${yearTo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!stats.ok) {
        const error = await stats.json();
        throw new Error(error?.error || "Getting finance statistics failed");
      }
      return await stats.json();
    },
  });

  if (graphYearlyError) {
    alert("something went wrong in retrieving yearly statistics");
  }

  return (
    <>
      {financePending ? (
        <div className="flex flex-col items-center justify-center gap-4 h-100">
          <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading finance statistics...</p>
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-4 gap-5">
          <div className="col-span-4 md:col-span-2 lg:col-span-1 bg-white rounded-lg gap-2 flex items-center justify-between shadow-xl p-4">
            <div className="flex flex-col">
              <span>Total Revenue</span>
              <span className="font-semibold text-xl">
                <FontAwesomeIcon icon={faPesoSign} />
                {financeData?.totalRevenue}
              </span>
            </div>
            <FontAwesomeIcon icon={faPesoSign} className="mr-3 text-2xl" />
          </div>

          <div className="col-span-4 md:col-span-2 lg:col-span-1 bg-white rounded-lg gap-2 flex items-center justify-between  shadow-xl p-4">
            <div className="flex flex-col">
              <span>Average Revenue Per Booking</span>
              <span className="font-semibold text-xl">
                <FontAwesomeIcon icon={faPesoSign} />
                {financeData?.averageRevenuePerBooking}
              </span>
            </div>
            <FontAwesomeIcon icon={faChartLine} className="mr-3 text-2xl" />
          </div>

          <div className="col-span-4 md:col-span-2 lg:col-span-1 bg-white rounded-lg gap-2 flex items-center justify-between shadow-xl p-4">
            <div className="flex flex-col">
              <span>Total Bookings</span>
              <span className="font-semibold text-xl">
                {financeData?.totalBookings}
              </span>
            </div>
            <FontAwesomeIcon icon={faPeopleGroup} className="mr-3 text-2xl" />
          </div>

          <div className="col-span-4 md:col-span-2 lg:col-span-1 bg-white rounded-lg gap-2 flex items-center justify-between shadow-xl p-4">
            <div className="flex flex-col">
              <span>Completed Bookings</span>
              <span className="font-semibold text-xl">
                {financeData?.completedBookings}
              </span>
            </div>
            <FontAwesomeIcon icon={faCheck} className="mr-3 text-2xl" />
          </div>
        </div>
      )}

      <div className="bg-white flex flex-wrap gap-5 justify-between items-center p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col">
          <span className="text-[#227B05] font-bold">Revenue View Options</span>
          <span>Choose how you want to view the financial data</span>
        </div>
        <div>
          <div className="w-fit rounded-lg bg-gray-200 p-1 ring-2 ring-black/5 backdrop-blur">
            <button
              type="button"
              aria-pressed={viewMode === "YEARLY"}
              onClick={() => {
                setViewMode("YEARLY");
                setSelectedYear("");
              }}
              className={`btn-sweep relative overflow-hidden px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "YEARLY"
                  ? "bg-white/90 text-gray-900 shadow"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Yearly
            </button>

            <button
              type="button"
              aria-pressed={viewMode === "MONTHLY"}
              onClick={() => {
                setViewMode("MONTHLY");
                setYearFrom("");
                setYearTo("");
              }}
              className={`btn-sweep relative overflow-hidden px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "MONTHLY"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col flex-wrap gap-4">
        <div className="mt-2 text-sm text-gray-700">
          {viewMode === "YEARLY" ? (
            yearFrom && yearTo ? (
              <span>
                Showing financial statistics from{" "}
                <span className="font-semibold">{yearFrom}</span> to{" "}
                <span className="font-semibold">{yearTo}</span>
              </span>
            ) : (
              <span>Select a start and end year.</span>
            )
          ) : selectedYear ? (
            <span>
              Showing financial statistics for{" "}
              <span className="font-semibold">{selectedYear}</span>
            </span>
          ) : (
            <span>Select a year.</span>
          )}
        </div>
        {viewMode === "YEARLY" ? (
          <div className="flex gap-5 flex-wrap">
            <div className="flex flex-col">
              <label className="text-sm font-semibold" htmlFor="year-from">
                From year
              </label>
              <input
                id="year-from"
                type="number"
                min="2000"
                max="2100"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="mt-1 border border-gray-300 rounded px-2 py-1 w-28"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold" htmlFor="year-to">
                To year
              </label>
              <input
                id="year-to"
                type="number"
                min="2000"
                max="2100"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                className="mt-1 border border-gray-300 rounded px-2 py-1 w-28"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <label className="text-sm font-semibold" htmlFor="year-single">
              Year
            </label>
            <input
              id="year-single"
              type="number"
              min="2000"
              max="2100"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mt-1 border border-gray-300 rounded px-2 py-1 w-28"
            />
          </div>
        )}
      </div>

      {selectedYear || (yearFrom && yearTo) ? (
        <div className="bg-white rounded-lg overflow-hidden shadow-xl">
          <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
            <FontAwesomeIcon icon={faChartColumn} className="mr-3 text-2xl" />
            {viewMode === "MONTHLY" && <span>{selectedYear} Revenue</span>}
            {viewMode === "YEARLY" && (
              <span>
                {yearFrom} - {yearTo} Revenue
              </span>
            )}
          </div>

          {viewMode === "MONTHLY" &&
            (graphMonthlyPending ? (
              <div className="flex flex-col items-center justify-center gap-4 h-100">
                <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Loading monthly statistics...</p>
              </div>
            ) : (
              <div className="p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphMonthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FFEDB8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}

          {viewMode === "YEARLY" &&
            (graphYearlyPending ? (
              <div className="flex flex-col items-center justify-center gap-4 h-100">
                <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Loading yearly statistics...</p>
              </div>
            ) : (
              <div className="p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphYearlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#48BF56" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
        </div>
      ) : null}
    </>
  );
}

export default ShowFinance;
