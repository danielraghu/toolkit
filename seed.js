const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const RESOURCES = [
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

async function seed() {
  const count = await prisma.resource.count();
  if (count > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  for (let i = 0; i < RESOURCES.length; i++) {
    const r = RESOURCES[i];
    let hostname = "";
    try { hostname = new URL(r.url).hostname; } catch { hostname = r.url; }
    await prisma.resource.create({
      data: {
        title: r.title,
        url: r.url,
        description: r.description,
        category: r.category,
        tags: r.tags,
        faviconUrl: "https://www.google.com/s2/favicons?domain=" + hostname + "&sz=64",
        order: i,
      },
    });
    console.log("  Added: " + r.title);
  }

  console.log("\n✅ Seeded " + RESOURCES.length + " resources.");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());