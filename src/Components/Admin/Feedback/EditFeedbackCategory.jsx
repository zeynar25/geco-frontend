import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function EditFeedbackCategory({ feedbackCategory, onClose, isAdmin }) {
  const [label, setLabel] = useState(feedbackCategory?.label || "");

  const queryClient = useQueryClient();

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, label }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/feedback-category/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ label }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating feedback category failed");
      }

      return response.json();
    },
    onSuccess: () => {
      invalidateQueries();
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });
      alert("Feedback category updated successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Updating feedback category failed");
    },
  });

  const disableCategoryMutation = useMutation({
    mutationFn: async ({ id }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/feedback-category/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling feedback category failed");
      }
    },
    onSuccess: () => {
      invalidateQueries();
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });
      alert("Feedback category disabled successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Disabling feedback category failed");
    },
  });

  const restoreCategoryMutation = useMutation({
    mutationFn: async ({ id }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/feedback-category/admin/restore/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring feedback category failed");
      }
    },
    onSuccess: () => {
      invalidateQueries();
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });
      alert("Feedback category restored successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Restoring feedback category failed");
    },
  });

  const isBusy =
    updateCategoryMutation.isPending ||
    disableCategoryMutation.isPending ||
    restoreCategoryMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!feedbackCategory) return;

    const trimmed = label.trim();
    const original = feedbackCategory.label || "";

    if (!trimmed || trimmed === original) {
      onClose?.();
      return;
    }

    updateCategoryMutation.mutate({
      id: feedbackCategory.feedbackCategoryId,
      label: trimmed,
    });
  };

  const handleDisable = () => {
    if (!feedbackCategory) return;
    if (!window.confirm("Disable this feedback category?")) return;

    disableCategoryMutation.mutate({ id: feedbackCategory.feedbackCategoryId });
  };

  const handleRestore = () => {
    if (!feedbackCategory) return;
    if (!window.confirm("Restore this feedback category?")) return;

    restoreCategoryMutation.mutate({ id: feedbackCategory.feedbackCategoryId });
  };

  // Assume feedback has a boolean flag indicating active status.
  // Adjust this logic if your property name differs.
  const isActive =
    feedbackCategory?.active ??
    feedbackCategory?.enabled ??
    feedbackCategory?.status === "ACTIVE";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Edit Feedback Category</h2>
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
              placeholder="Enter feedback category label"
            />
            <span className="text-xs text-gray-500">
              Label is required and must not be blank.
            </span>
          </div>

          <div
            className={`flex items-center mt-4 ${
              isAdmin ? "justify-between" : "justify-end"
            }`}
          >
            {isAdmin && (
              <div className="flex gap-2">
                {isActive ? (
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-red-500 text-red-600 text-sm hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleDisable}
                    disabled={isBusy}
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-green-600 text-green-700 text-sm hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleRestore}
                    disabled={isBusy}
                  >
                    Restore
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2">
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
                {updateCategoryMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFeedbackCategory;
