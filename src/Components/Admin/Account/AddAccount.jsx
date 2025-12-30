import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../../apiConfig";

function AddAccount({ onClose, isAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("USER");

  const queryClient = useQueryClient();

  const addAccountMutation = useMutation({
    mutationFn: async ({ email, password, confirmPassword, role }) => {
      const token = localStorage.getItem("token");

      const url = isAdmin
        ? `${API_BASE_URL}/account/admin`
        : `${API_BASE_URL}/account`;

      const payload = {
        email: email.trim(),
        password,
        confirmPassword,
      };

      if (isAdmin) {
        payload.role = role;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Creating account failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"], exact: false });
      alert("Account created successfully.");
      onClose?.();
    },
    onError: (error) => {
      alert(error.message || "Creating account failed");
    },
  });

  const isBusy = addAccountMutation.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password || !confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password and confirmation do not match.");
      return;
    }

    addAccountMutation.mutate({
      email,
      password,
      confirmPassword,
      role,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Add Account</h2>
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
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBusy}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters, with upper &amp; lower case letters and a
              number.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Confirm Password</label>
            <input
              type="password"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isBusy}
              required
            />
          </div>

          {isAdmin ? (
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
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 text-gray-600"
                value="User (staff can only create user accounts)"
                readOnly
              />
            </div>
          )}

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
              {addAccountMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAccount;
