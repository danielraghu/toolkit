import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const VALID_EXTS = [".ttf", ".otf", ".woff", ".woff2"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const files = formData.getAll("fonts[]");
    const name = (formData.get("name") as string)?.trim();
    const family = (formData.get("family") as string)?.trim();
    const variantsRaw = formData.get("variants") as string | null;

    if (!name || !family) {
      return NextResponse.json({ error: "Name and family are required" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No font files provided" }, { status: 400 });
    }

    // Check for duplicate family
    const existing = await db.font.findFirst({ where: { family } });
    if (existing) {
      return NextResponse.json({ error: "Font already exists in your collection" }, { status: 409 });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "fonts");
    await mkdir(uploadDir, { recursive: true });

    // Parse variant metadata
    let variantMeta: { filename: string; weight: number; style: string }[] = [];
    try {
      variantMeta = variantsRaw ? JSON.parse(variantsRaw) : [];
    } catch {}

    // Process each file
    const savedVariants: { weight: number; style: string; file: string }[] = [];
    let primaryFilePath: string | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File;
      if (!file || !file.name) continue;

      const ext = path.extname(file.name).toLowerCase();
      if (!VALID_EXTS.includes(ext)) {
        return NextResponse.json(
          { error: `Invalid file type: ${ext}. Allowed: ${VALID_EXTS.join(", ")}` },
          { status: 400 }
        );
      }

      const meta = variantMeta.find((v) => v.filename === file.name) || { weight: 400, style: "normal" };
      const fileName = `${family.replace(/\s+/g, "_")}_${meta.weight}_${meta.style}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const publicPath = `/uploads/fonts/${fileName}`;

      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      savedVariants.push({
        weight: meta.weight,
        style: meta.style,
        file: publicPath,
      });

      // Use 400-weight normal as primary file
      if (!primaryFilePath && meta.weight === 400 && meta.style === "normal") {
        primaryFilePath = publicPath;
      }
    }

    // Fallback: use first file as primary
    if (!primaryFilePath && savedVariants.length > 0) {
      primaryFilePath = savedVariants[0].file;
    }

    // Create database record
    const font = await db.font.create({
      data: {
        name,
        family,
        source: "custom",
        variants: JSON.stringify(savedVariants),
        filePath: primaryFilePath,
        isUploaded: true,
      },
    });

    return NextResponse.json({ font }, { status: 201 });
  } catch (error) {
    console.error("POST /api/fonts/upload error:", error);
    return NextResponse.json({ error: "Failed to upload font" }, { status: 500 });
  }
}