import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/line-notify
 * Sends a push message to a LINE group via Messaging API
 * Body: { groupId: string, message: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { groupId, message } = await req.json();

    if (!groupId || !message) {
      return NextResponse.json(
        { error: "Missing groupId or message" },
        { status: 400 }
      );
    }

    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken || channelAccessToken === "your-channel-access-token") {
      console.warn("LINE_CHANNEL_ACCESS_TOKEN not configured, skipping notification");
      return NextResponse.json(
        { error: "LINE Channel Access Token not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: groupId,
        messages: [
          typeof message === "string" 
            ? { type: "text", text: message } 
            : message
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("LINE API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "LINE API error", detail: errorBody },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
