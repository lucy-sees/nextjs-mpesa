/**
 * Request validation helpers for M-Pesa Route Handlers.
 * Server-only.
 * @author lucysees
 */

import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "./types";

// ─── Generic field validator ─────────────────────────────────────────────────

/** Returns a 400 NextResponse if any required fields are missing, else null. */
export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): NextResponse<ApiErrorResponse> | null {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ""
  );

  if (missing.length > 0) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      },
      { status: 400 }
    );
  }

  return null;
}

// ─── Phone number normalisation ──────────────────────────────────────────────

/**
 * Normalises a Kenyan phone number to the 254XXXXXXXXX format required by Daraja.
 * Accepts: 07XXXXXXXX, 7XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
 */
export function normalisePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+/, "");

  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("0")) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith("7") || cleaned.startsWith("1"))
    return `254${cleaned}`;

  return cleaned;
}

// ─── Amount validator ────────────────────────────────────────────────────────

/** M-Pesa requires integer amounts (no decimals). */
export function validateAmount(amount: unknown): number | null {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num);
}
