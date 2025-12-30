import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faEnvelope,
  faUserShield,
  faAngleLeft,
  faAngleRight,
  faPlus,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../../apiConfig";

function ShowAccount(props) {
  const [accountRoleFilter, setAccountRoleFilter] = useState("ALL");
  const [accountActivityFilter, setAccountActivityFilter] = useState("ALL");
  const [accountPage, setAccountPage] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");

  const isActive = (account) => {
    if (!account) return true;
    if (typeof account.isActive === "boolean") return account.isActive;
    if (typeof account.active === "boolean") return account.active;
    if (typeof account.enabled === "boolean") return account.enabled;
    if (typeof account.status === "string")
      return account.status.toUpperCase() === "ACTIVE";
    return true;
  };

  const handlePrevAccountPage = () => {
    setAccountPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextAccountPage = () => {
    setAccountPage((prev) => prev + 1);
  };

  const handleRoleChange = (event) => {
    setAccountRoleFilter(event.target.value);
    setAccountPage(0);
  };

  const handleActivityChange = (event) => {
    setAccountActivityFilter(event.target.value);
    setAccountPage(0);
  };

  const {
    data: accountPageData,
    error: accountError,
    isPending: accountPending,
  } = useQuery({
    queryKey: [
      "accounts",
      accountRoleFilter,
      accountActivityFilter,
      accountPage,
      searchEmail,
    ],
    enabled: props.canViewDashboard && props.accountsIn,
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      params.append("page", accountPage.toString());
      params.append("size", "10");

      const trimmedSearch = searchEmail.trim();

      let basePath = "";

      if (trimmedSearch) {
        params.append("email", trimmedSearch);
        // Apply current filters to search so we only search within
        // the selected role and/or activity (active/inactive)
        if (accountRoleFilter !== "ALL") {
          params.append("role", accountRoleFilter);
        }

        if (
          accountActivityFilter === "ACTIVE" ||
          accountActivityFilter === "INACTIVE"
        ) {
          params.append("status", accountActivityFilter);
        }

        basePath = "account/staff/search";
      } else if (accountRoleFilter === "ALL") {
        if (accountActivityFilter === "ACTIVE") {
          basePath = "account/staff/list/all/active";
        } else if (accountActivityFilter === "INACTIVE") {
          basePath = "account/staff/list/all/inactive";
        } else {
          basePath = "account/staff/list/all";
        }
      } else if (accountRoleFilter === "ADMIN") {
        basePath = "account/staff/list/admin";
      } else if (accountRoleFilter === "STAFF") {
        if (accountActivityFilter === "ACTIVE") {
          basePath = "account/staff/list/staff/active";
        } else if (accountActivityFilter === "INACTIVE") {
          basePath = "account/staff/list/staff/inactive";
        } else {
          basePath = "account/staff/list/staff";
        }
      } else {
        // USER
        if (accountActivityFilter === "ACTIVE") {
          basePath = "account/staff/list/user/active";
        } else if (accountActivityFilter === "INACTIVE") {
          basePath = "account/staff/list/user/inactive";
        } else {
          basePath = "account/staff/list/user";
        }
      }

      const endpoint = `${API_BASE_URL}/${basePath}?${params.toString()}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Getting accounts failed");
      }

      return await response.json();
    },
  });

  if (accountError) {
    alert("something went wrong in retrieving accounts");
  }

  const rawAccounts = Array.isArray(accountPageData?.content)
    ? accountPageData.content
    : Array.isArray(accountPageData)
    ? accountPageData
    : [];

  let accounts = rawAccounts;
  let totalAccountPages =
    typeof accountPageData?.totalPages === "number"
      ? accountPageData.totalPages
      : rawAccounts.length > 0
      ? 1
      : 0;
  let totalAccountCount =
    typeof accountPageData?.totalElements === "number"
      ? accountPageData.totalElements
      : rawAccounts.length;

  if (accountRoleFilter === "ADMIN" && accountActivityFilter !== "ALL") {
    const filtered = rawAccounts.filter((acc) =>
      accountActivityFilter === "ACTIVE" ? isActive(acc) : !isActive(acc)
    );
    accounts = filtered;
    totalAccountPages = filtered.length > 0 ? 1 : 0;
    totalAccountCount = filtered.length;
  }

  const accountIsPending = accountPending;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl">
      <div className="text-white bg-[#48BF56] p-4 font-bold flex flex-wrap justify-between gap-2">
        <div className="text-2xl flex items-center">
          <FontAwesomeIcon icon={faUsers} className="mr-3" />
          <span>Account Management</span>
        </div>
        <button
          type="button"
          className="text-lg text-[#FDDB3C] bg-[#227B05] px-3 py-2 rounded-lg flex items-center hover:bg-[#227B05]/90"
          onClick={() => props.onAddAccount?.()}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-3" />
          <span>Add Account</span>
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <form className="flex justify-between flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <span className="font-semibold">Search Email:</span>
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                setAccountPage(0);
              }}
              className="border border-[#227B05] rounded px-2 py-1 w-full max-w-xs"
              placeholder="Enter email or part of it"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Account Type:</span>
            <select
              value={accountRoleFilter}
              onChange={handleRoleChange}
              className="border border-[#227B05] rounded px-2 py-1"
            >
              <option value="ALL">All</option>
              <option value="USER">User</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">Account Activity:</span>
            <select
              value={accountActivityFilter}
              onChange={handleActivityChange}
              className="border border-[#227B05] rounded px-2 py-1"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </form>

        {accountIsPending ? (
          <div className="flex flex-col items-center justify-center gap-4 h-32">
            <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading accounts...</p>
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Page {accountPage + 1} of {Math.max(totalAccountPages, 1)}
              </span>
              <span>Total: {totalAccountCount ?? 0}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePrevAccountPage}
                  disabled={accountPage === 0}
                >
                  <FontAwesomeIcon icon={faAngleLeft} />
                </button>
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleNextAccountPage}
                  disabled={
                    totalAccountPages === 0 ||
                    accountPage + 1 >= totalAccountPages
                  }
                >
                  <FontAwesomeIcon icon={faAngleRight} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-semibold">ID</th>
                    <th className="px-4 py-2 font-semibold">Email</th>
                    <th className="px-4 py-2 font-semibold">Role</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                    <th className="px-4 py-2 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => {
                    const email =
                      account?.detail?.email || account?.email || "-";
                    const role = account?.role || "USER";
                    const active = isActive(account);

                    return (
                      <tr
                        key={account.accountId}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 align-middle text-gray-700">
                          #{account.accountId}
                        </td>
                        <td className="px-4 py-2 align-middle flex items-center gap-2 text-gray-800">
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            className="text-gray-400"
                          />
                          <span>{email}</span>
                        </td>
                        <td className="px-4 py-2 align-middle text-gray-700">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase">
                            <FontAwesomeIcon
                              icon={faUserShield}
                              className="text-xs"
                            />
                            {role?.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2 align-middle">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2 align-middle text-right">
                          <button
                            type="button"
                            className="text-gray-600 hover:text-[#227B05] text-sm"
                            onClick={() => props.onEditAccount?.(account)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 m-5">
            No accounts found.
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowAccount;
