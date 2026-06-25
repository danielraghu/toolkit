import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const source = searchParams.get("source");

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
    return NextResponse.json({ error: "Failed to fetch fonts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, family, source, variants } = body;

    if (!name || !family) {
      return NextResponse.json(
        { error: "Name and family are required" },
        { status: 400 }
      );
    }

    const font = await db.font.create({
      data: {
        name,
        family,
        source: source || "google",
        variants: JSON.stringify(variants || []),
      },
    });

    return NextResponse.json(font, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create font" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (data.variants && typeof data.variants === "object") {
      data.variants = JSON.stringify(data.variants);
    }

    const font = await db.font.update({
      where: { id },
      data,
    });

    return NextResponse.json(font);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update font" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const font = await db.font.findUnique({ where: { id } });
    if (font?.filePath) {
      const fs = await import("fs/promises");
      try {
        await fs.unlink(font.filePath);
      } catch {
        // file might not exist
      }
    }

    await db.font.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete font" },
      { status: 500 }
    );
  }
}