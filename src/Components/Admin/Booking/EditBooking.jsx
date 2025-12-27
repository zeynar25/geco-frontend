import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function EditBooking({ booking, onClose }) {
  const [editForm, setEditForm] = useState(() => ({
    bookingStatus: booking?.bookingStatus || "",
    paymentStatus: booking?.paymentStatus || "",
    paymentMethod: booking?.paymentMethod || "",
    staffReply: booking?.staffReply || "",
  }));

  const queryClient = useQueryClient();

  const bookingUpdateMutation = useMutation({
    mutationFn: async ({ bookingId, data }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/booking/staff/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating booking failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"], exact: false });
      onClose();
      alert("Booking updated successfully.");
    },
    onError: (error) => {
      alert(error.message || "Updating booking failed");
    },
  });

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!booking) return;

    const payload = {};

    if (
      editForm.bookingStatus &&
      editForm.bookingStatus !== booking.bookingStatus
    ) {
      payload.bookingStatus = editForm.bookingStatus;
    }
    if (
      editForm.paymentStatus &&
      editForm.paymentStatus !== booking.paymentStatus
    ) {
      payload.paymentStatus = editForm.paymentStatus;
    }
    if (
      editForm.paymentMethod &&
      editForm.paymentMethod !== booking.paymentMethod
    ) {
      payload.paymentMethod = editForm.paymentMethod;
    }
    const trimmedReply = editForm.staffReply.trim();
    const originalReply = booking.staffReply || "";
    if (trimmedReply.length > 0 && trimmedReply !== originalReply) {
      payload.staffReply = trimmedReply;
    }

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    bookingUpdateMutation.mutate({
      bookingId: booking.bookingId,
      data: payload,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Edit Booking</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={bookingUpdateMutation.isPending}
          >
            ✕
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Booking Status</label>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={editForm.bookingStatus}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  bookingStatus: e.target.value,
                }))
              }
            >
              <option value="PENDING">PENDING</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Payment Status</label>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={editForm.paymentStatus}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value,
                }))
              }
            >
              <option value="UNPAID">UNPAID</option>
              <option value="PAYMENT_VERIFICATION">PAYMENT_VERIFICATION</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Payment Method</label>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={editForm.paymentMethod}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
            >
              <option value="PARK">PARK</option>
              <option value="ONLINE">ONLINE</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Staff Reply</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-20"
              value={editForm.staffReply}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  staffReply: e.target.value,
                }))
              }
              placeholder="Add a note for the guest..."
            />
            <span className="text-xs text-gray-500">
              At least 5 characters if provided.
            </span>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100"
              onClick={onClose}
              disabled={bookingUpdateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#227B05]/80 text-white text-sm hover:bg-[#227B05] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={bookingUpdateMutation.isPending}
            >
              {bookingUpdateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBooking;
