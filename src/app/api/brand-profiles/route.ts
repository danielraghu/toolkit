import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/brand-profiles — list all brand profiles
export async function GET() {
  try {
    const profiles = await db.brandProfile.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { assets: true } },
      },
    });
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("GET /api/brand-profiles error:", error);
    return NextResponse.json({ error: "Failed to fetch brand profiles" }, { status: 500 });
  }
}

// POST /api/brand-profiles — create a brand profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, primaryLogo } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const maxOrder = await db.brandProfile.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const profile = await db.brandProfile.create({
      data: {
        name: name.trim(),
        primaryLogo: primaryLogo || "",
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("POST /api/brand-profiles error:", error);
    return NextResponse.json({ error: "Failed to create brand profile" }, { status: 500 });
  }
}

// PUT /api/brand-profiles — update a brand profile
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, primaryLogo } = body;

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (primaryLogo !== undefined) updateData.primaryLogo = primaryLogo;

    const profile = await db.brandProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("PUT /api/brand-profiles error:", error);
    return NextResponse.json({ error: "Failed to update brand profile" }, { status: 500 });
  }
}

// DELETE /api/brand-profiles?id=xxx — delete a brand profile (assets become orphaned)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    // Set all assets' profileId to null first
    await db.brandAsset.updateMany({
      where: { profileId: id },
      data: { profileId: null },
    });

    await db.brandProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/brand-profiles error:", error);
    return NextResponse.json({ error: "Failed to delete brand profile" }, { status: 500 });
  }
}