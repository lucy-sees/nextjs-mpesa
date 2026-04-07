/**
 * PayPageClient
 *
 * Client Component shell for the /pay page.
 * Holds onSuccess / onError callbacks so the Server Component (page.tsx)
 * never has to pass functions across the server→client boundary.
 * @author lucysees
 */

"use client";

import { useRouter } from "next/navigation";
import MpesaPaymentForm from "@/components/MpesaPaymentForm";
import type { STKPushResponse } from "@/lib/mpesa/types";

interface PayPageClientProps {
  amount?: number;
  reference: string;
  description: string;
  lockAmount: boolean;
}

export default function PayPageClient({
  amount,
  reference,
  description,
  lockAmount,
}: PayPageClientProps) {
  const router = useRouter();

  function handleSuccess(data: STKPushResponse) {
    // STK Push accepted — Safaricom will call /api/mpesa/callbacks/stk
    // with the final result. You can redirect, show a toast, or start
    // polling here using data.CheckoutRequestID.
    console.log("STK Push accepted:", data.CheckoutRequestID);

    // Example redirect to a confirmation page:
    // router.push(`/pay/confirm?id=${data.CheckoutRequestID}`);
  }

  function handleError(message: string) {
    console.error("Payment error:", message);
    // Example: show a toast notification here
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your Safaricom number to receive an M-Pesa prompt.
          </p>
        </div>

        <MpesaPaymentForm
          amount={amount}
          reference={reference}
          description={description}
          lockAmount={lockAmount}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by Safaricom Daraja API v3.0
        </p>
      </div>
    </main>
  );
}
