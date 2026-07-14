import { getResources, getCategories } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const favorites = searchParams.get("favorites");

  let resources = getResources();

  if (category && category !== "All") {
    resources = resources.filter(r => r.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    resources = resources.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.toLowerCase().includes(q) ||
      r.url.toLowerCase().includes(q)
    );
  }

  if (favorites === "true") {
    resources = resources.filter(r => r.isFavorite);
  }

  return NextResponse.json({
    resources,
    categories: getCategories(),
  });
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