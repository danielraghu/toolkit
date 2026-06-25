import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const favorites = searchParams.get("favorites");

    const where: Record<string, unknown> = {};

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { url: { contains: search } },
      ];
    }

    if (favorites === "true") {
      where.isFavorite = true;
    }

    const resources = await db.resource.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const categories = await db.resource.findMany({
      distinct: ["category"],
      select: { category: true },
    });

    return NextResponse.json({
      resources,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, url, description, category, tags, faviconUrl } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    const resource = await db.resource.create({
      data: {
        title,
        url,
        description: description || "",
        category: category || "General",
        tags: tags || "",
        faviconUrl: faviconUrl || null,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create resource" },
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

    const resource = await db.resource.update({
      where: { id },
      data,
    });

    return NextResponse.json(resource);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update resource" },
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

    await db.resource.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}