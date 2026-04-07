/**
 * POST /api/mpesa/callbacks/transaction-status-result
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log(
      "[Transaction Status Result Callback]",
      JSON.stringify(payload, null, 2)
    );
    // TODO: Update the transaction record with its confirmed status
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[Transaction Status Result Callback] Error:", error);
    return NextResponse.json({ status: "received" });
  }
}
