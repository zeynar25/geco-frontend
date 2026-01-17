import React from "react";

export default function FilterModal({
  isOpen,
  onClose,
  title = "Filters",
  children,
  onApply,
  onClear,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-3 text-[#227B05]">{title}</h2>
        <div className="mb-4">{children}</div>

        <div className="flex justify-end gap-2">
          {onClear && (
            <button
              type="button"
              className="px-3 py-2 border rounded text-sm"
              onClick={onClear}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className="px-4 py-2 bg-[#227B05] text-white rounded text-sm"
            onClick={() => {
              onApply?.();
              onClose?.();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
