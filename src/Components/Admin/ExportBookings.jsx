import { useState } from "react";

import ExcelJS from "exceljs";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFileExcel } from "@fortawesome/free-solid-svg-icons";

import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../apiConfig";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatDateOnly(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString();
}

function ExportBookings() {
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [dateField, setDateField] = useState("createdAt");
  const [isExporting, setIsExporting] = useState(false);

  const navigate = useNavigate();

  const buildQueryParams = (page) => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", "100");

    if (bookingFilter !== "ALL") {
      params.append("bookingStatus", bookingFilter.toUpperCase());
    }
    if (paymentFilter !== "ALL") {
      params.append("paymentStatus", paymentFilter.toUpperCase());
    }
    if (paymentMethodFilter !== "ALL") {
      params.append("paymentMethod", paymentMethodFilter.toUpperCase());
    }
    if (startDateFilter) {
      params.append("startDate", startDateFilter);
    }
    if (endDateFilter) {
      params.append("endDate", endDateFilter);
    }
    if (dateField) {
      params.append("dateField", dateField);
    }

    return params.toString();
  };

  const fetchAllBookings = async () => {
    const firstResponse = await safeFetch(
      `${API_BASE_URL}/booking?${buildQueryParams(0)}`,
    );

    if (!firstResponse.ok) {
      const error = await firstResponse.json().catch(() => null);
      throw new Error(error?.error || "Getting bookings failed");
    }

    const firstPage = await firstResponse.json();
    const totalPages = firstPage?.totalPages ?? 1;
    const bookings = Array.isArray(firstPage?.content)
      ? [...firstPage.content]
      : [];

    for (let page = 1; page < totalPages; page += 1) {
      const response = await safeFetch(
        `${API_BASE_URL}/booking?${buildQueryParams(page)}`,
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting bookings failed");
      }

      const pageData = await response.json();
      if (Array.isArray(pageData?.content)) {
        bookings.push(...pageData.content);
      }
    }

    return bookings;
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      ensureTokenValidOrAlert();
      const bookings = await fetchAllBookings();

      if (!bookings.length) {
        const msg = "No bookings found for the selected filters.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        return;
      }

      const rows = bookings.map((booking) => ({
        "Booking ID": booking.bookingId ?? "",
        "First Name": booking.account?.detail?.firstName ?? "",
        Surname: booking.account?.detail?.surname ?? "",
        Email: booking.account?.detail?.email ?? "",
        "Contact Number": booking.account?.detail?.contactNumber ?? "",
        "Booking Status": booking.bookingStatus ?? "",
        "Payment Status": booking.paymentStatus ?? "",
        "Payment Method": booking.paymentMethod ?? "",
        "Visit Date": formatDateOnly(booking.visitDate),
        "Booked At": formatDate(booking.createdAt),
        "Visit Time": booking.visitTime ?? "",
        "Group Size": booking.groupSize ?? "",
        Package: booking.tourPackage?.name ?? "",
        "Total Fee": booking.totalPrice ?? "",
        "Down Payment":
          booking.paymentMethod === "ONLINE" ? booking.totalPrice / 2 : "",
        "Staff Reply": booking.staffReply ?? "",
        "Proof of Payment": booking.proofOfPaymentPhoto ?? "",
      }));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Bookings");

      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: Math.max(header.length + 4, 16),
      }));

      rows.forEach((row) => {
        worksheet.addRow(row);
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      worksheet.getRow(1).height = 24;
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      const timestamp = new Date().toISOString().slice(0, 10);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `bookings-export-${timestamp}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Booking export failed", error);
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        navigate("/signin");
        return;
      }

      const msg = "Failed to export bookings to Excel.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <div className="text-white bg-[#48BF56] p-4 font-bold text-2xl">
        <FontAwesomeIcon icon={faFileExcel} className="mr-3 text-2xl" />
        <span>Export Bookings</span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className="rounded-lg border border-[#227B05]/20 bg-[#F4FBF3] p-4 text-sm text-gray-700">
          Export the currently filtered bookings as an Excel file. The export
          will include all matching pages, not just the visible page.
        </div>

        <form className="flex flex-wrap items-end gap-4 text-sm">
          <div className="flex flex-col min-w-[150px]">
            <span className="text-xs font-semibold text-gray-600 mb-1">
              Booking Status
            </span>
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="border border-[#227B05] rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex flex-col min-w-40">
            <span className="text-xs font-semibold text-gray-600 mb-1">
              Payment Status
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-[#227B05] rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
            >
              <option value="ALL">All</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAYMENT_VERIFICATION">Payment Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="flex flex-col min-w-[150px]">
            <span className="text-xs font-semibold text-gray-600 mb-1">
              Payment Method
            </span>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="border border-[#227B05] rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
            >
              <option value="ALL">All</option>
              <option value="PARK">On-park</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          <div className="flex flex-col min-w-[150px]">
            <span className="text-xs font-semibold text-gray-600 mb-1">
              Date Field
            </span>
            <select
              value={dateField}
              onChange={(e) => setDateField(e.target.value)}
              className="border border-[#227B05] rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
            >
              <option value="createdAt">Booked on</option>
              <option value="visitDate">Visit on</option>
            </select>
          </div>

          <div className="flex flex-col min-w-[220px]">
            <span className="text-xs font-semibold text-gray-600 mb-1">
              Visit Date Range
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="border border-[#227B05] rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="border border-[#227B05] rounded-md px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#227B05] bg-white"
              />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between flex-wrap gap-4 border-t border-gray-100 pt-4">
          <div className="text-sm text-gray-600">
            Use the filters above, then download the matching bookings as an
            Excel file.
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#227B05] px-4 py-2 font-semibold text-white shadow hover:bg-[#185203] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FontAwesomeIcon icon={faDownload} />
            {isExporting ? "Exporting..." : "Download Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportBookings;
