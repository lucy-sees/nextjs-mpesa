/**
 * POST /api/mpesa/callbacks/b2b-timeout
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("[B2B Timeout Callback]", JSON.stringify(payload, null, 2));
    return NextResponse.json({ status: "received" });
  } catch (error) {
    console.error("[B2B Timeout Callback] Error:", error);
    return NextResponse.json({ status: "received" });
  }
}
