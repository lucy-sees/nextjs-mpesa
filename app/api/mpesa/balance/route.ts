/**
 * POST /api/mpesa/balance
 *
 * Queries the account balance of a business short code.
 *
 * Body: { partyA, remarks, initiator, securityCredential }
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
  BalanceRequestBody,
} from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BalanceRequestBody;

    const validationError = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ["partyA", "remarks", "initiator", "securityCredential"]
    );
    if (validationError) return validationError;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const encryptedCredential = encryptSecurityCredential(
      body.securityCredential
    );

    const result = await getMpesaService().getAccountBalance({
      PartyA: parseInt(body.partyA, 10),
      Remarks: body.remarks,
      Initiator: body.initiator,
      SecurityCredential: encryptedCredential,
      QueueTimeOutURL: `${baseUrl}/api/mpesa/callbacks/balance-timeout`,
      ResultURL: `${baseUrl}/api/mpesa/callbacks/balance-result`,
    });

    return NextResponse.json<ApiSuccessResponse<unknown>>({
      success: true,
      message: "Account balance query initiated. Result will arrive via callback.",
      data: result,
    });
  } catch (error) {
    console.error("[/api/mpesa/balance]", error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Failed to query account balance.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
