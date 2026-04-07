/**
 * POST /api/mpesa/callbacks/transaction-status-timeout
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log(
      "[Transaction Status Timeout Callback]",
      JSON.stringify(payload, null, 2)
    );
    // TODO: Mark the status query as timed out and retry if needed
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[Transaction Status Timeout Callback] Error:", error);
    return NextResponse.json({ status: "received" });
  }
}
