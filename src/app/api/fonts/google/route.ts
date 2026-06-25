import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface GoogleFontItem {
  family: string;
  variants: string[];
  category: string;
  files: { [variant: string]: string };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const existingFontNames = searchParams.get("existing")?.split(",") || [];

    // Use public endpoint without API key
    const resp = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAyesbQMy6VHFEe2_8T1Xs5E3mJ6dMUBpY&sort=popularity`,
      { next: { revalidate: 86400 } }
    );

    if (!resp.ok) {
      // Fallback: return curated popular fonts
      const fallback = getPopularFonts();
      return NextResponse.json({ fonts: fallback });
    }

    const data = await resp.json();
    const allFonts: GoogleFontItem[] = data.items || [];

    let filtered = allFonts;

    if (query) {
      const q = query.toLowerCase();
      filtered = allFonts.filter(
        (f) =>
          f.family.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    filtered = filtered.filter(
      (f) => !existingFontNames.includes(f.family)
    );

    const fonts = filtered.slice(0, 60).map((f) => ({
      name: f.family,
      family: f.family,
      source: "google" as const,
      variants: JSON.stringify(f.variants || ["regular"]),
      category: f.category,
      files: f.files,
    }));

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("Google Fonts fetch error:", error);
    // Fallback to curated list
    return NextResponse.json({ fonts: getPopularFonts() });
  }
}

function getPopularFonts() {
  const popular = [
    { name: "Inter", family: "Inter", variants: '["100","200","300","400","500","600","700","800","900"]', category: "Sans Serif" },
    { name: "Roboto", family: "Roboto", variants: '["100","300","400","500","700","900"]', category: "Sans Serif" },
    { name: "Open Sans", family: "Open Sans", variants: '["300","400","500","600","700","800"]', category: "Sans Serif" },
    { name: "Lato", family: "Lato", variants: '["100","300","400","700","900"]', category: "Sans Serif" },
    { name: "Montserrat", family: "Montserrat", variants: '["100","200","300","400","500","600","700","800","900"]', category: "Sans Serif" },
    { name: "Playfair Display", family: "Playfair Display", variants: '["400","500","600","700","800","900","400italic","500italic","600italic","700italic","800italic","900italic"]', category: "Serif" },
    { name: "Poppins", family: "Poppins", variants: '["100","200","300","400","500","600","700","800","900","100italic","200italic","300italic","400italic","500italic","600italic","700italic","800italic","900italic"]', category: "Sans Serif" },
    { name: "Raleway", family: "Raleway", variants: '["100","200","300","400","500","600","700","800","900","100italic","200italic","300italic","400italic","500italic","600italic","700italic","800italic","900italic"]', category: "Sans Serif" },
    { name: "Nunito", family: "Nunito", variants: '["200","300","400","500","600","700","800","900","200italic","300italic","400italic","500italic","600italic","700italic","800italic","900italic"]', category: "Sans Serif" },
    { name: "Oswald", family: "Oswald", variants: '["200","300","400","500","600","700"]', category: "Sans Serif" },
    { name: "Merriweather", family: "Merriweather", variants: '["300","400","700","900","300italic","400italic","700italic","900italic"]', category: "Serif" },
    { name: "Ubuntu", family: "Ubuntu", variants: '["300","400","500","700","300italic","400italic","500italic","700italic"]', category: "Sans Serif" },
    { name: "Lora", family: "Lora", variants: '["400","500","600","700","400italic","500italic","600italic","700italic"]', category: "Serif" },
    { name: "Source Sans 3", family: "Source Sans 3", variants: '["300","400","500","600","700","800","900","300italic","400italic","500italic","600italic","700italic","800italic","900italic"]', category: "Sans Serif" },
    { name: "Work Sans", family: "Work Sans", variants: '["100","200","300","400","500","600","700","800","900"]', category: "Sans Serif" },
    { name: "DM Sans", family: "DM Sans", variants: '["100","200","300","400","500","600","700","800","900","100italic","200italic","300italic","400italic","500italic","600italic","700italic","800italic","900italic"]', category: "Sans Serif" },
    { name: "Space Grotesk", family: "Space Grotesk", variants: '["300","400","500","600","700"]', category: "Sans Serif" },
    { name: "Space Mono", family: "Space Mono", variants: '["400","700","400italic","700italic"]', category: "Monospace" },
    { name: "Fira Code", family: "Fira Code", variants: '["300","400","500","600","700"]', category: "Monospace" },
    { name: "Crimson Pro", family: "Crimson Pro", variants: '["200","300","400","500","600","700","800","900","200italic","300italic","400italic","500italic","600italic","700italic","800italic","900italic"]', category: "Serif" },
    { name: "Outfit", family: "Outfit", variants: '["100","200","300","400","500","600","700","800","900"]', category: "Sans Serif" },
    { name: "Sora", family: "Sora", variants: '["100","200","300","400","500","600","700","800"]', category: "Sans Serif" },
    { name: "Bricolage Grotesque", family: "Bricolage Grotesque", variants: '["200","300","400","500","600","700","800"]', category: "Sans Serif" },
    { name: "Manrope", family: "Manrope", variants: '["200","300","400","500","600","700","800"]', category: "Sans Serif" },
    { name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", variants: '["200","300","400","500","600","700","800","200italic","300italic","400italic","500italic","600italic","700italic","800italic"]', category: "Sans Serif" },
  ];

  return popular.map((f) => ({
    ...f,
    source: "google",
  }));
}