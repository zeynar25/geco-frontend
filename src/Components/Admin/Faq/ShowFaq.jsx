import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faPlus,
  faEdit,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";

function ShowFaq(props) {
  const [faqFilter, setFaqFilter] = useState("ALL");
  const [isReordering, setIsReordering] = useState(false);
  const [localFaqs, setLocalFaqs] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: allFaqs,
    error: allError,
    isPending: allPending,
  } = useQuery({
    queryKey: ["faqs", "ALL"],
    enabled:
      (props.canViewDashboard ?? true) &&
      (props.faqsIn ?? true) &&
      faqFilter === "ALL",
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/faq`);
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting FAQs failed");
      }
      return await response.json();
    },
  });

  if (allError) {
    if (allError?.message === "TOKEN_EXPIRED") {
      (async () => {
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
      })();
    } else {
      const errMsg = "something went wrong in retrieving FAQs";
      (async () => {
        (async () => {
          if (window.__showAlert) await window.__showAlert(errMsg);
          else window.__nativeAlert?.(errMsg) || alert(errMsg);
        })();
      })();
    }
  }

  const {
    data: activeFaqs,
    error: activeError,
    isPending: activePending,
  } = useQuery({
    queryKey: ["faqs", "ACTIVE"],
    enabled:
      (props.canViewDashboard ?? true) &&
      (props.faqsIn ?? true) &&
      faqFilter === "ACTIVE",
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/faq/active`);
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting active FAQs failed");
      }
      return await response.json();
    },
  });

  if (activeError) {
    if (activeError?.message === "TOKEN_EXPIRED") {
      (async () => {
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
      })();
    } else {
      const errMsg = "something went wrong in retrieving active FAQs";
      (async () => {
        if (window.__showAlert) await window.__showAlert(errMsg);
        else window.__nativeAlert?.(errMsg) || alert(errMsg);
      })();
    }
  }

  const {
    data: inactiveFaqs,
    error: inactiveError,
    isPending: inactivePending,
  } = useQuery({
    queryKey: ["faqs", "INACTIVE"],
    enabled:
      (props.canViewDashboard ?? true) &&
      (props.faqsIn ?? true) &&
      faqFilter === "INACTIVE",
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/faq/inactive`);
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting inactive FAQs failed");
      }
      return await response.json();
    },
  });

  if (inactiveError) {
    if (inactiveError?.message === "TOKEN_EXPIRED") {
      (async () => {
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
      })();
    } else {
      const errMsg = "something went wrong in retrieving inactive FAQs";
      (async () => {
        if (window.__showAlert) await window.__showAlert(errMsg);
        else window.__nativeAlert?.(errMsg) || alert(errMsg);
      })();
    }
  }

  const isLoading =
    (faqFilter === "ALL" && allPending) ||
    (faqFilter === "ACTIVE" && activePending) ||
    (faqFilter === "INACTIVE" && inactivePending);

  const faqsToShow =
    faqFilter === "ALL"
      ? allFaqs || []
      : faqFilter === "ACTIVE"
      ? activeFaqs || []
      : inactiveFaqs || [];

  const handleToggleReorder = () => {
    setIsReordering((prev) => {
      const next = !prev;

      if (next && faqFilter === "ALL" && allFaqs) {
        setLocalFaqs(allFaqs);
      } else {
        setLocalFaqs(null);
      }

      return next;
    });
  };

  const isFaqActive = (faq) => {
    if (!faq) return true;
    if (typeof faq.isActive === "boolean") return faq.isActive;
    if (typeof faq.active === "boolean") return faq.active;
    if (typeof faq.enabled === "boolean") return faq.enabled;
    return true;
  };

  const displayedFaqs =
    isReordering && faqFilter === "ALL" && localFaqs ? localFaqs : faqsToShow;

  const handleMove = (index, direction) => {
    if (!localFaqs) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localFaqs.length) return;
    const updated = [...localFaqs];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setLocalFaqs(updated);
  };

  const reorderMutation = useMutation({
    mutationFn: async (orderList) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/faq/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderList),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Reordering FAQs failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Let React Query refetch ordered list
      queryClient.invalidateQueries({ queryKey: ["faqs"], exact: false });
      const successMsg = "FAQ order updated successfully.";
      if (window.__showAlert) {
        (async () => {
          await window.__showAlert(successMsg);
        })();
      } else {
        window.__nativeAlert?.(successMsg) || alert(successMsg);
      }
      setIsReordering(false);
      setLocalFaqs(null);
    },
    onError: async (error) => {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        try {
          if (typeof window !== "undefined" && window.__showAlert) {
            await window.__showAlert(msg);
          } else if (typeof window !== "undefined" && window.__nativeAlert) {
            window.__nativeAlert?.(msg) || alert(msg);
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
        navigate("/signin");
        return;
      }
      const errMsg = error.message || "Reordering FAQs failed";
      if (window.__showAlert) await window.__showAlert(errMsg);
      else window.__nativeAlert?.(errMsg) || alert(errMsg);
    },
  });

  const handleSaveOrder = () => {
    if (!localFaqs) {
      setIsReordering(false);
      return;
    }

    const orderList = localFaqs.map((faq, index) => ({
      faqId: faq.faqId,
      displayOrder: index + 1,
    }));

    reorderMutation.mutate(orderList);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl">
      <div className="text-white bg-[#48BF56] p-4 font-bold flex justify-between gap-2">
        <div className="text-2xl flex items-center">
          <FontAwesomeIcon icon={faQuestionCircle} className="mr-3" />
          <span>FAQ Management</span>
        </div>
        <button
          type="button"
          className="text-lg text-[#FDDB3C] bg-[#227B05] px-3 py-2 rounded-lg flex items-center hover:bg-[#227B05]/90"
          onClick={() => props.onAddFaq?.()}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-3" />
          <span>Add FAQ</span>
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <form className="flex justify-end flex-wrap gap-2">
          <div>
            <span className="font-semibold">FAQ Activity:</span>
            <select
              value={faqFilter}
              onChange={(e) => setFaqFilter(e.target.value)}
              className="ml-2 border border-[#227B05] rounded px-2 py-1 text-sm"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 rounded border border-[#227B05] text-[#227B05] text-xs font-medium hover:bg-[#227B05]/5 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={faqFilter !== "ALL" || isLoading}
              onClick={handleToggleReorder}
            >
              {isReordering ? "Cancel Reorder" : "Reorder"}
            </button>
            {isReordering && (
              <button
                type="button"
                className="px-3 py-1 rounded bg-[#227B05]/80 text-white text-xs font-medium hover:bg-[#227B05] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={reorderMutation.isPending}
                onClick={handleSaveOrder}
              >
                {reorderMutation.isPending ? "Saving..." : "Save Order"}
              </button>
            )}
          </div>
        </form>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 h-32">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading FAQs...</p>
          </div>
        ) : displayedFaqs && displayedFaqs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {displayedFaqs.map((faq, index) => {
              const active = isFaqActive(faq);

              return (
                <div
                  key={faq.faqId}
                  className={`col-span-2 xs:col-span-1 border rounded-lg p-3 flex flex-col gap-2 text-sm ${
                    active
                      ? "border-[#227B05] bg-white"
                      : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{faq.question}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{faq.answer}</p>
                    </div>
                    {isReordering ? (
                      <div className="flex flex-col gap-1 ml-2 text-xs">
                        <button
                          type="button"
                          className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                        >
                          <FontAwesomeIcon icon={faArrowUp} className="mr-1" />
                          Up
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === displayedFaqs.length - 1}
                        >
                          <FontAwesomeIcon
                            icon={faArrowDown}
                            className="mr-1"
                          />
                          Down
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-gray-600 hover:text-[#227B05] ml-2"
                        onClick={() => props.onEditFaq?.(faq)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 m-5">No FAQs found.</div>
        )}
      </div>
    </div>
  );
}

export default ShowFaq;
