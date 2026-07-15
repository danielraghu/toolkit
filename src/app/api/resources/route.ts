import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Auto-seed helper: if DB is empty, seed it with initial resources
const INITIAL_RESOURCES = [
  { title: "Figma", url: "https://www.figma.com", description: "Collaborative design tool for building meaningful products together.", category: "Design", tags: "design,ui,ux,prototyping" },
  { title: "Dribbble", url: "https://dribbble.com", description: "Discover the world's top designers & creatives.", category: "Design", tags: "design,inspiration,portfolio" },
  { title: "Coolors", url: "https://coolors.co", description: "Generate perfect color combinations for your designs.", category: "Design", tags: "design,colors,palette" },
  { title: "Unsplash", url: "https://unsplash.com", description: "Beautiful, free images gifted by the world's most generous community.", category: "Assets", tags: "photos,images,free,stock" },
  { title: "Pexels", url: "https://www.pexels.com", description: "Free stock photos & videos shared by talented creators.", category: "Assets", tags: "photos,videos,free,stock" },
  { title: "Icons8", url: "https://icons8.com", description: "Icons, photos, illustrations, and music — all free.", category: "Assets", tags: "icons,illustrations,music" },
  { title: "LottieFiles", url: "https://lottiefiles.com", description: "Lightweight, scalable animations for web and mobile.", category: "Assets", tags: "animation,motion,lottie" },
  { title: "Tailwind CSS", url: "https://tailwindcss.com", description: "A utility-first CSS framework for rapid UI development.", category: "Development", tags: "css,framework,utility" },
  { title: "shadcn/ui", url: "https://ui.shadcn.com", description: "Beautifully designed components built with Radix and Tailwind CSS.", category: "Development", tags: "components,react,ui,tailwind" },
  { title: "Vercel", url: "https://vercel.com", description: "Develop. Preview. Ship. The frontend cloud platform.", category: "Development", tags: "hosting,deployment,nextjs" },
  { title: "Supabase", url: "https://supabase.com", description: "The open source Firebase alternative.", category: "Development", tags: "database,backend,auth" },
  { title: "ChatGPT", url: "https://chat.openai.com", description: "AI chatbot that can help you write, learn, and brainstorm.", category: "AI", tags: "ai,chat,openai,gpt" },
  { title: "Midjourney", url: "https://www.midjourney.com", description: "AI art generator that creates images from text descriptions.", category: "AI", tags: "ai,art,generation,image" },
  { title: "Runway ML", url: "https://runwayml.com", description: "Next-generation video creation and editing powered by AI.", category: "AI", tags: "ai,video,editing,generation" },
  { title: "Replicate", url: "https://replicate.com", description: "Run machine learning models in the cloud with a simple API.", category: "AI", tags: "ai,ml,models,api" },
  { title: "Notion", url: "https://www.notion.so", description: "All-in-one workspace for notes, docs, wikis, and project management.", category: "Productivity", tags: "notes,docs,wiki,project" },
  { title: "Linear", url: "https://linear.app", description: "Streamlined issue tracking and project management for teams.", category: "Productivity", tags: "project,management,issues,tracking" },
  { title: "Raycast", url: "https://www.raycast.com", description: "Your shortcut to everything. A productivity tool for macOS.", category: "Productivity", tags: "productivity,macos,launcher" },
  { title: "Can I Use", url: "https://caniuse.com", description: "Browser support tables for modern web technologies.", category: "Reference", tags: "browser,support,compatibility" },
  { title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Resources for developers, by developers.", category: "Reference", tags: "docs,web,html,css,javascript" },
  { title: "CSS-Tricks", url: "https://css-tricks.com", description: "Daily articles about CSS, HTML, JavaScript, and front-end development.", category: "Reference", tags: "css,html,javascript,tutorials" },
  { title: "Google Fonts", url: "https://fonts.google.com", description: "Free and open source font families for web typography.", category: "Typography", tags: "fonts,free,google,web" },
  { title: "Fontshare", url: "https://www.fontshare.com", description: "Quality fonts, free. By Indian Type Foundry.", category: "Typography", tags: "fonts,free,quality,design" },
  { title: "Type Scale", url: "https://typescale.com", description: "A visual calculator for creating perfect typography.", category: "Typography", tags: "typography,calculator,scale" },
];

async function ensureSeeded() {
  const count = await db.resource.count();
  if (count === 0) {
    for (let i = 0; i < INITIAL_RESOURCES.length; i++) {
      const r = INITIAL_RESOURCES[i];
      let hostname = r.url;
      try { hostname = new URL(r.url).hostname; } catch {}
      await db.resource.create({
        data: {
          title: r.title,
          url: r.url,
          description: r.description,
          category: r.category,
          tags: r.tags,
          faviconUrl: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
          order: i,
        },
      });
    }
  }
}

const DEFAULT_CATEGORIES = ["Design","Assets","Development","AI","Productivity","Reference","Typography","General"];

async function ensureCategories() {
  const count = await db.category.count();
  if (count === 0) {
    for (const name of DEFAULT_CATEGORIES) {
      await db.category.create({ data: { name } });
    }
  }
}

// GET /api/resources — list resources with filtering
export async function GET(req: NextRequest) {
  try {
    await ensureSeeded();
    await ensureCategories();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const favorites = searchParams.get("favorites");
    const tag = searchParams.get("tag");

    const where: Record<string, unknown> = {};

    if (category && category !== "All") {
      where.category = category;
    }

    if (favorites === "true") {
      where.isFavorite = true;
    }

    // Tag filter: match the exact tag within the comma-separated tags string
    if (tag) {
      where.tags = { contains: tag };
    }

    if (search) {
      const searchConditions = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { url: { contains: search } },
      ];
      if (where.tags) {
        // Combine tag filter with search OR conditions
        where.AND = [
          { tags: where.tags },
          { OR: searchConditions },
        ];
        delete where.tags;
      } else {
        where.OR = searchConditions;
      }
    }

    const resources = await db.resource.findMany({
      where,
      orderBy: { order: "asc" },
    });

    // Get categories from the Category model
    const dbCategories = await db.category.findMany({
      orderBy: { createdAt: "asc" },
      select: { name: true },
    });
    const categories = dbCategories.map(c => c.name);

    // Extract all unique tags from resources
    const allTags = new Set<string>();
    for (const r of resources) {
      if (r.tags) {
        for (const t of r.tags.split(",")) {
          const trimmed = t.trim().toLowerCase();
          if (trimmed) allTags.add(trimmed);
        }
      }
    }

    return NextResponse.json({ resources, categories, allTags: Array.from(allTags).sort() });
  } catch (error) {
    console.error("GET /api/resources error:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

// POST /api/resources — create a new resource
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, url, description, category, tags, faviconUrl } = body;

    if (!title?.trim() || !url?.trim()) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    // Get the max order to append at the end
    const maxOrder = await db.resource.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    let finalFavicon = faviconUrl;
    if (!finalFavicon) {
      let hostname = url;
      try { hostname = new URL(url).hostname; } catch {}
      finalFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    }

    const resource = await db.resource.create({
      data: {
        title: title.trim(),
        url: url.trim(),
        description: description?.trim() || null,
        category: category || "General",
        tags: tags?.trim() || "",
        faviconUrl: finalFavicon,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("POST /api/resources error:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}

// PUT /api/resources — update a resource
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
    }

    // Build update payload — only include fields that are provided
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.url !== undefined) {
      updateData.url = data.url.trim();
      if (!data.faviconUrl) {
        let hostname = data.url;
        try { hostname = new URL(data.url).hostname; } catch {}
        updateData.faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      }
    }
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags?.trim() || "";
    if (data.faviconUrl !== undefined) updateData.faviconUrl = data.faviconUrl;
    if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite;
    if (data.order !== undefined) updateData.order = data.order;

    const resource = await db.resource.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("PUT /api/resources error:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

// DELETE /api/resources?id=xxx — delete a resource
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
    }

    await db.resource.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/resources error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}