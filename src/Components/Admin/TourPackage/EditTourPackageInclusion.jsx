import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function EditTourPackageInclusion(props) {
  const inclusion = props.package;

  const [form, setForm] = useState(() => ({
    inclusionName: inclusion?.inclusionName || "",
    inclusionDescription: inclusion?.inclusionDescription || "",
    inclusionPricePerPerson: inclusion?.inclusionPricePerPerson ?? "",
  }));

  const queryClient = useQueryClient();

  const updateInclusionMutation = useMutation({
    mutationFn: async ({ inclusionId, data }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/package-inclusion/staff/${inclusionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating package inclusion failed");
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
      alert("Package inclusion updated successfully.");
      props.onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Updating package inclusion failed");
    },
  });

  const disableInclusionMutation = useMutation({
    mutationFn: async ({ inclusionId }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/package-inclusion/admin/${inclusionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling package inclusion failed");
      }
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
      alert("Package inclusion disabled successfully.");
      props.onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Disabling package inclusion failed");
    },
  });

  const restoreInclusionMutation = useMutation({
    mutationFn: async ({ inclusionId }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/package-inclusion/admin/restore/${inclusionId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring package inclusion failed");
      }
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
      alert("Package inclusion restored successfully.");
      props.onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Restoring package inclusion failed");
    },
  });

  const isBusy =
    updateInclusionMutation.isPending ||
    disableInclusionMutation.isPending ||
    restoreInclusionMutation.isPending;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inclusion) return;

    const payload = {};

    const cleaned = {
      inclusionName: form.inclusionName.trim(),
      inclusionDescription: form.inclusionDescription.trim(),
      inclusionPricePerPerson:
        form.inclusionPricePerPerson === ""
          ? null
          : Number(form.inclusionPricePerPerson),
    };

    if (
      cleaned.inclusionName &&
      cleaned.inclusionName !== inclusion.inclusionName
    ) {
      payload.inclusionName = cleaned.inclusionName;
    }
    if (
      cleaned.inclusionDescription &&
      cleaned.inclusionDescription !== (inclusion.inclusionDescription || "")
    ) {
      payload.inclusionDescription = cleaned.inclusionDescription;
    }
    if (
      cleaned.inclusionPricePerPerson !== null &&
      cleaned.inclusionPricePerPerson !== inclusion.inclusionPricePerPerson
    ) {
      payload.inclusionPricePerPerson = cleaned.inclusionPricePerPerson;
    }

    if (Object.keys(payload).length === 0) {
      props.onClose?.();
      return;
    }

    updateInclusionMutation.mutate({
      inclusionId: inclusion.inclusionId,
      data: payload,
    });
  };

  const handleDisable = () => {
    if (!inclusion) return;
    if (!window.confirm("Disable this package inclusion?")) return;
    disableInclusionMutation.mutate({ inclusionId: inclusion.inclusionId });
  };

  const handleRestore = () => {
    if (!inclusion) return;
    if (!window.confirm("Restore this package inclusion?")) return;
    restoreInclusionMutation.mutate({ inclusionId: inclusion.inclusionId });
  };

  const isActive = (() => {
    if (!inclusion) return true;
    if (typeof inclusion.isActive === "boolean") return inclusion.isActive;
    if (typeof inclusion.active === "boolean") return inclusion.active;
    if (typeof inclusion.enabled === "boolean") return inclusion.enabled;
    if (typeof inclusion.status === "string")
      return inclusion.status.toUpperCase() === "ACTIVE";
    return true;
  })();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Edit Package Inclusion</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={props.onClose}
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
            />
          </div>

          <div className="flex justify-between items-center mt-4">
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

            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={props.onClose}
                disabled={isBusy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#227B05]/80 text-white text-sm hover:bg-[#227B05] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isBusy}
              >
                {updateInclusionMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTourPackageInclusion;
