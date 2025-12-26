import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPesoSign } from "@fortawesome/free-solid-svg-icons";

function ShowFinance(props) {
  const [viewMode, setViewMode] = useState("YEARLY");

  const {
    data: financeData,
    error: financeError,
    isPending: financePending,
  } = useQuery({
    queryKey: ["financeStatistics"],
    enabled: props.canViewAdmin,
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

  return (
    <>
      <div className="bg-white flex justify-between items-center p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col">
          <span className="text-[#227B05] font-bold">Revenue View Options</span>
          <span>Choose how you want to view the financial data</span>
        </div>
        <div className="w-fit rounded-lg bg-white/70 p-1 ring-2 ring-black/5 backdrop-blur">
          <button
            type="button"
            aria-pressed={viewMode === "YEARLY"}
            onClick={() => setViewMode("YEARLY")}
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
            onClick={() => setViewMode("MONTHLY")}
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
      <div>
        <div>{financeData?.totalRevenue}</div>
        <div>{financeData?.averageRevenuePerBooking}</div>
        <div>{financeData?.totalBookings}</div>
        <div>{financeData?.completedBookings}</div>
      </div>
      <div className="bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
          <FontAwesomeIcon icon={faPesoSign} className="mr-3 text-2xl" />
          <span>Monthly Revenue Trend</span>
        </div>
        <div></div>
      </div>
    </>
  );
}

export default ShowFinance;
