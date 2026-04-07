/**
 * POST /api/mpesa/b2c
 *
 * Business to Customer — send money from business account to a phone number.
 *
 * Body: { amount, phoneNumber, remarks, occasion?, initiatorName, securityCredential }
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getMpesaService,
  validateRequiredFields,
  normalisePhoneNumber,
} from "@/lib/mpesa";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  B2CRequestBody,
} from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as B2CRequestBody;

    const validationError = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ["amount", "phoneNumber", "remarks", "initiatorName", "securityCredential"]
    );
    if (validationError) return validationError;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const phoneNumber = normalisePhoneNumber(body.phoneNumber);

    const result = await getMpesaService().B2C({
      InitiatorName: body.initiatorName,
      SecurityCredential: body.securityCredential,
      CommandID: "SalaryPayment", // options: "SalaryPayment" | "BusinessPayment" | "PromotionPayment"
      Amount: body.amount,
      PartyA: process.env.MPESA_SHORTCODE ?? "",
      PartyB: phoneNumber,
      Remarks: body.remarks,
      QueueTimeOutURL: `${baseUrl}/api/mpesa/callbacks/b2c-timeout`,
      ResultURL: `${baseUrl}/api/mpesa/callbacks/b2c-result`,
      Occassion: body.occasion ?? "",
    });

    return NextResponse.json<ApiSuccessResponse<unknown>>({
      success: true,
      message: "B2C transaction initiated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("[/api/mpesa/b2c]", error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Failed to initiate B2C transaction.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
