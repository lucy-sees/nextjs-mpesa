/**
 * POST /api/mpesa/register-urls
 *
 * Registers confirmation and validation URLs for C2B (customer-to-business) payments.
 * Run this once when deploying to a new environment.
 *
 * Body: { shortCode, confirmationUrl, validationUrl }
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";
import { getMpesaService, validateRequiredFields } from "@/lib/mpesa";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  RegisterUrlsRequestBody,
} from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterUrlsRequestBody;

    const validationError = validateRequiredFields(
      body as unknown as Record<string, unknown>,
      ["shortCode", "confirmationUrl", "validationUrl"]
    );
    if (validationError) return validationError;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Accept absolute URLs as-is; prefix relative paths with the base URL
    const toAbsolute = (url: string) =>
      url.startsWith("http") ? url : `${baseUrl}${url}`;

    const result = await getMpesaService().registerUrls({
      ShortCode: body.shortCode,
      ResponseType: "Completed",
      ConfirmationURL: toAbsolute(body.confirmationUrl),
      ValidationURL: toAbsolute(body.validationUrl),
    });

    return NextResponse.json<ApiSuccessResponse<unknown>>({
      success: true,
      message: "C2B URLs registered successfully.",
      data: result,
    });
  } catch (error) {
    console.error("[/api/mpesa/register-urls]", error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Failed to register C2B URLs.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
