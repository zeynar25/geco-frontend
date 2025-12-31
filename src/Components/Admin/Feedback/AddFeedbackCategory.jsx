import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function AddFeedbackCategory({ onClose }) {
  const [label, setLabel] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const addCategoryMutation = useMutation({
    mutationFn: async (payload) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/feedback-category`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Adding feedback category failed");
      }

      return response.json();
    },
    onSuccess: async () => {
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

      const msg = "Feedback category added successfully.";
      try {
        if (typeof window !== "undefined" && window.__showAlert) {
          await window.__showAlert(msg);
        } else {
          window.__nativeAlert?.(msg) || alert(msg);
        }
      } catch {
        try {
          window.__nativeAlert?.(msg) || alert(msg);
        } catch {
          /* empty */
        }
      }
      onClose?.();
    },
    onError: async (error) => {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (typeof window !== "undefined" && window.__showAlert) {
          try {
            await window.__showAlert(msg);
          } catch {
            window.__nativeAlert?.(msg) || alert(msg);
          }
        } else {
          window.__nativeAlert?.(msg) || alert(msg);
        }
        navigate("/signin");
        return;
      }
      const errMsg = error.message || "Adding feedback category failed";
      if (window.__showAlert) await window.__showAlert(errMsg);
      else window.__nativeAlert?.(errMsg) || alert(errMsg);
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = label.trim();
    if (!trimmed) {
      const msg = "Label is required.";
      if (typeof window !== "undefined" && window.__showAlert) {
        await window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
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
