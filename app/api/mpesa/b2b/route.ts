/**
 * POST /api/mpesa/b2b
 *
 * Business to Business — pay another business's paybill/till.
 *
 * Body: { amount, paybillNumber, accountReference, remarks, initiatorName, securityCredential }
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
  B2BRequestBody,
} from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as B2BRequestBody;

    const validationError = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      [
        "amount",
        "paybillNumber",
        "accountReference",
        "remarks",
        "initiatorName",
        "securityCredential",
      ]
    );
    if (validationError) return validationError;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Encrypt the security credential with the Safaricom public certificate
    const encryptedCredential = encryptSecurityCredential(
      body.securityCredential
    );

    const result = await getMpesaService().initiateB2BPayment({
      Initiator: body.initiatorName,
      SecurityCredential: encryptedCredential,
      CommandID: "BusinessPayBill",
      SenderIdentifierType: "4",
      RecieverIdentifierType: "4",
      Amount: body.amount,
      PartyA: process.env.MPESA_SHORTCODE ?? "",
      PartyB: body.paybillNumber,
      AccountReference: body.accountReference,
      Requester: process.env.MPESA_SHORTCODE ?? "",
      Remarks: body.remarks,
      QueueTimeOutURL: `${baseUrl}/api/mpesa/callbacks/b2b-timeout`,
      ResultURL: `${baseUrl}/api/mpesa/callbacks/b2b-result`,
    });

    return NextResponse.json<ApiSuccessResponse<unknown>>({
      success: true,
      message: "B2B payment initiated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("[/api/mpesa/b2b]", error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Failed to initiate B2B payment.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
