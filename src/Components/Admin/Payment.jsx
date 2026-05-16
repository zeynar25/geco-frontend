import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  API_BASE_URL,
  ensureTokenValidOrAlert,
  safeFetch,
} from "../../apiConfig";

function Payment({ canViewDashboard }) {
  const [gcashNumber, setGcashNumber] = useState("");
  const [gcashAccountName, setGcashAccountName] = useState("");
  const [selectedQrFile, setSelectedQrFile] = useState(null);
  const [existingQrUrl, setExistingQrUrl] = useState("");

  const {
    data: paymentSettings,
    error: paymentSettingsError,
    isPending: paymentSettingsPending,
    refetch: refetchPaymentSettings,
  } = useQuery({
    queryKey: ["paymentSettings"],
    enabled: canViewDashboard,
    queryFn: async () => {
      ensureTokenValidOrAlert();
      const response = await safeFetch(
        `${API_BASE_URL}/payment-settings/active`,
      );
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to load payment settings");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setGcashNumber(data?.gcashNumber || "");
      setExistingQrUrl(data?.gcashQrImage || "");
      setGcashAccountName(data?.gcashAccountName || "");
    },
  });

  useEffect(() => {
    if (!paymentSettingsError) return;
    const handle = async () => {
      const msg =
        paymentSettingsError?.message || "Failed to load payment settings.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    };
    handle();
  }, [paymentSettingsError]);

  const savePaymentSettings = useMutation({
    mutationFn: async () => {
      ensureTokenValidOrAlert();

      const payload = {
        gcashNumber,
        gcashAccountName,
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
      if (selectedQrFile) {
        formData.append("gcashQr", selectedQrFile);
      }

      const response = await safeFetch(
        `${API_BASE_URL}/payment-settings/staff`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "Failed to update payment settings");
      }

      return await response.json();
    },
    onSuccess: async (updated) => {
      setSelectedQrFile(null);
      setExistingQrUrl(updated?.gcashQrImage || existingQrUrl);
      setGcashAccountName(updated?.gcashAccountName || gcashAccountName);
      await refetchPaymentSettings();
      const msg = "Payment settings updated.";
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

      const msg = error?.message || "Failed to update payment settings.";
      if (window.__showAlert) await window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
    },
  });

  const previewUrl = useMemo(() => {
    if (selectedQrFile) {
      return URL.createObjectURL(selectedQrFile);
    }
    if (!existingQrUrl) return "";
    if (existingQrUrl.startsWith("http")) return existingQrUrl;
    return `${API_BASE_URL}${existingQrUrl}`;
  }, [selectedQrFile, existingQrUrl]);

  useEffect(() => {
    return () => {
      if (selectedQrFile && previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedQrFile, previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedQrFile(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!gcashNumber.trim()) {
      const msg = "Please enter a GCash number.";
      if (window.__showAlert) window.__showAlert(msg);
      else window.__nativeAlert?.(msg) || alert(msg);
      return;
    }
    savePaymentSettings.mutate();
  };

  if (!canViewDashboard) return null;

  return (
    <section className="rounded-lg bg-white p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#227B05]">Payment Settings</h2>
        <p className="text-sm text-gray-600">
          Update the GCash number and QR code used in the booking page.
        </p>
      </div>

      {paymentSettingsPending ? (
        <div className="flex items-center gap-3 py-6">
          <div className="h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading payment settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              GCash Number
            </label>
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2"
              value={gcashNumber}
              onChange={(event) => setGcashNumber(event.target.value)}
              placeholder={paymentSettings?.gcashNumber || "09XXXXXXXXX"}
            />
            <p className="text-xs text-gray-500">
              Use the number visitors should pay to.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              GCash Account Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2"
              value={gcashAccountName}
              onChange={(event) => setGcashAccountName(event.target.value)}
              placeholder={
                paymentSettings?.gcashAccountName ||
                "Account name shown to payers"
              }
            />
            <p className="text-xs text-gray-500">
              This name will be displayed together with the GCash number in the
              booking/payment modals.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm text-gray-700">
              GCash QR Code
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <span className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                {selectedQrFile ? selectedQrFile.name : "No file chosen"}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Upload a clear QR image so visitors can scan easily.
            </p>
          </div>

          {previewUrl && (
            <div className="rounded-md border bg-gray-50 p-3">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                QR Preview
              </span>
              <img
                src={previewUrl}
                alt="GCash QR preview"
                className="max-h-72 rounded border object-contain bg-white"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-md bg-[#227B05] px-4 py-2 font-semibold text-white hover:bg-[#1d6804] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={savePaymentSettings.isPending}
            >
              {savePaymentSettings.isPending
                ? "Saving..."
                : "Save Payment Settings"}
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setGcashNumber(paymentSettings?.gcashNumber || "");
                setGcashAccountName(paymentSettings?.gcashAccountName || "");
                setSelectedQrFile(null);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default Payment;
