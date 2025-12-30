import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function AddFaq({ onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const queryClient = useQueryClient();

  const addFaqMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/faq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Adding FAQ failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"], exact: false });
      alert("FAQ added successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Adding FAQ failed");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const q = question.trim();
    const a = answer.trim();

    if (!q) {
      alert("Question is required.");
      return;
    }
    if (!a) {
      alert("Answer is required.");
      return;
    }

    addFaqMutation.mutate({ question: q, answer: a });
  };

  const isBusy = addFaqMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Add FAQ</h2>
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
              placeholder="Enter the FAQ question (at least 10 characters)"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Answer</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-24"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isBusy}
              placeholder="Enter the FAQ answer (at least 10 characters)"
            />
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

export default AddFaq;
