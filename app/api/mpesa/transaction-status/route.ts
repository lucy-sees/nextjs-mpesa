/**
 * POST /api/mpesa/transaction-status
 *
 * Queries the status of a past M-Pesa transaction.
 *
 * Body: { transactionId, partyA, remarks, initiatorName, securityCredential, originalConversationID? }
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getMpesaService,
  encryptSecurityCredential,
  validateRequiredFields,
} from "@/lib/mpesa";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  TransactionStatusRequestBody,
} from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TransactionStatusRequestBody;

    const validationError = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ["transactionId", "partyA", "remarks", "initiatorName", "securityCredential"]
    );
    if (validationError) return validationError;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const encryptedCredential = encryptSecurityCredential(
      body.securityCredential
    );

    const result = await getMpesaService().getTransactionStatus({
      Initiator: body.initiatorName,
      SecurityCredential: encryptedCredential,
      TransactionID: body.transactionId,
      OriginalConversationID: body.originalConversationID ?? "",
      PartyA: body.partyA,
      IdentifierType: "4",
      Remarks: body.remarks,
      Occasion: "",
      QueueTimeOutURL: `${baseUrl}/api/mpesa/callbacks/transaction-status-timeout`,
      ResultURL: `${baseUrl}/api/mpesa/callbacks/transaction-status-result`,
    });

    return NextResponse.json<ApiSuccessResponse<unknown>>({
      success: true,
      message: "Transaction status query initiated.",
      data: result,
    });
  } catch (error) {
    console.error("[/api/mpesa/transaction-status]", error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Failed to query transaction status.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
