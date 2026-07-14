export interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string;
  faviconUrl: string;
  isFavorite: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const RESOURCES: Resource[] = [
  { id: "r1", title: "Figma", url: "https://www.figma.com", description: "Collaborative design tool for building meaningful products together.", category: "Design", tags: "design,ui,ux,prototyping", faviconUrl: "https://www.google.com/s2/favicons?domain=www.figma.com&sz=64", isFavorite: false, order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r2", title: "Dribbble", url: "https://dribbble.com", description: "Discover the world's top designers & creatives.", category: "Design", tags: "design,inspiration,portfolio", faviconUrl: "https://www.google.com/s2/favicons?domain=dribbble.com&sz=64", isFavorite: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r3", title: "Coolors", url: "https://coolors.co", description: "Generate perfect color combinations for your designs.", category: "Design", tags: "design,colors,palette", faviconUrl: "https://www.google.com/s2/favicons?domain=coolors.co&sz=64", isFavorite: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r4", title: "Unsplash", url: "https://unsplash.com", description: "Beautiful, free images gifted by the world's most generous community.", category: "Assets", tags: "photos,images,free,stock", faviconUrl: "https://www.google.com/s2/favicons?domain=unsplash.com&sz=64", isFavorite: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r5", title: "Pexels", url: "https://www.pexels.com", description: "Free stock photos & videos shared by talented creators.", category: "Assets", tags: "photos,videos,free,stock", faviconUrl: "https://www.google.com/s2/favicons?domain=pexels.com&sz=64", isFavorite: false, order: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r6", title: "Icons8", url: "https://icons8.com", description: "Icons, photos, illustrations, and music — all free.", category: "Assets", tags: "icons,illustrations,music", faviconUrl: "https://www.google.com/s2/favicons?domain=icons8.com&sz=64", isFavorite: false, order: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r7", title: "LottieFiles", url: "https://lottiefiles.com", description: "Lightweight, scalable animations for web and mobile.", category: "Assets", tags: "animation,motion,lottie", faviconUrl: "https://www.google.com/s2/favicons?domain=lottiefiles.com&sz=64", isFavorite: false, order: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r8", title: "Tailwind CSS", url: "https://tailwindcss.com", description: "A utility-first CSS framework for rapid UI development.", category: "Development", tags: "css,framework,utility", faviconUrl: "https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64", isFavorite: false, order: 7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r9", title: "shadcn/ui", url: "https://ui.shadcn.com", description: "Beautifully designed components built with Radix and Tailwind CSS.", category: "Development", tags: "components,react,ui,tailwind", faviconUrl: "https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64", isFavorite: false, order: 8, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r10", title: "Vercel", url: "https://vercel.com", description: "Develop. Preview. Ship. The frontend cloud platform.", category: "Development", tags: "hosting,deployment,nextjs", faviconUrl: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64", isFavorite: false, order: 9, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r11", title: "Supabase", url: "https://supabase.com", description: "The open source Firebase alternative.", category: "Development", tags: "database,backend,auth", faviconUrl: "https://www.google.com/s2/favicons?domain=supabase.com&sz=64", isFavorite: false, order: 10, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r12", title: "ChatGPT", url: "https://chat.openai.com", description: "AI chatbot that can help you write, learn, and brainstorm.", category: "AI", tags: "ai,chat,openai,gpt", faviconUrl: "https://www.google.com/s2/favicons?domain=chat.openai.com&sz=64", isFavorite: false, order: 11, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r13", title: "Midjourney", url: "https://www.midjourney.com", description: "AI art generator that creates images from text descriptions.", category: "AI", tags: "ai,art,generation,image", faviconUrl: "https://www.google.com/s2/favicons?domain=midjourney.com&sz=64", isFavorite: false, order: 12, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r14", title: "Runway ML", url: "https://runwayml.com", description: "Next-generation video creation and editing powered by AI.", category: "AI", tags: "ai,video,editing,generation", faviconUrl: "https://www.google.com/s2/favicons?domain=runwayml.com&sz=64", isFavorite: false, order: 13, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r15", title: "Replicate", url: "https://replicate.com", description: "Run machine learning models in the cloud with a simple API.", category: "AI", tags: "ai,ml,models,api", faviconUrl: "https://www.google.com/s2/favicons?domain=replicate.com&sz=64", isFavorite: false, order: 14, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r16", title: "Notion", url: "https://www.notion.so", description: "All-in-one workspace for notes, docs, wikis, and project management.", category: "Productivity", tags: "notes,docs,wiki,project", faviconUrl: "https://www.google.com/s2/favicons?domain=notion.so&sz=64", isFavorite: false, order: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r17", title: "Linear", url: "https://linear.app", description: "Streamlined issue tracking and project management for teams.", category: "Productivity", tags: "project,management,issues,tracking", faviconUrl: "https://www.google.com/s2/favicons?domain=linear.app&sz=64", isFavorite: false, order: 16, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r18", title: "Raycast", url: "https://www.raycast.com", description: "Your shortcut to everything. A productivity tool for macOS.", category: "Productivity", tags: "productivity,macos,launcher", faviconUrl: "https://www.google.com/s2/favicons?domain=raycast.com&sz=64", isFavorite: false, order: 17, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r19", title: "Can I Use", url: "https://caniuse.com", description: "Browser support tables for modern web technologies.", category: "Reference", tags: "browser,support,compatibility", faviconUrl: "https://www.google.com/s2/favicons?domain=caniuse.com&sz=64", isFavorite: false, order: 18, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r20", title: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Resources for developers, by developers.", category: "Reference", tags: "docs,web,html,css,javascript", faviconUrl: "https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=64", isFavorite: false, order: 19, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r21", title: "CSS-Tricks", url: "https://css-tricks.com", description: "Daily articles about CSS, HTML, JavaScript, and front-end development.", category: "Reference", tags: "css,html,javascript,tutorials", faviconUrl: "https://www.google.com/s2/favicons?domain=css-tricks.com&sz=64", isFavorite: false, order: 20, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r22", title: "Google Fonts", url: "https://fonts.google.com", description: "Free and open source font families for web typography.", category: "Typography", tags: "fonts,free,google,web", faviconUrl: "https://www.google.com/s2/favicons?domain=fonts.google.com&sz=64", isFavorite: false, order: 21, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r23", title: "Fontshare", url: "https://www.fontshare.com", description: "Quality fonts, free. By Indian Type Foundry.", category: "Typography", tags: "fonts,free,quality,design", faviconUrl: "https://www.google.com/s2/favicons?domain=fontshare.com&sz=64", isFavorite: false, order: 22, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "r24", title: "Type Scale", url: "https://typescale.com", description: "A visual calculator for creating perfect typography.", category: "Typography", tags: "typography,calculator,scale", faviconUrl: "https://www.google.com/s2/favicons?domain=typescale.com&sz=64", isFavorite: false, order: 23, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export function getResources() {
  return RESOURCES;
}

export function getCategories() {
  return [...new Set(RESOURCES.map(r => r.category))];
}

export function getFonts() {
  return [];
}