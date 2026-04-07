/**
 * MpesaPaymentForm
 *
 * Drop-in STK Push payment form.
 * Plug this into any page in your existing Next.js app.
 *
 * Props:
 *   amount       – Pre-filled payment amount (can be overridden by user)
 *   reference    – Your order/reference ID
 *   description  – Transaction description shown on the M-Pesa receipt
 *   onSuccess    – Called when the STK Push request is accepted by Safaricom
 *   onError      – Called when the request fails
 *   lockAmount   – If true, the amount field is read-only
 *
 * Note: "accepted" means Safaricom queued the push — the actual payment
 * result arrives via the /api/mpesa/callbacks/stk webhook.
 *
 * @author lucysees
 */

"use client";

import { useState, FormEvent } from "react";
import { useSTKPush } from "@/hooks/useMpesa";
import type { STKPushResponse } from "@/lib/mpesa/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MpesaPaymentFormProps {
  amount?: number;
  reference?: string;
  description?: string;
  lockAmount?: boolean;
  onSuccess?: (data: STKPushResponse) => void;
  onError?: (message: string) => void;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalisePhone(raw: string): string {
  const cleaned = raw.replace(/\s+/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("0")) return `254${cleaned.slice(1)}`;
  if (/^[71]/.test(cleaned)) return `254${cleaned}`;
  return cleaned;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MpesaPaymentForm({
  amount: defaultAmount,
  reference = "PAYMENT",
  description = "M-Pesa Payment",
  lockAmount = false,
  onSuccess,
  onError,
  className = "",
}: MpesaPaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState<string>(
    defaultAmount ? String(defaultAmount) : ""
  );
  const [submitted, setSubmitted] = useState(false);

  const { initiatePayment, loading, error, data, reset } = useSTKPush();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();

    const normalisedPhone = normalisePhone(phoneNumber);
    const parsedAmount = parseInt(amount, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      onError?.("Please enter a valid amount.");
      return;
    }

    const result = await initiatePayment({
      amount: parsedAmount,
      phoneNumber: normalisedPhone,
      reference,
      description,
    });

    if (result.success) {
      setSubmitted(true);
      onSuccess?.(result.data);
    } else {
      onError?.(result.message);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted && data) {
    return (
      <div className={`rounded-2xl border border-green-200 bg-green-50 p-6 text-center ${className}`}>
        <div className="mb-3 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
            ✓
          </span>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-green-800">
          Check your phone
        </h3>
        <p className="mb-4 text-sm text-green-700">
          An M-Pesa prompt has been sent to{" "}
          <span className="font-medium">{phoneNumber}</span>. Enter your PIN to
          complete the payment.
        </p>
        <p className="mb-4 text-xs text-green-600">
          Reference:{" "}
          <span className="font-mono font-medium">{data.CheckoutRequestID}</span>
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            reset();
            setPhoneNumber("");
            if (!lockAmount) setAmount("");
          }}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          Make another payment
        </button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Pay with M-Pesa
          </h2>
          <p className="text-xs text-gray-500">Lipa Na M-Pesa · Daraja 3.0</p>
        </div>
      </div>

      {/* Phone number */}
      <div>
        <label
          htmlFor="mpesa-phone"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          M-Pesa Phone Number
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400 select-none">
            +254
          </span>
          <input
            id="mpesa-phone"
            type="tel"
            required
            placeholder="7XX XXX XXX"
            value={phoneNumber.replace(/^(\+?254|0)/, "")}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-14 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          We&apos;ll send an STK Push to this number.
        </p>
      </div>

      {/* Amount */}
      <div>
        <label
          htmlFor="mpesa-amount"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Amount (KES)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400 select-none">
            KES
          </span>
          <input
            id="mpesa-amount"
            type="number"
            required
            min={1}
            step={1}
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            readOnly={lockAmount}
            className={`w-full rounded-lg border border-gray-300 py-2.5 pl-14 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
              lockAmount ? "cursor-not-allowed bg-gray-50 text-gray-500" : ""
            }`}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending request…
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Pay KES {amount ? parseInt(amount).toLocaleString() : "–"}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Secured by Safaricom M-Pesa · lucysees
      </p>
    </form>
  );
}
