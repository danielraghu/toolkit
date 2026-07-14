import { getFonts } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ fonts: getFonts() });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Read-only in production" }, { status: 403 });
}

export async function PUT(req: NextRequest) {
  return NextResponse.json({ error: "Read-only in production" }, { status: 403 });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ error: "Read-only in production" }, { status: 403 });
}