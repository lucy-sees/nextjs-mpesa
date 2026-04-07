/**
 * POST /api/mpesa/callbacks/balance-result
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("[Balance Result Callback]", JSON.stringify(payload, null, 2));
    // TODO: Store the balance result and notify your admin dashboard
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[Balance Result Callback] Error:", error);
    return NextResponse.json({ status: "received" });
  }
}
