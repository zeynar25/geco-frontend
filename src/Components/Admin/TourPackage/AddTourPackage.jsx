import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function AddTourPackage({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    minPerson: "",
    maxPerson: "",
    basePrice: "",
    pricePerPerson: "",
    notes: "",
    allowedStartTimes: "",
  });

  const [selectedInclusionIds, setSelectedInclusionIds] = useState([]);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: inclusionData,
    error: inclusionError,
    isPending: inclusionPending,
  } = useQuery({
    queryKey: ["package-inclusions", "active"],
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/package-inclusion/active`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error?.error || "Getting tour package inclusions failed"
        );
      }
      return await response.json();
    },
  });

  if (inclusionError) {
    (async () => {
      const msg = "something went wrong in retrieving tour package inclusions";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    })();
  }

  const addPackageMutation = useMutation({
    mutationFn: async (payload) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/package`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Adding tour package failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tourPackages"],
        exact: false,
      });
      (async () => {
        const msg = "Tour package added successfully.";
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
      })();
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
      const msg = error?.message || "Adding tour package failed";
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

  const handleInclusionToggle = (id) => {
    setSelectedInclusionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      const msg = "Name is required.";
      if (typeof window !== "undefined" && window.__showAlert) {
        window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
      return;
    }
    if (!form.description.trim()) {
      const msg = "Description is required.";
      if (typeof window !== "undefined" && window.__showAlert) {
        window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
      return;
    }
    if (!form.duration) {
      const msg = "Duration is required.";
      if (typeof window !== "undefined" && window.__showAlert) {
        window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
      return;
    }
    if (!form.minPerson || !form.maxPerson) {
      const msg = "Minimum and maximum persons are required.";
      if (typeof window !== "undefined" && window.__showAlert) {
        window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
      return;
    }
    if (!form.basePrice && !form.pricePerPerson) {
      const msg = "Provide at least base price or price per person.";
      if (typeof window !== "undefined" && window.__showAlert) {
        window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
      return;
    }
    if (selectedInclusionIds.length === 0) {
      const msg = "Please select at least one inclusion.";
      if (typeof window !== "undefined" && window.__showAlert) {
        window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
      return;
    }

    const notesTrimmed = form.notes.trim();

    const timesTrimmed = form.allowedStartTimes?.trim();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: Number(form.duration),
      minPerson: Number(form.minPerson),
      maxPerson: Number(form.maxPerson),
      basePrice: form.basePrice === "" ? 0 : Number(form.basePrice),
      pricePerPerson:
        form.pricePerPerson === "" ? 0 : Number(form.pricePerPerson),
      inclusionIds: selectedInclusionIds,
    };

    if (notesTrimmed) {
      payload.notes = notesTrimmed;
    }

    if (timesTrimmed) {
      payload.allowedStartTimes = timesTrimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    addPackageMutation.mutate(payload);
  };

  const isBusy = addPackageMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Add Tour Package</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Name</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1"
                value={form.name}
                onChange={handleChange("name")}
                disabled={isBusy}
                placeholder="Package name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="-1"
                className="border border-gray-300 rounded px-2 py-1"
                placeholder="-1 if it's to be decided on site"
                value={form.duration}
                onChange={handleChange("duration")}
                disabled={isBusy}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Minimum Persons</label>
              <input
                type="number"
                min="1"
                className="border border-gray-300 rounded px-2 py-1"
                value={form.minPerson}
                onChange={handleChange("minPerson")}
                disabled={isBusy}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Maximum Persons</label>
              <input
                type="number"
                min="1"
                className="border border-gray-300 rounded px-2 py-1"
                value={form.maxPerson}
                onChange={handleChange("maxPerson")}
                disabled={isBusy}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Base Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="border border-gray-300 rounded px-2 py-1"
                value={form.basePrice}
                onChange={handleChange("basePrice")}
                disabled={isBusy}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Price Per Person</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="border border-gray-300 rounded px-2 py-1"
                value={form.pricePerPerson}
                onChange={handleChange("pricePerPerson")}
                disabled={isBusy}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-20"
              value={form.description}
              onChange={handleChange("description")}
              disabled={isBusy}
              placeholder="Describe this tour package"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Notes</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-16"
              value={form.notes}
              onChange={handleChange("notes")}
              disabled={isBusy}
              placeholder="Optional notes (e.g., requirements, reminders)"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Allowed Start Times</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1"
              value={form.allowedStartTimes}
              onChange={handleChange("allowedStartTimes")}
              disabled={isBusy}
              placeholder="e.g. 08:00,13:00 (comma-separated)"
            />
            <span className="text-xs text-gray-500">
              Enter allowed start times for this package, comma-separated.
              Formats like HH:MM or HH:MM:SS are accepted.
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-semibold">
              Inclusions (select at least one)
            </label>
            {inclusionPending ? (
              <div className="text-sm text-gray-600">Loading inclusions...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border border-gray-200 rounded p-2 text-sm">
                {inclusionData?.map((inclusion) => {
                  const checked = selectedInclusionIds.includes(
                    inclusion.inclusionId
                  );
                  return (
                    <label
                      key={inclusion.inclusionId}
                      className="flex items-start gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() =>
                          handleInclusionToggle(inclusion.inclusionId)
                        }
                        disabled={isBusy}
                      />
                      <span>
                        <span className="font-semibold">
                          {inclusion.inclusionName}
                        </span>{" "}
                        <span className="text-xs text-gray-600">
                          (+{inclusion.inclusionPricePerPerson} per person)
                        </span>
                        {inclusion.inclusionDescription && (
                          <span className="block text-xs text-gray-600">
                            {inclusion.inclusionDescription}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
                {!inclusionData?.length && (
                  <span className="text-xs text-gray-500">
                    No active inclusions available.
                  </span>
                )}
              </div>
            )}
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

export default AddTourPackage;
