/**
 * POST /api/mpesa/callbacks/stk
 *
 * Receives the result of an STK Push transaction from Safaricom.
 * This endpoint must be publicly accessible (not behind auth middleware).
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";
import type { STKCallbackPayload, STKCallbackMetadataItem } from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as STKCallbackPayload;

    console.log(
      "[STK Callback]",
      JSON.stringify(payload, null, 2)
    );

    const { Body: { stkCallback } = {} } = payload;

    if (!stkCallback) {
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Invalid callback payload" },
        { status: 400 }
      );
    }

    const {
      ResultCode,
      ResultDesc,
      CallbackMetadata,
      MerchantRequestID,
      CheckoutRequestID,
    } = stkCallback;

    if (ResultCode === 0) {
      // ── Payment successful ──────────────────────────────────────────────
      const items: STKCallbackMetadataItem[] =
        CallbackMetadata?.Item ?? [];

      const getValue = (name: string) =>
        items.find((i) => i.Name === name)?.Value;

      const mpesaReceiptNumber = getValue("MpesaReceiptNumber");
      const amount = getValue("Amount");
      const phoneNumber = getValue("PhoneNumber");
      const transactionDate = getValue("TransactionDate");

      console.log("[STK Callback] Payment successful:", {
        MerchantRequestID,
        CheckoutRequestID,
        mpesaReceiptNumber,
        amount,
        phoneNumber,
        transactionDate,
      });

      // ── TODO: persist to your database ─────────────────────────────────
      // Example (Prisma):
      // await prisma.payment.update({
      //   where: { checkoutRequestId: CheckoutRequestID },
      //   data: {
      //     status: "completed",
      //     mpesaReceiptNumber: String(mpesaReceiptNumber),
      //     amount: Number(amount),
      //     phoneNumber: String(phoneNumber),
      //     completedAt: new Date(),
      //   },
      // });
      //
      // Example (send a webhook to your frontend via Server-Sent Events):
      // await notifyClient(CheckoutRequestID, { status: "completed", mpesaReceiptNumber });
    } else {
      // ── Payment failed / cancelled ──────────────────────────────────────
      console.log("[STK Callback] Payment failed:", {
        ResultCode,
        ResultDesc,
        MerchantRequestID,
        CheckoutRequestID,
      });

      // ── TODO: mark payment as failed in your database ──────────────────
      // await prisma.payment.update({
      //   where: { checkoutRequestId: CheckoutRequestID },
      //   data: { status: "failed", failureReason: ResultDesc },
      // });
    }

    // Safaricom requires a 200 response with this exact shape
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    });
  } catch (error) {
    console.error("[STK Callback] Unhandled error:", error);
    // Still return 200 — Safaricom will retry on non-2xx responses
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received",
    });
  }
}
