import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

function EditAccount({ account, onClose, isAdmin }) {
  const [role, setRole] = useState(account?.role || "USER");

  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async ({ accountId, role }) => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/account/admin/update-role/${accountId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ accountId, role }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Updating account role failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"], exact: false });
      alert("Account role updated successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Updating account role failed");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ accountId }) => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8080/account/staff/reset-password/${accountId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Resetting password failed");
      }

      return await response.json().catch(() => null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"], exact: false });
      alert("Password reset successfully.");
    },
    onError: (error) => {
      alert(error.message || "Resetting password failed");
    },
  });

  const isBusy =
    updateRoleMutation.isPending || resetPasswordMutation.isPending;

  const isTargetAdmin = (account?.role || "").toUpperCase() === "ADMIN";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!account || !isAdmin || isTargetAdmin) {
      onClose?.();
      return;
    }

    if (role === account.role) {
      onClose?.();
      return;
    }

    updateRoleMutation.mutate({ accountId: account.accountId, role });
  };

  const handleResetPassword = () => {
    if (!account) return;
    if (!window.confirm("Reset password for this account?")) return;
    resetPasswordMutation.mutate({ accountId: account.accountId });
  };

  const email = account?.detail?.email || account?.email || "-";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Manage Account</h2>
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
            <label className="text-sm font-semibold">Account ID</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 text-gray-700"
              value={account?.accountId ?? "-"}
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 text-gray-700"
              value={email}
              readOnly
            />
          </div>

          {isAdmin && !isTargetAdmin ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Role</label>
              <select
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isBusy}
              >
                <option value="USER">User</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Role</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 text-gray-700"
                value={(account?.role || "USER").toLowerCase()}
                readOnly
              />
              {isTargetAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  Admin accounts cannot have their role changed.
                </p>
              )}
            </div>
          )}

          <div
            className={`flex items-center gap-2 mt-4 ${
              isAdmin ? "justify-between" : "justify-end"
            }`}
          >
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded border border-red-500 text-red-600 text-sm hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleResetPassword}
                disabled={isBusy}
              >
                Reset Password
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={isBusy}
              >
                Close
              </button>
              {isAdmin && !isTargetAdmin && (
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#227B05]/80 text-white text-sm hover:bg-[#227B05] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isBusy}
                >
                  {updateRoleMutation.isPending ? "Saving..." : "Save Role"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAccount;
