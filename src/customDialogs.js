// Simple custom modal implementation to replace window.alert with a styled overlay.
// Note: window.confirm is left as-is because it is synchronous and many call sites
// depend on that. We can migrate those to an async custom confirm helper separately.

function ensureContainer() {
  let container = document.getElementById("custom-dialog-root");
  if (!container) {
    container = document.createElement("div");
    container.id = "custom-dialog-root";
    document.body.appendChild(container);
  }
  return container;
}

function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showAlert(message) {
  const container = ensureContainer();

  return new Promise((resolve) => {
    const safeMessage = escapeHtml(message);

    container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-4">
          <h2 class="text-lg font-semibold mb-2 text-gray-900">Notification</h2>
          <p class="text-sm text-gray-700 whitespace-pre-line">${safeMessage}</p>
          <div class="mt-4 flex justify-end">
            <button type="button" class="px-4 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1">
              OK
            </button>
          </div>
        </div>
      </div>
    `;

    const overlay = container.firstElementChild;
    const button = overlay.querySelector("button");

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        close();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };

    const close = () => {
      container.innerHTML = "";
      document.removeEventListener("keydown", handleKeyDown);
      resolve();
    };

    button.addEventListener("click", close, { once: true });

    overlay.addEventListener(
      "click",
      (e) => {
        if (e.target === overlay) {
          close();
        }
      },
      { once: true }
    );

    // Allow keyboard interaction: Enter/Escape closes the dialog.
    document.addEventListener("keydown", handleKeyDown);
  });
}

export function setupCustomDialogs() {
  if (typeof window === "undefined") return;
  if (window.__customDialogsInitialized) return;
  window.__customDialogsInitialized = true;

  // Keep a reference to the native implementations in case they are needed.
  if (!window.__nativeAlert) {
    window.__nativeAlert = window.alert.bind(window);
  }

  // Override window.alert to use our custom modal.
  window.alert = function (message) {
    // Fire and forget; callers typically don't rely on the blocking behavior.
    showAlert(message);
  };
}
