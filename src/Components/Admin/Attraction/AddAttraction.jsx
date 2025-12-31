import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";

function AddAttraction({ onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [funFact, setFunFact] = useState("");
  const [image, setImage] = useState(null);

  const queryClient = useQueryClient();

  const addAttractionMutation = useMutation({
    mutationFn: async ({ name, description, funFact, image }) => {
      ensureTokenValidOrAlert();

      const formData = new FormData();
      formData.append("attractionName", name.trim());
      formData.append("attractionDescription", description.trim());
      if (funFact.trim()) {
        formData.append("attractionFunFact", funFact.trim());
      }
      if (image) {
        formData.append("image", image);
      }

      const response = await safeFetch(`${API_BASE_URL}/attraction`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Adding attraction failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attractions"],
        exact: false,
      });
      alert("Attraction added successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Adding attraction failed");
    },
  });

  const isBusy = addAttractionMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Name and description are required.");
      return;
    }

    addAttractionMutation.mutate({ name, description, funFact, image });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImage(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Add Attraction</h2>
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
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="border border-gray-300 rounded px-2 py-1 text-sm min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBusy}
              required
            />
            <p className="text-xs text-gray-500 mt-1">At least 5 characters.</p>
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
            <label className="text-sm font-semibold">Image (optional)</label>
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
                {image ? image.name : "No file chosen"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG, or GIF. A clear 2D image works best.
            </p>
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
              {addAttractionMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAttraction;
