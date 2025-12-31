import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import {
  API_BASE_URL,
  safeFetch,
  ensureTokenValidOrAlert,
} from "../../../apiConfig";

function EditAccount({ account, onClose, isAdmin }) {
  const [role, setRole] = useState(account?.role || "USER");
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);

  const queryClient = useQueryClient();

  const isActive = (acc) => {
    if (!acc) return true;
    if (typeof acc.isActive === "boolean") return acc.isActive;
    if (typeof acc.active === "boolean") return acc.active;
    if (typeof acc.enabled === "boolean") return acc.enabled;
    if (typeof acc.status === "string")
      return acc.status.toUpperCase() === "ACTIVE";
    return true;
  };

  const updateRoleMutation = useMutation({
    mutationFn: async ({ accountId, role }) => {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/account/admin/update-role/${accountId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
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
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });
      alert("Account role updated successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Updating account role failed");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ accountId }) => {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/account/staff/reset-password/${accountId}`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Resetting password failed");
      }

      return await response.json().catch(() => null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });
      alert("Password reset successfully.");
    },
    onError: (error) => {
      alert(error.message || "Resetting password failed");
    },
  });

  const disableAccountMutation = useMutation({
    mutationFn: async ({ accountId }) => {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/account/admin/${accountId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Disabling account failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });
      alert("Account disabled successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Disabling account failed");
    },
  });

  const restoreAccountMutation = useMutation({
    mutationFn: async ({ accountId }) => {
      ensureTokenValidOrAlert();

      const response = await safeFetch(
        `${API_BASE_URL}/account/admin/restore/${accountId}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Restoring account failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["dashboardStatistics"],
        exact: false,
      });
      alert("Account restored successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Restoring account failed");
    },
  });

  const isBusy =
    updateRoleMutation.isPending ||
    resetPasswordMutation.isPending ||
    disableAccountMutation.isPending ||
    restoreAccountMutation.isPending;

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

    // If promoting someone to ADMIN, show a confirmation modal because
    // this may transfer admin rights and demote the current admin.
    if (role === "ADMIN") {
      setShowRoleConfirm(true);
      return;
    }

    updateRoleMutation.mutate({ accountId: account.accountId, role });
  };

  const handleResetPassword = () => {
    if (!account) return;
    if (!window.confirm("Reset password for this account?")) return;
    resetPasswordMutation.mutate({ accountId: account.accountId });
  };

  const handleDisableAccount = () => {
    if (!account) return;
    if (
      !window.confirm(
        "Disable this account? The user will no longer be able to sign in."
      )
    )
      return;
    disableAccountMutation.mutate({ accountId: account.accountId });
  };

  const handleRestoreAccount = () => {
    if (!account) return;
    if (
      !window.confirm(
        "Restore this account? The user will be able to sign in again."
      )
    )
      return;
    restoreAccountMutation.mutate({ accountId: account.accountId });
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
              {isAdmin &&
                !isTargetAdmin &&
                (isActive(account) ? (
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-red-500 text-red-600 text-sm hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleDisableAccount}
                    disabled={isBusy}
                  >
                    {disableAccountMutation.isPending
                      ? "Disabling..."
                      : "Disable"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-emerald-500 text-emerald-600 text-sm hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleRestoreAccount}
                    disabled={isBusy}
                  >
                    {restoreAccountMutation.isPending
                      ? "Restoring..."
                      : "Restore"}
                  </button>
                ))}
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

      {showRoleConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-lg mb-2">
              Transfer admin rights?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You are about to assign the ADMIN role to this account. This may
              transfer admin rights and demote your current account to STAFF.
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 text-sm hover:bg-gray-100"
                onClick={() => setShowRoleConfirm(false)}
                disabled={isBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-[#227B05]/80 text-white text-sm hover:bg-[#227B05] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => {
                  setShowRoleConfirm(false);
                  updateRoleMutation.mutate({
                    accountId: account.accountId,
                    role,
                  });
                }}
                disabled={isBusy}
              >
                {updateRoleMutation.isPending
                  ? "Saving..."
                  : "Yes, transfer admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditAccount;
