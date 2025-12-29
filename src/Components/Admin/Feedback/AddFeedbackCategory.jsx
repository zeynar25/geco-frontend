import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function AddFeedbackCategory({ onClose }) {
  const [label, setLabel] = useState("");

  const queryClient = useQueryClient();

  const addCategoryMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/feedback-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Adding feedback category failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh category lists used in ShowFeedback
      queryClient.invalidateQueries({
        queryKey: ["FeedbackCategory"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["activeFeedbackCategory"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["inactiveFeedbackCategory"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });

      alert("Feedback category added successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Adding feedback category failed");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = label.trim();
    if (!trimmed) {
      alert("Label is required.");
      return;
    }

    addCategoryMutation.mutate({ label: trimmed });
  };

  const isBusy = addCategoryMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Add Feedback Category</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={isBusy}
          >
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Label</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isBusy}
              placeholder="Enter category label"
            />
            <span className="text-xs text-gray-500 mt-0.5">
              This will be shown to visitors when they select a feedback
              category.
            </span>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#227B05]/80 text-white text-sm hover:bg-[#227B05] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isBusy}
            >
              {isBusy ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFeedbackCategory;
