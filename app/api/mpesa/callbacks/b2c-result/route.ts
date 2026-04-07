/**
 * POST /api/mpesa/callbacks/b2c-result
 * @author lucysees
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log("[B2C Result Callback]", JSON.stringify(payload, null, 2));

    const { Result: { ResultCode, ResultDesc, OriginatorConversationID, ConversationID, ResultParameters } = {} } = payload;

    if (ResultCode === 0) {
      console.log("[B2C Result] Transaction successful:", {
        OriginatorConversationID,
        ConversationID,
        ResultParameters,
      });
      // TODO: Update your database and notify the recipient
    } else {
      console.log("[B2C Result] Transaction failed:", { ResultCode, ResultDesc });
      // TODO: Handle failed B2C
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("[B2C Result Callback] Error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
