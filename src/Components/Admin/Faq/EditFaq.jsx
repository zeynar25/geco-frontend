import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";

function EditFaq({ faq, onClose, isAdmin }) {
  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");

  const queryClient = useQueryClient();

  const updateFaqMutation = useMutation({
    mutationFn: async ({ faqId, data }) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/faq/${faqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating FAQ failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"], exact: false });
      alert("FAQ updated successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Updating FAQ failed");
    },
  });

  const disableFaqMutation = useMutation({
    mutationFn: async ({ faqId }) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/faq/${faqId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling FAQ failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"], exact: false });
      alert("FAQ disabled successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Disabling FAQ failed");
    },
  });

  const restoreFaqMutation = useMutation({
    mutationFn: async ({ faqId }) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/faq/admin/restore/${faqId}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring FAQ failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"], exact: false });
      alert("FAQ restored successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Restoring FAQ failed");
    },
  });

  const isBusy =
    updateFaqMutation.isPending ||
    disableFaqMutation.isPending ||
    restoreFaqMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!faq) return;

    const payload = {};

    const q = question.trim();
    const a = answer.trim();

    if (q && q !== faq.question) {
      payload.question = q;
    }
    if (a && a !== faq.answer) {
      payload.answer = a;
    }

    if (Object.keys(payload).length === 0) {
      onClose?.();
      return;
    }

    updateFaqMutation.mutate({ faqId: faq.faqId, data: payload });
  };

  const handleDisable = () => {
    if (!faq) return;
    if (!window.confirm("Disable this FAQ?")) return;
    disableFaqMutation.mutate({ faqId: faq.faqId });
  };

  const handleRestore = () => {
    if (!faq) return;
    if (!window.confirm("Restore this FAQ?")) return;
    restoreFaqMutation.mutate({ faqId: faq.faqId });
  };

  const isActive = (() => {
    if (!faq) return true;
    if (typeof faq.isActive === "boolean") return faq.isActive;
    if (typeof faq.active === "boolean") return faq.active;
    if (typeof faq.enabled === "boolean") return faq.enabled;
    return true;
  })();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Edit FAQ</h2>
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
            <label className="text-sm font-semibold">Question</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-20"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Answer</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-24"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isBusy}
            />
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
                {updateFaqMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFaq;
