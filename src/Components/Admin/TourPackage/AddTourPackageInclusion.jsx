import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../apiConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function AddTourPackageInclusion({ onClose }) {
  const [form, setForm] = useState({
    inclusionName: "",
    inclusionDescription: "",
    inclusionPricePerPerson: "",
  });

  const queryClient = useQueryClient();

  const addInclusionMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/package-inclusion/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Adding package inclusion failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["packageInclusions"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["package-inclusions"],
        exact: false,
      });
      alert("Package inclusion added successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Adding package inclusion failed");
    },
  });

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.inclusionName.trim()) {
      alert("Inclusion name is required.");
      return;
    }
    if (!form.inclusionPricePerPerson) {
      alert("Price per person is required.");
      return;
    }

    const payload = {
      inclusionName: form.inclusionName.trim(),
      inclusionDescription: form.inclusionDescription.trim(),
      inclusionPricePerPerson: Number(form.inclusionPricePerPerson),
    };

    addInclusionMutation.mutate(payload);
  };

  const isBusy = addInclusionMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Add Package Inclusion</h2>
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
            <label className="text-sm font-semibold">Name</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1"
              value={form.inclusionName}
              onChange={handleChange("inclusionName")}
              disabled={isBusy}
              placeholder="Inclusion name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Price Per Person</label>
            <input
              type="number"
              min="0"
              step="1"
              className="border border-gray-300 rounded px-2 py-1"
              value={form.inclusionPricePerPerson}
              onChange={handleChange("inclusionPricePerPerson")}
              disabled={isBusy}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 min-h-20"
              value={form.inclusionDescription}
              onChange={handleChange("inclusionDescription")}
              disabled={isBusy}
              placeholder="Optional description for this inclusion"
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

export default AddTourPackageInclusion;
