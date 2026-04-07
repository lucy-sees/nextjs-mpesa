/**
 * POST /api/mpesa/callbacks/b2b-result
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("[B2B Result Callback]", JSON.stringify(payload, null, 2));
    // TODO: Update the B2B payment status in your database
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("[B2B Result Callback] Error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
