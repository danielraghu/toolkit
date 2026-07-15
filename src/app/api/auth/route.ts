import { NextRequest, NextResponse } from "next/server";

// Simple password check against env variable
// Default password: "nem2026$$$"
const VALID_PASSWORD = process.env.TOOLKIT_PASSWORD || "nem2026$$$";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (password === VALID_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  } catch (error) {
    console.error("POST /api/auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}