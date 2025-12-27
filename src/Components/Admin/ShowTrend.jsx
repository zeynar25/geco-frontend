import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartColumn, faChartPie } from "@fortawesome/free-solid-svg-icons";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function ShowTrend(props) {
  const [viewMode, setViewMode] = useState("MONTHLY");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const {
    data: graphMonthlyData,
    error: graphMonthlyError,
    isPending: graphMonthlyPending,
  } = useQuery({
    queryKey: ["graphTrendsMonthlyData", selectedYear],
    enabled:
      props.canViewDashboard &&
      props.trendsIn &&
      viewMode === "MONTHLY" &&
      !!selectedYear,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const stats = await fetch(
        `http://localhost:8080/dashboard/trends/monthly?year=${selectedYear}`,
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
    queryKey: ["graphTrendsYearlyData", yearFrom, yearTo],
    enabled:
      props.canViewDashboard &&
      props.trendsIn &&
      viewMode === "YEARLY" &&
      !!yearFrom &&
      !!yearTo,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const stats = await fetch(
        `http://localhost:8080/dashboard/trends/yearly?startYear=${yearFrom}&endYear=${yearTo}`,
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

  const PIE_COLORS = ["#7423E2", "#48BF56", "#F59E0B", "#EF4444"];
  const monthlyPackages = graphMonthlyData?.packages || [];
  const yearlyPackages = graphYearlyData?.packages || [];

  return (
    <>
      <div className="bg-white flex flex-wrap gap-5 justify-between items-center p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col">
          <span className="text-[#227B05] font-bold">Revenue View Options</span>
          <span>Choose how you want to view the statistical data</span>
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
        <div className="grid grid-cols-2 gap-5">
          {/* bookings chart */}
          <div className="col-span-2 lg:col-span-1 bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
              <FontAwesomeIcon icon={faChartColumn} className="mr-3 text-2xl" />
              {viewMode === "MONTHLY" && <span>{selectedYear} Bookings</span>}
              {viewMode === "YEARLY" && (
                <span>
                  {yearFrom} - {yearTo} Bookings
                </span>
              )}
            </div>

            {viewMode === "MONTHLY" &&
              (graphMonthlyPending ? (
                <div className="flex flex-col items-center justify-center gap-4 h-100">
                  <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">
                    Loading monthly booking statistics...
                  </p>
                </div>
              ) : (
                <div className="p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphMonthlyData.bookings || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7423E2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}

            {viewMode === "YEARLY" &&
              (graphYearlyPending ? (
                <div className="flex flex-col items-center justify-center gap-4 h-100">
                  <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">
                    Loading yearly booking statistics...
                  </p>
                </div>
              ) : (
                <div className="p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphYearlyData.bookings || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7423E2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
          </div>

          {/* visitors chart */}
          <div className="col-span-2 lg:col-span-1 bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
              <FontAwesomeIcon icon={faChartColumn} className="mr-3 text-2xl" />
              {viewMode === "MONTHLY" && <span>{selectedYear} Visitors</span>}
              {viewMode === "YEARLY" && (
                <span>
                  {yearFrom} - {yearTo} Visitors
                </span>
              )}
            </div>

            {viewMode === "MONTHLY" &&
              (graphMonthlyPending ? (
                <div className="flex flex-col items-center justify-center gap-4 h-100">
                  <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">
                    Loading monthly visitor statistics...
                  </p>
                </div>
              ) : (
                <div className="p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphMonthlyData.visitors || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7423E2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}

            {viewMode === "YEARLY" &&
              (graphYearlyPending ? (
                <div className="flex flex-col items-center justify-center gap-4 h-100">
                  <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">
                    Loading yearly visitor statistics...
                  </p>
                </div>
              ) : (
                <div className="p-4 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphYearlyData.visitors || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7423E2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
          </div>

          {/* availed packages chart */}
          <div className="col-span-2 bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
              <FontAwesomeIcon icon={faChartPie} className="mr-3 text-2xl" />
              {viewMode === "MONTHLY" && (
                <span>{selectedYear} Availed Packages</span>
              )}
              {viewMode === "YEARLY" && (
                <span>
                  {yearFrom} - {yearTo} Availed Packages
                </span>
              )}
            </div>

            {viewMode === "MONTHLY" &&
              (graphMonthlyPending ? (
                <div className="flex flex-col items-center justify-center gap-4 h-100">
                  <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">
                    Loading monthly availed packages statistics...
                  </p>
                </div>
              ) : (
                <div className="p-4 h-80 flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-1/2 h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Pie
                          data={monthlyPackages}
                          dataKey="value"
                          nameKey="period"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#7423E2"
                          label
                        >
                          {monthlyPackages.map((entry, index) => (
                            <Cell
                              key={`slice-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full lg:w-1/2 flex flex-col gap-3 justify-start max-h-64 overflow-auto pr-2">
                    {monthlyPackages.map((pkg, index) => (
                      <div
                        key={`legend-month-${index}`}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          <span className="font-medium text-sm">
                            {pkg.period}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {pkg.value} bookings
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {viewMode === "YEARLY" &&
              (graphYearlyPending ? (
                <div className="flex flex-col items-center justify-center gap-4 h-100">
                  <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600">
                    Loading monthly availed packages statistics...
                  </p>
                </div>
              ) : (
                <div className="p-4 h-80 flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-1/2 h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Pie
                          data={yearlyPackages}
                          dataKey="value"
                          nameKey="period"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#7423E2"
                          label
                        >
                          {yearlyPackages.map((entry, index) => (
                            <Cell
                              key={`slice-year-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full lg:w-1/2 flex flex-col gap-3 justify-start max-h-64 overflow-auto pr-2">
                    {yearlyPackages.map((pkg, index) => (
                      <div
                        key={`legend-year-${index}`}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          <span className="font-medium text-sm">
                            {pkg.period}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {pkg.value} bookings
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ShowTrend;
