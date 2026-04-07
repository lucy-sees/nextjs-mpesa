/**
 * POST /api/mpesa/callbacks/b2c-timeout
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("[B2C Timeout Callback]", JSON.stringify(payload, null, 2));
    // TODO: Mark the transaction as timed out in your database
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[B2C Timeout Callback] Error:", error);
    return NextResponse.json({ status: "received" });
  }
}
