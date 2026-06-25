import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("font") as File | null;
    const name = formData.get("name") as string | null;
    const family = formData.get("family") as string | null;
    const variantsStr = formData.get("variants") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!name || !family) {
      return NextResponse.json(
        { error: "Name and family are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "fonts");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".ttf";
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    let variants: string[] = [];
    if (variantsStr) {
      try {
        variants = JSON.parse(variantsStr);
      } catch {
        variants = ["Regular"];
      }
    } else {
      variants = ["Regular"];
    }

    const font = await db.font.create({
      data: {
        name,
        family,
        source: "custom",
        variants: JSON.stringify(variants),
        filePath: `/uploads/fonts/${fileName}`,
        isUploaded: true,
      },
    });

    return NextResponse.json(font, { status: 201 });
  } catch (error) {
    console.error("Font upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload font" },
      { status: 500 }
    );
  }
}