/**
 * POST /api/mpesa/callbacks/balance-timeout
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("[Balance Timeout Callback]", JSON.stringify(payload, null, 2));
    // TODO: Mark the balance query as timed out
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[Balance Timeout Callback] Error:", error);
    return NextResponse.json({ status: "received" });
  }
}
