import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function EditAttraction({ attraction, onClose, isAdmin }) {
  const [name, setName] = useState(attraction?.name || "");
  const [description, setDescription] = useState(attraction?.description || "");
  const [funFact, setFunFact] = useState(attraction?.funFact || "");

  const queryClient = useQueryClient();

  const updateAttractionMutation = useMutation({
    mutationFn: async ({ attractionId, data }) => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/attraction/${attractionId}`,
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
        throw new Error(error?.error || "Updating attraction failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      alert("Attraction updated successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Updating attraction failed");
    },
  });

  const disableAttractionMutation = useMutation({
    mutationFn: async ({ attractionId }) => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/attraction/${attractionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling attraction failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      alert("Attraction disabled successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Disabling attraction failed");
    },
  });

  const restoreAttractionMutation = useMutation({
    mutationFn: async ({ attractionId }) => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/attraction/restore/${attractionId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring attraction failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      alert("Attraction restored successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Restoring attraction failed");
    },
  });

  const isBusy =
    updateAttractionMutation.isPending ||
    disableAttractionMutation.isPending ||
    restoreAttractionMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!attraction) return;

    const payload = {};

    const cleanedName = name.trim();
    const cleanedDescription = description.trim();
    const cleanedFunFact = funFact.trim();

    if (cleanedName && cleanedName !== attraction.name) {
      payload.name = cleanedName;
    }
    if (cleanedDescription && cleanedDescription !== attraction.description) {
      payload.description = cleanedDescription;
    }
    if (cleanedFunFact && cleanedFunFact !== (attraction.funFact || "")) {
      payload.funFact = cleanedFunFact;
    }

    if (Object.keys(payload).length === 0) {
      onClose?.();
      return;
    }

    updateAttractionMutation.mutate({
      attractionId: attraction.attractionId,
      data: payload,
    });
  };

  const handleDisable = () => {
    if (!attraction) return;
    if (!window.confirm("Disable this attraction?")) return;
    disableAttractionMutation.mutate({ attractionId: attraction.attractionId });
  };

  const handleRestore = () => {
    if (!attraction) return;
    if (!window.confirm("Restore this attraction?")) return;
    restoreAttractionMutation.mutate({ attractionId: attraction.attractionId });
  };

  const isActive = (() => {
    if (!attraction) return true;
    if (typeof attraction.isActive === "boolean") return attraction.isActive;
    if (typeof attraction.active === "boolean") return attraction.active;
    if (typeof attraction.enabled === "boolean") return attraction.enabled;
    if (typeof attraction.status === "string")
      return attraction.status.toUpperCase() === "ACTIVE";
    return true;
  })();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Edit Attraction</h2>
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
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 text-sm min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Fun Fact (optional)</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 text-sm min-h-16"
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
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
                {updateAttractionMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAttraction;
