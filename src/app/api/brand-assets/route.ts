import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/brand-assets — list brand assets (optional ?type= filter)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};
    if (type && type !== "all") {
      where.type = type;
    }

    const assets = await db.brandAsset.findMany({
      where,
      orderBy: [{ type: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("GET /api/brand-assets error:", error);
    return NextResponse.json({ error: "Failed to fetch brand assets" }, { status: 500 });
  }
}

// POST /api/brand-assets — create a new brand asset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, value, metadata, order } = body;

    if (!type || !name?.trim()) {
      return NextResponse.json({ error: "Type and name are required" }, { status: 400 });
    }

    const validTypes = ["logo", "font", "color", "gradient", "pdf"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
    }

    // Get max order for this type
    const maxOrder = await db.brandAsset.findFirst({
      where: { type },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const asset = await db.brandAsset.create({
      data: {
        type,
        name: name.trim(),
        value: value || "",
        metadata: metadata ? JSON.stringify(metadata) : "{}",
        order: order ?? (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("POST /api/brand-assets error:", error);
    return NextResponse.json({ error: "Failed to create brand asset" }, { status: 500 });
  }
}

// PUT /api/brand-assets — update a brand asset
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.value !== undefined) updateData.value = data.value;
    if (data.metadata !== undefined) updateData.metadata = typeof data.metadata === "string" ? data.metadata : JSON.stringify(data.metadata);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.order !== undefined) updateData.order = data.order;

    const asset = await db.brandAsset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("PUT /api/brand-assets error:", error);
    return NextResponse.json({ error: "Failed to update brand asset" }, { status: 500 });
  }
}

// DELETE /api/brand-assets?id=xxx — delete a brand asset
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    await db.brandAsset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/brand-assets error:", error);
    return NextResponse.json({ error: "Failed to delete brand asset" }, { status: 500 });
  }
}