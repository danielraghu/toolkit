"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Search,
  Plus,
  ExternalLink,
  Star,
  Trash2,
  Edit3,
  X,
  Link2,
  Type,
  Upload,
  ChevronDown,
  Grid3X3,
  List,
  Heart,
  Bookmark,
  Filter,
  Globe,
  FolderOpen,
  MoreHorizontal,
  Copy,
  Check,
  Download,
  Eye,
  Package,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// ===================== TYPES =====================

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  tags: string;
  faviconUrl: string | null;
  isFavorite: boolean;
  order: number;
  createdAt: string;
}

interface FontVariant {
  weight: number;
  style: string;
  label: string;
}

interface FontItem {
  id: string;
  name: string;
  family: string;
  source: string;
  variants: string;
  filePath: string | null;
  isUploaded: boolean;
  isFavorite: boolean;
  createdAt: string;
}

interface GoogleFontResult {
  name: string;
  family: string;
  source: string;
  variants: string;
  category: string;
  files?: Record<string, string>;
}

// ===================== ICON HELPER =====================

function getCategoryIcon(category: string) {
  switch (category) {
    case "Design":
      return "🎨";
    case "Assets":
      return "📦";
    case "Development":
      return "💻";
    case "AI":
      return "🤖";
    case "Productivity":
      return "⚡";
    case "Reference":
      return "📖";
    case "Typography":
      return "🔤";
    default:
      return "🔗";
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Design":
      return "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300";
    case "Assets":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
    case "Development":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    case "AI":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300";
    case "Productivity":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300";
    case "Reference":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    case "Typography":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

// ===================== MAIN APP =====================

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("resources");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">ToolKit</h1>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle theme</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* TAB BAR */}
        <div className="border-b border-border/40 bg-background/60 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-12 p-0 gap-0">
                <TabsTrigger
                  value="resources"
                  className="relative h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground transition-colors"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  value="fonts"
                  className="relative h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground transition-colors"
                >
                  <Type className="w-4 h-4 mr-2" />
                  Fonts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "resources" ? (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ResourcesSection />
              </motion.div>
            ) : (
              <motion.div
                key="fonts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <FontsSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm mt-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>ToolKit — Resources & Fonts Hub</span>
            <span>Built with Next.js & shadcn/ui</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

// ===================== RESOURCES SECTION =====================

function ResourcesSection() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Resource | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formTags, setFormTags] = useState("");

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.set("category", activeCategory);
      if (search) params.set("search", search);
      if (showFavorites) params.set("favorites", "true");

      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setCategories(data.categories || []);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, showFavorites]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formUrl.trim()) {
      toast.error("Title and URL are required");
      return;
    }

    try {
      let url = formUrl.trim();
      if (!url.startsWith("http")) url = `https://${url}`;

      const body = {
        title: formTitle.trim(),
        url,
        description: formDesc.trim(),
        category: formCategory,
        tags: formTags.trim(),
        faviconUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
      };

      if (editItem) {
        await fetch("/api/resources", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editItem.id, ...body }),
        });
        toast.success("Resource updated");
      } else {
        await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Resource added");
      }

      setDialogOpen(false);
      resetForm();
      fetchResources();
    } catch {
      toast.error("Failed to save resource");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/resources?id=${id}`, { method: "DELETE" });
      toast.success("Resource deleted");
      fetchResources();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleFavorite = async (r: Resource) => {
    try {
      await fetch("/api/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, isFavorite: !r.isFavorite }),
      });
      fetchResources();
    } catch {
      toast.error("Failed to update");
    }
  };

  const openEdit = (r: Resource) => {
    setEditItem(r);
    setFormTitle(r.title);
    setFormUrl(r.url);
    setFormDesc(r.description || "");
    setFormCategory(r.category);
    setFormTags(r.tags);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditItem(null);
    resetForm();
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditItem(null);
    setFormTitle("");
    setFormUrl("");
    setFormDesc("");
    setFormCategory("General");
    setFormTags("");
  };

  const allCategories = ["All", ...categories];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resource Library</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {resources.length} resources in your collection
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Resource
        </Button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavorites(!showFavorites)}
            className="gap-1.5 h-10"
          >
            <Heart className={`w-3.5 h-3.5 ${showFavorites ? "fill-current" : ""}`} />
            Favorites
          </Button>
        </div>
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat !== "All" && <span className="text-xs">{getCategoryIcon(cat)}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No resources found</h3>
          <p className="text-sm text-muted-foreground">
            {showFavorites
              ? "You haven't favorited any resources yet"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              onFavorite={() => toggleFavorite(r)}
              onEdit={() => openEdit(r)}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </div>
      )}

      {/* ADD/EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Resource" : "Add Resource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g. Figma"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL *</label>
              <Input
                placeholder="https://example.com"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of this resource..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Design", "Assets", "Development", "AI", "Productivity", "Reference", "Typography", "General"].map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {getCategoryIcon(c)} {c}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input
                placeholder="design, ui, free (comma separated)"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editItem ? "Save Changes" : "Add Resource"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================== RESOURCE CARD =====================

function ResourceCard({
  resource,
  onFavorite,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  onFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hostname = (() => {
    try { return new URL(resource.url).hostname; } catch { return resource.url; }
  })();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-200 hover:border-foreground/20 h-full flex flex-col">
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex items-start gap-3 flex-1">
            {/* FAVICON */}
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {resource.faviconUrl ? (
                <img
                  src={resource.faviconUrl}
                  alt=""
                  className="w-6 h-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg">${getCategoryIcon(resource.category)}</span>`;
                  }}
                />
              ) : (
                <span className="text-lg">{getCategoryIcon(resource.category)}</span>
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-sm truncate">{resource.title}</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                  className="flex-shrink-0"
                >
                  <Star
                    className={`w-3.5 h-3.5 transition-colors ${
                      resource.isFavorite
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40 hover:text-amber-400"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{hostname}</p>
              <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-2 min-h-[2.5rem]">
                {resource.description || "\u00A0"}
              </p>
              <div className="flex items-center gap-2 overflow-hidden">
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-2 py-0 h-5 font-medium shrink-0 ${getCategoryColor(resource.category)}`}
                >
                  {resource.category}
                </Badge>
                {resource.tags &&
                  resource.tags.split(",").slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-muted-foreground/60 truncate"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-1 flex-shrink-0" ref={menuRef}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Visit site</TooltipContent>
              </Tooltip>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden"
                    >
                      <button
                        onClick={() => { setShowMenu(false); onEdit(); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-secondary transition-colors text-left"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => { setShowMenu(false); onDelete(); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===================== FONTS SECTION =====================

function FontsSection() {
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontItem | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewText, setPreviewText] = useState(
    "The quick brown fox jumps over the lazy dog"
  );
  const [previewSize, setPreviewSize] = useState(48);
  const [showUpload, setShowUpload] = useState(false);
  const [showGoogleBrowser, setShowGoogleBrowser] = useState(false);
  const [googleFonts, setGoogleFonts] = useState<GoogleFontResult[]>([]);
  const [googleSearch, setGoogleSearch] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loadedFontFamilies, setLoadedFontFamilies] = useState<Set<string>>(
    new Set()
  );
  const [filterSource, setFilterSource] = useState("All");
  const [uploadName, setUploadName] = useState("");
  const [uploadFamily, setUploadFamily] = useState("");

  const fetchFonts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterSource !== "All") params.set("source", filterSource);
      const res = await fetch(`/api/fonts?${params}`);
      const data = await res.json();
      setFonts(data.fonts || []);
    } catch {
      toast.error("Failed to load fonts");
    } finally {
      setLoading(false);
    }
  }, [search, filterSource]);

  useEffect(() => {
    fetchFonts();
  }, [fetchFonts]);

  // Load Google Font when a font is selected
  useEffect(() => {
    if (!selectedFont) return;

    if (selectedFont.source === "google") {
      if (!loadedFontFamilies.has(selectedFont.family)) {
        const link = document.createElement("link");
        link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.family.replace(/ /g, "+")}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
        setLoadedFontFamilies((prev) => new Set(prev).add(selectedFont.family));
      }
    } else if (selectedFont.source === "custom" && selectedFont.filePath) {
      if (!loadedFontFamilies.has(selectedFont.family)) {
        const style = document.createElement("style");
        style.textContent = `
          @font-face {
            font-family: '${selectedFont.family}';
            src: url('${selectedFont.filePath}') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(style);
        setLoadedFontFamilies((prev) => new Set(prev).add(selectedFont.family));
      }
    }
  }, [selectedFont, loadedFontFamilies]);

  // Fetch Google Fonts for browser
  const fetchGoogleFonts = async (q: string = "") => {
    try {
      setGoogleLoading(true);
      const existingNames = fonts
        .filter((f) => f.source === "google")
        .map((f) => f.family)
        .join(",");
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (existingNames) params.set("existing", existingNames);
      const res = await fetch(`/api/fonts/google?${params}`);
      const data = await res.json();
      setGoogleFonts(data.fonts || []);
    } catch {
      toast.error("Failed to fetch Google Fonts");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (showGoogleBrowser) fetchGoogleFonts();
  }, [showGoogleBrowser]);

  const addGoogleFont = async (gf: GoogleFontResult) => {
    try {
      const res = await fetch("/api/fonts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: gf.name,
          family: gf.family,
          source: "google",
          variants: gf.variants,
        }),
      });
      const font = await res.json();
      setFonts((prev) => [font, ...prev]);
      toast.success(`Added "${gf.family}" to your collection`);
    } catch {
      toast.error("Failed to add font");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploadName.trim() || !uploadFamily.trim()) {
      toast.error("Please enter font name and family");
      return;
    }

    const formData = new FormData();
    formData.append("font", file);
    formData.append("name", uploadName.trim());
    formData.append("family", uploadFamily.trim());

    try {
      const res = await fetch("/api/fonts/upload", {
        method: "POST",
        body: formData,
      });
      const font = await res.json();
      if (res.ok) {
        setFonts((prev) => [font, ...prev]);
        toast.success(`Uploaded "${uploadFamily}"`);
        setShowUpload(false);
        setUploadName("");
        setUploadFamily("");
      } else {
        toast.error(font.error || "Upload failed");
      }
    } catch {
      toast.error("Failed to upload font");
    }

    e.target.value = "";
  };

  const handleDeleteFont = async (id: string) => {
    try {
      await fetch(`/api/fonts?id=${id}`, { method: "DELETE" });
      setFonts((prev) => prev.filter((f) => f.id !== id));
      if (selectedFont?.id === id) setSelectedFont(null);
      toast.success("Font removed");
    } catch {
      toast.error("Failed to delete font");
    }
  };

  const parseVariants = (variantsStr: string): FontVariant[] => {
    try {
      const raw: string[] = JSON.parse(variantsStr);
      return raw.map((v) => {
        let weight = 400;
        let style = "normal";
        let label = v;

        if (v.includes("italic")) style = "italic";
        const num = v.match(/\d+/);
        if (num) weight = parseInt(num[0]);

        const weightLabels: Record<number, string> = {
          100: "Thin",
          200: "Extra Light",
          300: "Light",
          400: "Regular",
          500: "Medium",
          600: "Semi Bold",
          700: "Bold",
          800: "Extra Bold",
          900: "Black",
        };

        label = weightLabels[weight] || `Weight ${weight}`;
        if (style === "italic") label += " Italic";

        return { weight, style, label };
      });
    } catch {
      return [{ weight: 400, style: "normal", label: "Regular" }];
    }
  };

  const variants = selectedFont ? parseVariants(selectedFont.variants) : [];
  const uniqueWeights = [...new Set(variants.map((v) => v.weight))].sort(
    (a, b) => a - b
  );
  const variantCount = new Set(
    variants.map((v) => `${v.weight}-${v.style}`)
  ).size;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Font Library</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {fonts.length} fonts in your collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowGoogleBrowser(!showGoogleBrowser)}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            Browse Google Fonts
          </Button>
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Font
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Upload Custom Font</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload .ttf or .otf file
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-md text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      className="hidden"
                      onChange={handleUpload}
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    placeholder="e.g. My Custom Font"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CSS Font Family</label>
                  <Input
                    placeholder="e.g. MyCustomFont"
                    value={uploadFamily}
                    onChange={(e) => setUploadFamily(e.target.value)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* GOOGLE FONTS BROWSER */}
      <AnimatePresence>
        {showGoogleBrowser && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Browse Google Fonts</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowGoogleBrowser(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Google Fonts..."
                    value={googleSearch}
                    onChange={(e) => {
                      setGoogleSearch(e.target.value);
                      fetchGoogleFonts(e.target.value);
                    }}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-72">
                  {googleLoading ? (
                    <div className="space-y-3 p-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3">
                          <div>
                            <Skeleton className="h-5 w-40 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : googleFonts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No fonts found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {googleFonts.map((gf) => (
                        <div
                          key={gf.family}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <div>
                            <p
                              className="text-lg font-medium"
                              style={{
                                fontFamily: `'${gf.family}', sans-serif`,
                              }}
                            >
                              {gf.family}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {gf.category} · {JSON.parse(gf.variants).length}{" "}
                              variants
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addGoogleFont(gf)}
                            className="flex-shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-36 h-10">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sources</SelectItem>
            <SelectItem value="google">Google Fonts</SelectItem>
            <SelectItem value="custom">Uploaded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* FONT LIST + PREVIEW */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* FONT LIST */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="border border-border/60 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-border/40 bg-secondary/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Fonts
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
              {loading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="w-8 h-8 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : fonts.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Type className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No fonts yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Browse Google Fonts or upload your own
                  </p>
                </div>
              ) : (
                <div>
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFont(f)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors border-b border-border/20 last:border-b-0 ${
                        selectedFont?.id === f.id ? "bg-secondary" : ""
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-lg flex-shrink-0"
                        style={{
                          fontFamily: `'${f.family}', sans-serif`,
                        }}
                      >
                        Aa
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {f.source}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50">
                            ·
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {(() => {
                              try {
                                return JSON.parse(f.variants).length;
                              } catch {
                                return 0;
                              }
                            })()}{" "}
                            variants
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFont(f.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                        style={{ opacity: undefined }}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground/40 hover:text-destructive" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* PREVIEW PANEL */}
        <div className="flex-1 min-w-0">
          {!selectedFont ? (
            <div className="border border-border/60 rounded-xl h-[calc(100vh-380px)] min-h-[300px] flex items-center justify-center">
              <div className="text-center px-4">
                <Eye className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  Select a font to preview
                </h3>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Choose a font from the list to see how it looks
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              {/* FONT HEADER */}
              <div className="p-5 border-b border-border/40 bg-secondary/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: `'${selectedFont.family}', sans-serif`,
                      }}
                    >
                      {selectedFont.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {selectedFont.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {variantCount} variant{variantCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `font-family: '${selectedFont.family}', sans-serif;`
                          );
                          toast.success("CSS copied to clipboard!");
                        }}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy CSS</TooltipContent>
                  </Tooltip>
                </div>

                {/* VARIANTS LIST */}
                <div className="flex flex-wrap gap-1.5">
                  {uniqueWeights.map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-background border border-border text-[10px] font-medium text-muted-foreground"
                    >
                      {(() => {
                        const labels: Record<number, string> = {
                          100: "Thin",
                          200: "ExtraLight",
                          300: "Light",
                          400: "Regular",
                          500: "Medium",
                          600: "SemiBold",
                          700: "Bold",
                          800: "ExtraBold",
                          900: "Black",
                        };
                        return labels[w] || `${w}`;
                      })()}
                    </span>
                  ))}
                </div>
              </div>

              {/* PREVIEW CONTROLS */}
              <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="Type your own preview text..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Size
                  </span>
                  <Input
                    type="number"
                    value={previewSize}
                    onChange={(e) => setPreviewSize(parseInt(e.target.value) || 16)}
                    className="w-16 h-9 text-sm text-center"
                    min={8}
                    max={200}
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              </div>

              {/* PREVIEW AREA */}
              <ScrollArea className="h-[calc(100vh-580px)] min-h-[250px]">
                <div className="p-6 space-y-8">
                  {/* WATERFALL PREVIEW */}
                  {uniqueWeights.map((w) => {
                    const labels: Record<number, string> = {
                      100: "Thin",
                      200: "Extra Light",
                      300: "Light",
                      400: "Regular",
                      500: "Medium",
                      600: "Semi Bold",
                      700: "Bold",
                      800: "Extra Bold",
                      900: "Black",
                    };
                    const label = labels[w] || `Weight ${w}`;
                    const hasItalic = variants.some(
                      (v) => v.weight === w && v.style === "italic"
                    );

                    return (
                      <div key={w}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {label} ({w})
                          </span>
                          {hasItalic && (
                            <span className="text-[10px] text-muted-foreground/50">
                              · Italic available
                            </span>
                          )}
                        </div>
                        <p
                          className="leading-tight break-words text-foreground/90"
                          style={{
                            fontFamily: `'${selectedFont.family}', sans-serif`,
                            fontWeight: w,
                            fontSize: `${Math.min(previewSize, 96)}px`,
                          }}
                        >
                          {previewText}
                        </p>
                        {hasItalic && (
                          <p
                            className="leading-tight break-words text-foreground/70 mt-1"
                            style={{
                              fontFamily: `'${selectedFont.family}', sans-serif`,
                              fontWeight: w,
                              fontStyle: "italic",
                              fontSize: `${Math.min(previewSize * 0.75, 72)}px`,
                            }}
                          >
                            {previewText}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* ALPHABET PREVIEW */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Alphabet & Numbers
                    </p>
                    <p
                      className="text-2xl leading-relaxed break-words text-foreground/80"
                      style={{
                        fontFamily: `'${selectedFont.family}', sans-serif`,
                        fontWeight: 400,
                      }}
                    >
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                      <br />
                      abcdefghijklmnopqrstuvwxyz
                      <br />
                      0123456789
                      <br />
                      !@#$%^&*()_+-=[]{}|;':&quot;,./&lt;&gt;?
                    </p>
                  </div>

                  {/* PARAGRAPH PREVIEW */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Paragraph
                    </p>
                    <p
                      className="text-base leading-relaxed text-foreground/70"
                      style={{
                        fontFamily: `'${selectedFont.family}', sans-serif`,
                        fontWeight: 400,
                      }}
                    >
                      Typography is the art and technique of arranging type to
                      make written language legible, readable and appealing when
                      displayed. The arrangement of type involves selecting
                      typefaces, point sizes, line lengths, line-spacing, and
                      letter-spacing, and adjusting the space between pairs of
                      letters.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}