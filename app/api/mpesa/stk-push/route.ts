/**
 * POST /api/mpesa/stk-push
 *
 * Initiates an STK Push (Lipa Na M-Pesa Online) request.
 * The customer receives a PIN prompt on their phone.
 *
 * Body: { amount, phoneNumber, reference, description }
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";
import { getMpesaService, validateRequiredFields, normalisePhoneNumber, validateAmount } from "@/lib/mpesa";
import type { ApiSuccessResponse, ApiErrorResponse, STKPushRequestBody, STKPushResponse } from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as STKPushRequestBody;

    // Validate required fields
    const validationError = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ["amount", "phoneNumber", "reference", "description"]
    );
    if (validationError) return validationError;

    // Validate amount
    const amount = validateAmount(body.amount);
    if (!amount) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, message: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const phoneNumber = normalisePhoneNumber(body.phoneNumber);

    const result = await getMpesaService().sendSTKPush({
      amount,
      sender: phoneNumber,
      callbackUrl: `${baseUrl}/api/mpesa/callbacks/stk`,
      reference: body.reference,
      description: body.description,
    });

    return NextResponse.json<ApiSuccessResponse<STKPushResponse>>({
      success: true,
      message: "STK Push request sent successfully. Awaiting customer PIN.",
      data: result,
    });
  } catch (error) {
    console.error("[/api/mpesa/stk-push]", error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Failed to initiate STK Push.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
