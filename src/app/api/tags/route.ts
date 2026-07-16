import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tags — return all unique tags (from Tag model + resources)
export async function GET() {
  try {
    // Get standalone tags
    const tagRecords = await db.tag.findMany({ orderBy: { createdAt: "asc" } });
    const standaloneTags = tagRecords.map((t) => t.name.toLowerCase());

    // Get tags from resources
    const resources = await db.resource.findMany({ select: { tags: true } });
    const resourceTags = new Set<string>();
    for (const r of resources) {
      if (r.tags) {
        for (const t of r.tags.split(",")) {
          const trimmed = t.trim().toLowerCase();
          if (trimmed) resourceTags.add(trimmed);
        }
      }
    }

    // Merge and deduplicate
    const allTags = new Set([...standaloneTags, ...resourceTags]);

    return NextResponse.json({ tags: Array.from(allTags).sort() });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

// POST /api/tags — create a new standalone tag
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tag } = body;

    if (!tag?.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const name = tag.trim().toLowerCase();

    // Check if tag already exists (in Tag model or in any resource)
    const existing = await db.tag.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
    }

    // Also check if any resource already has this tag
    const resourcesWithTag = await db.resource.findMany({
      where: { tags: { contains: name } },
      select: { tags: true },
    });
    for (const r of resourcesWithTag) {
      const tags = r.tags.split(",").map((t: string) => t.trim().toLowerCase());
      if (tags.includes(name)) {
        return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
      }
    }

    await db.tag.create({ data: { name } });

    return NextResponse.json({ tag: name }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tags error:", error);
    return NextResponse.json({ error: "Failed to add tag" }, { status: 500 });
  }
}

// DELETE /api/tags?tag=xxx — delete a tag (from Tag model + remove from all resources)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");

    if (!tag) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const name = tag.trim().toLowerCase();

    // Delete from Tag model if it exists
    try {
      await db.tag.delete({ where: { name } });
    } catch {
      // Tag doesn't exist in model, that's fine
    }

    // Remove from all resources
    const resources = await db.resource.findMany({
      where: { tags: { contains: name } },
    });

    for (const r of resources) {
      const tags = r.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t.toLowerCase() !== name);
      await db.resource.update({
        where: { id: r.id },
        data: { tags: tags.join(", ") },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tags error:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}