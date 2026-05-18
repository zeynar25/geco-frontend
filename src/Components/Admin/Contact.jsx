import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  API_BASE_URL,
  ensureTokenValidOrAlert,
  safeFetch,
} from "../../apiConfig";

function Contact({ canViewDashboard }) {
  const [editingContactId, setEditingContactId] = useState(null);
  const [contactName, setContactName] = useState("");
  const [value, setValue] = useState("");

  const queryClient = useQueryClient();

  const {
    data: contacts,
    error: contactsError,
    isPending: contactsPending,
  } = useQuery({
    queryKey: ["contacts"],
    enabled: canViewDashboard,
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/contact`);
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to load contacts");
      }
      return await response.json();
    },
  });

  useEffect(() => {
    if (!contactsError) return;
    const handle = async () => {
      const msg = contactsError?.message || "Failed to load contacts.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    };
    handle();
  }, [contactsError]);

  const saveContactMutation = useMutation({
    mutationFn: async () => {
      ensureTokenValidOrAlert();

      if (!contactName.trim()) {
        throw new Error(
          "Please enter a contact name (e.g., email, contactnumber, address).",
        );
      }
      if (!value.trim()) {
        throw new Error("Please enter a contact value.");
      }

      const payload = {
        contactName,
        value,
      };

      const url = editingContactId
        ? `${API_BASE_URL}/contact/${editingContactId}`
        : `${API_BASE_URL}/contact`;

      const response = await safeFetch(url, {
        method: editingContactId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to save contact");
      }

      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setEditingContactId(null);
      setContactName("");
      setValue("");
      const msg = editingContactId
        ? "Contact updated successfully."
        : "Contact created successfully.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
    onError: async (error) => {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        return;
      }

      const msg = error?.message || "Failed to save contact.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id) => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(`${API_BASE_URL}/contact/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to delete contact");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      const msg = "Contact deleted successfully.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
    onError: async (error) => {
      if (error?.message === "TOKEN_EXPIRED") {
        const msg = "Your session has expired. Please sign in again.";
        if (window.__showAlert) await window.__showAlert(msg);
        else window.__nativeAlert?.(msg) || alert(msg);
        return;
      }

      const msg = error?.message || "Failed to delete contact.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

  const handleEditContact = (contact) => {
    setEditingContactId(contact.id);
    setContactName(contact.contactName);
    setValue(contact.value);
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setContactName("");
    setValue("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveContactMutation.mutate();
  };

  const handleDeleteContact = (id) => {
    if (window.confirm("Are you sure you want to delete this contact entry?")) {
      deleteContactMutation.mutate(id);
    }
  };

  if (!canViewDashboard) return null;

  return (
    <section className="rounded-lg bg-white p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#227B05]">Park Contacts</h2>
        <p className="text-sm text-gray-600">
          Manage the contact information displayed on the website.
        </p>
      </div>

      {contactsPending ? (
        <div className="flex items-center gap-3 py-6">
          <div className="h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading contacts...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-700">
                Contact Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="e.g., email, contactnumber, address, facebook"
                disabled={!!editingContactId}
              />
              <p className="text-xs text-gray-500">
                Unique identifier for this contact field (cannot be changed when
                editing).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-700">
                Contact Value
              </label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="e.g., info@park.edu.ph, +63 1234567890"
              />
              <p className="text-xs text-gray-500">
                The actual contact information value.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-md bg-[#227B05] px-4 py-2 font-semibold text-white hover:bg-[#1d6804] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saveContactMutation.isPending}
              >
                {saveContactMutation.isPending
                  ? editingContactId
                    ? "Updating..."
                    : "Creating..."
                  : editingContactId
                    ? "Update Contact"
                    : "Add Contact"}
              </button>
              {editingContactId && (
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCancelEdit}
                  disabled={saveContactMutation.isPending}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Contacts Table */}
          {Array.isArray(contacts) && contacts.length > 0 && (
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Contact Name
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Contact Value
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {contact.contactName}
                        </td>
                        <td className="px-4 py-3">{contact.value}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            type="button"
                            className="rounded-md border border-[#227B05] text-[#227B05] px-3 py-1 text-xs font-semibold hover:bg-[#227B05]/5"
                            onClick={() => handleEditContact(contact)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-red-500 text-red-600 px-3 py-1 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteContact(contact.id)}
                            disabled={deleteContactMutation.isPending}
                          >
                            {deleteContactMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!contactsPending &&
            (!Array.isArray(contacts) || contacts.length === 0) && (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-600">No contact entries found.</p>
              </div>
            )}
        </div>
      )}
    </section>
  );
}

export default Contact;
