import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function EditTourPackage({ package: pkg, onClose, isAdmin }) {
  const [form, setForm] = useState(() => ({
    name: pkg?.name || "",
    description: pkg?.description || "",
    duration: pkg?.duration ?? "",
    minPerson: pkg?.minPerson ?? "",
    maxPerson: pkg?.maxPerson ?? "",
    basePrice: pkg?.basePrice ?? "",
    pricePerPerson: pkg?.pricePerPerson ?? "",
    notes: pkg?.notes || "",
  }));

  const initialInclusionIds = (pkg?.inclusions || []).map(
    (inc) => inc.inclusionId
  );
  const [selectedInclusionIds, setSelectedInclusionIds] =
    useState(initialInclusionIds);

  const queryClient = useQueryClient();

  const {
    data: availableInclusions,
    error: availableError,
    isPending: availablePending,
  } = useQuery({
    queryKey: ["package-inclusions", pkg?.packageId, "available"],
    enabled: !!pkg?.packageId,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/package/${pkg.packageId}/inclusions/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error?.error || "Getting available package inclusions failed"
        );
      }
      return await response.json();
    },
  });

  if (availableError) {
    alert("something went wrong in retrieving available inclusions");
  }

  const updatePackageMutation = useMutation({
    mutationFn: async ({ packageId, data }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/package/${packageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating tour package failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tourPackages"],
        exact: false,
      });
      alert("Tour package updated successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Updating tour package failed");
    },
  });

  const disablePackageMutation = useMutation({
    mutationFn: async ({ packageId }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/package/${packageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling tour package failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tourPackages"],
        exact: false,
      });
      alert("Tour package disabled successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Disabling tour package failed");
    },
  });

  const restorePackageMutation = useMutation({
    mutationFn: async ({ packageId }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/package/admin/restore/${packageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring tour package failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tourPackages"],
        exact: false,
      });
      alert("Tour package restored successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Restoring tour package failed");
    },
  });

  const isBusy =
    updatePackageMutation.isPending ||
    disablePackageMutation.isPending ||
    restorePackageMutation.isPending;

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
    if (!pkg) return;

    const payload = {};

    const cleaned = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: form.duration === "" ? null : Number(form.duration),
      minPerson: form.minPerson === "" ? null : Number(form.minPerson),
      maxPerson: form.maxPerson === "" ? null : Number(form.maxPerson),
      basePrice: form.basePrice === "" ? null : Number(form.basePrice),
      pricePerPerson:
        form.pricePerPerson === "" ? null : Number(form.pricePerPerson),
      notes: form.notes.trim(),
    };

    if (cleaned.name && cleaned.name !== pkg.name) {
      payload.name = cleaned.name;
    }
    if (cleaned.description && cleaned.description !== pkg.description) {
      payload.description = cleaned.description;
    }
    if (
      cleaned.duration !== null &&
      cleaned.duration !== (pkg.duration ?? null)
    ) {
      payload.duration = cleaned.duration;
    }
    if (
      cleaned.minPerson !== null &&
      cleaned.minPerson !== (pkg.minPerson ?? null)
    ) {
      payload.minPerson = cleaned.minPerson;
    }
    if (
      cleaned.maxPerson !== null &&
      cleaned.maxPerson !== (pkg.maxPerson ?? null)
    ) {
      payload.maxPerson = cleaned.maxPerson;
    }
    if (
      cleaned.basePrice !== null &&
      cleaned.basePrice !== (pkg.basePrice ?? null)
    ) {
      payload.basePrice = cleaned.basePrice;
    }
    if (
      cleaned.pricePerPerson !== null &&
      cleaned.pricePerPerson !== (pkg.pricePerPerson ?? null)
    ) {
      payload.pricePerPerson = cleaned.pricePerPerson;
    }
    if (cleaned.notes && cleaned.notes !== (pkg.notes || "")) {
      payload.notes = cleaned.notes;
    }

    const currentSorted = [...initialInclusionIds].sort();
    const selectedSorted = [...selectedInclusionIds].sort();
    const inclusionsChanged =
      currentSorted.length !== selectedSorted.length ||
      currentSorted.some((id, index) => id !== selectedSorted[index]);
    if (inclusionsChanged) {
      payload.inclusionIds = selectedInclusionIds;
    }

    if (Object.keys(payload).length === 0) {
      onClose?.();
      return;
    }

    updatePackageMutation.mutate({ packageId: pkg.packageId, data: payload });
  };

  const handleDisable = () => {
    if (!pkg) return;
    if (!window.confirm("Disable this tour package?")) return;
    disablePackageMutation.mutate({ packageId: pkg.packageId });
  };

  const handleRestore = () => {
    if (!pkg) return;
    if (!window.confirm("Restore this tour package?")) return;
    restorePackageMutation.mutate({ packageId: pkg.packageId });
  };

  const isActive = (() => {
    if (!pkg) return true;
    if (typeof pkg.isActive === "boolean") return pkg.isActive;
    if (typeof pkg.active === "boolean") return pkg.active;
    if (typeof pkg.enabled === "boolean") return pkg.enabled;
    if (typeof pkg.status === "string")
      return pkg.status.toUpperCase() === "ACTIVE";
    return true;
  })();

  const combinedInclusions = [
    ...(pkg?.inclusions || []),
    ...(availableInclusions || []),
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Edit Tour Package</h2>
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
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Notes</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-16"
              value={form.notes}
              onChange={handleChange("notes")}
              disabled={isBusy}
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-semibold">Inclusions</label>
            {availablePending && (
              <div className="text-sm text-gray-600">
                Loading available inclusions...
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto border border-gray-200 rounded p-2 text-sm">
              {combinedInclusions.map((inclusion) => {
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
              {!combinedInclusions.length && (
                <span className="text-xs text-gray-500">
                  No inclusions available.
                </span>
              )}
            </div>
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
                {updatePackageMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTourPackage;
