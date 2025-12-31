import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";

function EditAttraction({ attraction, onClose, isAdmin, onUpdated }) {
  const [name, setName] = useState(attraction?.name || "");
  const [description, setDescription] = useState(attraction?.description || "");
  const [funFact, setFunFact] = useState(attraction?.funFact || "");
  const [imageFile, setImageFile] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const updateAttractionMutation = useMutation({
    mutationFn: async ({ attractionId, formData }) => {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/attraction/${attractionId}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating attraction failed");
      }

      return await response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      queryClient.refetchQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      const msg = "Attraction updated successfully.";
      if (window.__showAlert) {
        await window.__showAlert(msg);
      } else {
        window.__nativeAlert?.(msg) || alert(msg);
      }
      onClose?.();
      onUpdated?.();
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
      const errMsg = error.message || "Updating attraction failed";
      if (window.__showAlert) await window.__showAlert(errMsg);
      else window.__nativeAlert?.(errMsg) || alert(errMsg);
    },
  });

  const disableAttractionMutation = useMutation({
    mutationFn: async ({ attractionId }) => {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/attraction/${attractionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling attraction failed");
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      queryClient.refetchQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      const msg = "Attraction disabled successfully.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      onClose?.();
      onUpdated?.();
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
      const errMsg = error.message || "Disabling attraction failed";
      if (window.__showAlert) await window.__showAlert(errMsg);
      else window.__nativeAlert?.(errMsg) || alert(errMsg);
    },
  });

  const restoreAttractionMutation = useMutation({
    mutationFn: async ({ attractionId }) => {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/attraction/restore/${attractionId}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring attraction failed");
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      queryClient.refetchQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      const msg = "Attraction restored successfully.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      onClose?.();
      onUpdated?.();
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
      const errMsg = error.message || "Restoring attraction failed";
      if (window.__showAlert) await window.__showAlert(errMsg);
      else window.__nativeAlert?.(errMsg) || alert(errMsg);
    },
  });

  const isBusy =
    updateAttractionMutation.isPending ||
    disableAttractionMutation.isPending ||
    restoreAttractionMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!attraction) return;

    const cleanedName = name.trim();
    const cleanedDescription = description.trim();
    const cleanedFunFact = funFact.trim();

    const textChanged =
      (cleanedName && cleanedName !== attraction.name) ||
      (cleanedDescription && cleanedDescription !== attraction.description) ||
      (cleanedFunFact && cleanedFunFact !== (attraction.funFact || ""));

    const imageChanged = !!imageFile;

    if (!textChanged && !imageChanged) {
      onClose?.();
      return;
    }

    const formData = new FormData();

    formData.append("attractionName", cleanedName || attraction.name || "");
    formData.append(
      "attractionDescription",
      cleanedDescription || attraction.description || ""
    );

    if (cleanedFunFact || attraction.funFact) {
      formData.append(
        "attractionFunFact",
        cleanedFunFact || attraction.funFact || ""
      );
    }

    if (imageChanged) {
      formData.append("image", imageFile);
    }

    updateAttractionMutation.mutate({
      attractionId: attraction.attractionId,
      formData,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
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
          {attraction?.photo2dUrl && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Current Image</label>
              <div className="aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={`${API_BASE_URL}${attraction.photo2dUrl}`}
                  alt={attraction.name || "Attraction image"}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">
              Change Image (optional)
            </label>
            <div className="flex items-center gap-3">
              <label
                className={`px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors ${
                  isBusy
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span>Choose image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isBusy}
                />
              </label>
              <span className="text-xs text-gray-500 truncate">
                {imageFile ? imageFile.name : "No file chosen"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, or GIF. A clear 2D image works best.
            </p>
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
