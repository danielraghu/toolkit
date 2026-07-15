import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/fonts — list fonts (optional ?search= & ?source= filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const source = searchParams.get("source") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { family: { contains: search } },
      ];
    }
    if (source && source !== "All") {
      where.source = source;
    }

    const fonts = await db.font.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("GET /api/fonts error:", error);
    return NextResponse.json({ error: "Failed to fetch fonts" }, { status: 500 });
  }
}

// POST /api/fonts — add a font
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, family, source, variants, filePath } = body;

    if (!name?.trim() || !family?.trim()) {
      return NextResponse.json({ error: "Name and family are required" }, { status: 400 });
    }

    const validSources = ["google", "custom"];
    if (source && !validSources.includes(source)) {
      return NextResponse.json({ error: `Source must be one of: ${validSources.join(", ")}` }, { status: 400 });
    }

    // Check for duplicate
    const existing = await db.font.findFirst({ where: { family: family.trim() } });
    if (existing) {
      return NextResponse.json({ error: "Font already exists in your collection" }, { status: 409 });
    }

    const font = await db.font.create({
      data: {
        name: name.trim(),
        family: family.trim(),
        source: source || "google",
        variants: variants ? JSON.stringify(variants) : "[]",
        filePath: filePath || null,
      },
    });

    return NextResponse.json({ font }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fonts error:", error);
    return NextResponse.json({ error: "Failed to add font" }, { status: 500 });
  }
}

// PUT /api/fonts — update a font
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Font ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.family !== undefined) updateData.family = data.family.trim();
    if (data.source !== undefined) updateData.source = data.source;
    if (data.variants !== undefined) updateData.variants = typeof data.variants === "string" ? data.variants : JSON.stringify(data.variants);
    if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite;

    const font = await db.font.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ font });
  } catch (error) {
    console.error("PUT /api/fonts error:", error);
    return NextResponse.json({ error: "Failed to update font" }, { status: 500 });
  }
}

// DELETE /api/fonts?id=xxx — delete a font
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Font ID is required" }, { status: 400 });
    }

    await db.font.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/fonts error:", error);
    return NextResponse.json({ error: "Failed to delete font" }, { status: 500 });
  }
}