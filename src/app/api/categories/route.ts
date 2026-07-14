import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_CATEGORIES = [
  "Design",
  "Assets",
  "Development",
  "AI",
  "Productivity",
  "Reference",
  "Typography",
  "General",
];

async function ensureDefaultCategories() {
  const count = await db.category.count();
  if (count === 0) {
    for (const name of DEFAULT_CATEGORIES) {
      await db.category.create({ data: { name } });
    }
  }
}

// GET /api/categories — list all categories with resource counts
export async function GET() {
  try {
    await ensureDefaultCategories();

    const categories = await db.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Get resource counts per category
    const resourceCounts = await db.resource.groupBy({
      by: ["category"],
      _count: { category: true },
    });

    const countMap: Record<string, number> = {};
    for (const rc of resourceCounts) {
      countMap[rc.category] = rc._count.category;
    }

    const withCounts = categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: countMap[c.name] || 0,
    }));

    return NextResponse.json({ categories: withCounts });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories — add a new category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmed = name.trim();

    // Check for duplicates (case-insensitive)
    const existing = await db.category.findFirst({
      where: {
        name: { equals: trimmed, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    const category = await db.category.create({
      data: { name: trimmed },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// DELETE /api/categories?id=xxx — delete a category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const category = await db.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Reassign all resources in this category to "General"
    const general = await db.category.findFirst({
      where: { name: "General" },
    });
    if (!general) {
      await db.category.create({ data: { name: "General" } });
    }

    await db.resource.updateMany({
      where: { category: category.name },
      data: { category: "General" },
    });

    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}