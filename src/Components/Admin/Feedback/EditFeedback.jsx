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

function EditFeedback({ feedback, onClose }) {
  const isActive = (something) => {
    if (!something) return true;
    if (typeof something.active === "boolean") return something.active;
    if (typeof something.enabled === "boolean") return something.enabled;
    if (typeof something.status === "string")
      return something.status.toUpperCase() === "ACTIVE";
    return true;
  };

  const [editForm, setEditForm] = useState(() => ({
    staffReply: feedback?.staffReply || "",
    feedbackStatus: feedback?.feedbackStatus || "NEW",
  }));

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const invalidateFeedbackQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["Feedback"], exact: false });
    queryClient.invalidateQueries({
      queryKey: ["activeFeedback"],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: ["inactiveFeedback"],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: ["dashboardStatistics"],
      exact: false,
    });
  };

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ feedbackId, data }) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/feedback/staff/${feedbackId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating feedback failed");
      }

      return response.json();
    },
    onSuccess: async () => {
      invalidateFeedbackQueries();
      const msg = "Feedback updated successfully.";
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
        try {
          if (typeof window !== "undefined" && window.__showAlert) {
            await window.__showAlert(msg);
          } else if (typeof window !== "undefined" && window.__nativeAlert) {
            window.__nativeAlert(msg);
          } else {
            window.__nativeAlert?.(msg) || alert(msg);
          }
        } catch {
          try {
            (window.__nativeAlert || window.alert)(msg);
          } catch {
            /* empty */
          }
        }
        navigate("/signin");
        return;
      }

      const msg = error?.message || "Updating feedback failed";
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
    },
  });

  const disableFeedbackMutation = useMutation({
    mutationFn: async (feedbackId) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/feedback/${feedbackId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling feedback failed");
      }
    },
    onSuccess: async () => {
      invalidateFeedbackQueries();
      const msg = "Feedback disabled successfully.";
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
        try {
          if (typeof window !== "undefined" && window.__showAlert) {
            await window.__showAlert(msg);
          } else if (typeof window !== "undefined" && window.__nativeAlert) {
            window.__nativeAlert(msg);
          } else {
            window.__nativeAlert?.(msg) || alert(msg);
          }
        } catch {
          try {
            (window.__nativeAlert || window.alert)(msg);
          } catch {
            /* empty */
          }
        }
        navigate("/signin");
        return;
      }

      const msg = error?.message || "Disabling feedback failed";
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
    },
  });

  const restoreFeedbackMutation = useMutation({
    mutationFn: async (feedbackId) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/feedback/restore/${feedbackId}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring feedback failed");
      }
    },
    onSuccess: async () => {
      invalidateFeedbackQueries();
      const msg = "Feedback restored successfully.";
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
        try {
          if (typeof window !== "undefined" && window.__showAlert) {
            await window.__showAlert(msg);
          } else if (typeof window !== "undefined" && window.__nativeAlert) {
            window.__nativeAlert(msg);
          } else {
            window.__nativeAlert?.(msg) || alert(msg);
          }
        } catch {
          try {
            (window.__nativeAlert || window.alert)(msg);
          } catch {
            /* empty */
          }
        }
        navigate("/signin");
        return;
      }

      const msg = error?.message || "Restoring feedback failed";
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
    },
  });

  const isBusy =
    updateFeedbackMutation.isPending ||
    disableFeedbackMutation.isPending ||
    restoreFeedbackMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!feedback) return;

    const payload = {};

    const trimmedReply = editForm.staffReply.trim();
    const originalReply = feedback.staffReply || "";
    if (trimmedReply.length > 0 && trimmedReply !== originalReply) {
      if (trimmedReply.length < 5) {
        (async () => {
          const msg = "Reply must be at least 5 characters";
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
        })();
        return;
      }
      payload.staffReply = trimmedReply;
    }

    if (
      editForm.feedbackStatus &&
      editForm.feedbackStatus !== feedback.feedbackStatus
    ) {
      payload.feedbackStatus = editForm.feedbackStatus;
    }

    if (Object.keys(payload).length === 0) {
      onClose?.();
      return;
    }

    updateFeedbackMutation.mutate({
      feedbackId: feedback.feedbackId,
      data: payload,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Edit Feedback</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={updateFeedbackMutation.isPending}
          >
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Feedback Status</label>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={editForm.feedbackStatus}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  feedbackStatus: e.target.value,
                }))
              }
              disabled={isBusy}
            >
              <option value="NEW">NEW</option>
              <option value="VIEWED">VIEWED</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Admin Reply</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-24 text-sm"
              value={editForm.staffReply}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  staffReply: e.target.value,
                }))
              }
              placeholder="Write a reply to the guest..."
              disabled={isBusy}
            />
            <span className="text-xs text-gray-500">
              At least 5 characters if provided.
            </span>
          </div>

          <div className="flex justify-between items-center gap-2 mt-2">
            <div>
              {isActive(feedback) ? (
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-red-300 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() =>
                    disableFeedbackMutation.mutate(feedback.feedbackId)
                  }
                  disabled={isBusy}
                >
                  {disableFeedbackMutation.isPending
                    ? "Disabling..."
                    : "Disable"}
                </button>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-emerald-300 text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() =>
                    restoreFeedbackMutation.mutate(feedback.feedbackId)
                  }
                  disabled={isBusy}
                >
                  {restoreFeedbackMutation.isPending
                    ? "Restoring..."
                    : "Restore"}
                </button>
              )}
            </div>
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
                {updateFeedbackMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFeedback;
