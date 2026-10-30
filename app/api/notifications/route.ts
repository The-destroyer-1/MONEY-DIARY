import { NextRequest, NextResponse } from "next/server";

// Store a simple in-memory notification queue
const notificationQueue: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, title, message, deviceSource, payload } = data;

    if (!type) {
      return NextResponse.json(
        { error: "Missing type field" },
        { status: 400 }
      );
    }

    const notification = {
      type,
      title: title || "New Message",
      message: message || "",
      deviceSource: deviceSource || "mobile",
      payload,
      timestamp: new Date().toISOString(),
      id: `${Date.now()}-${Math.random()}`,
    };

    notificationQueue.push(notification);

    // Log the notification
    console.log("Received notification from mobile:", notification);

    return NextResponse.json({
      success: true,
      notification,
      message: "Notification received",
    });
  } catch (error) {
    console.error("Error processing notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return pending notifications
    const pending = [...notificationQueue];
    notificationQueue.length = 0; // Clear queue

    return NextResponse.json({
      notifications: pending,
      count: pending.length,
    });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
