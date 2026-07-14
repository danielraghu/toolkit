"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Heart,
  Globe,
  FolderOpen,
  MoreHorizontal,
  Copy,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      return "badge-design";
    case "Assets":
      return "badge-assets";
    case "Development":
      return "badge-development";
    case "AI":
      return "badge-ai";
    case "Productivity":
      return "badge-productivity";
    case "Reference":
      return "badge-reference";
    case "Typography":
      return "badge-typography";
    default:
      return "badge-reference";
  }
}

// ===================== MAIN APP =====================

export default function Home() {
  const [activeTab, setActiveTab] = useState("resources");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-[#333333] bg-[#121212]/90 backdrop-blur-xl">
          <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="ToolKit" className="w-9 h-9" />
              <h1 className="text-lg font-bold tracking-tight text-white">ToolKit</h1>
            </div>
          </div>
        </header>

        {/* TAB BAR */}
        <div className="border-b border-[#333333] bg-[#121212]/60">
          <div className="max-w-[1200px] mx-auto px-6 py-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-[#333333] h-10 p-1 gap-1 rounded-full">
                <TabsTrigger
                  value="resources"
                  className="h-8 px-4 rounded-full text-[14px] font-medium transition-all duration-200 data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white data-[state=active]:shadow-none text-[#A0A0A0] hover:text-[#FFFFFF]"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  value="fonts"
                  className="h-8 px-4 rounded-full text-[14px] font-medium transition-all duration-200 data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white data-[state=active]:shadow-none text-[#A0A0A0] hover:text-[#FFFFFF]"
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
        <footer className="border-t border-[#333333] bg-[#121212]/60 mt-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#606060]">
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
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-white" style={{ lineHeight: 1.2 }}>Resource Library</h2>
          <p className="text-[14px] text-[#A0A0A0] mt-1" style={{ lineHeight: 1.5 }}>
            {resources.length} resources in your collection
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
          <input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
          />
        </div>
        <button
          variant={showFavorites ? "default" : "outline"}
          onClick={() => setShowFavorites(!showFavorites)}
          className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 ${
            showFavorites
              ? "bg-[#FF6B35] text-white"
              : "bg-[#333333] text-[#A0A0A0] hover:bg-[#444444] hover:text-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`} />
          Favorites
        </button>
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat
                ? "bg-[#FF6B35] text-white"
                : "bg-[#333333] text-[#A0A0A0] hover:bg-[#444444] hover:text-white"
            }`}
          >
            {cat !== "All" && <span className="text-xs">{getCategoryIcon(cat)}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg bg-[#333333]" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-2 bg-[#333333]" />
                  <Skeleton className="h-3 w-full mb-1 bg-[#333333]" />
                  <Skeleton className="h-3 w-3/4 bg-[#333333]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 mx-auto text-[#606060] mb-4" />
          <h3 className="text-[18px] font-semibold text-white mb-1">No resources found</h3>
          <p className="text-[14px] text-[#A0A0A0]">
            {showFavorites
              ? "You haven't favorited any resources yet"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <DialogContent className="sm:max-w-[480px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">{editItem ? "Edit Resource" : "Add Resource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Title *</label>
              <input
                placeholder="e.g. Figma"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">URL *</label>
              <input
                placeholder="https://example.com"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Description</label>
              <textarea
                placeholder="Brief description of this resource..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Category</label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="w-full bg-[#2A2A2A] border-[#333333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-[#333333]">
                  {["Design", "Assets", "Development", "AI", "Productivity", "Reference", "Typography", "General"].map(
                    (c) => (
                      <SelectItem key={c} value={c} className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">
                        {getCategoryIcon(c)} {c}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Tags</label>
              <input
                placeholder="design, ui, free (comma separated)"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setDialogOpen(false); resetForm(); }}
                className="px-5 py-3 bg-[#333333] hover:bg-[#444444] text-white rounded-lg text-[14px] font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
              >
                {editItem ? "Save Changes" : "Add Resource"}
              </button>
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
      <div
        className="group bg-[#1E1E1E] border border-[#333333] rounded-xl p-5 h-full flex flex-col transition-all duration-200 hover:border-[#444444] hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-start gap-3 flex-1">
          {/* FAVICON */}
          <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center flex-shrink-0 overflow-hidden">
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
              <h3 className="font-semibold text-[14px] text-white truncate">{resource.title}</h3>
              <button
                onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                className="flex-shrink-0"
              >
                <Star
                  className={`w-3.5 h-3.5 transition-colors ${
                    resource.isFavorite
                      ? "fill-[#FFD700] text-[#FFD700]"
                      : "text-[#606060] hover:text-[#FFD700]"
                  }`}
                />
              </button>
            </div>
            <p className="text-[12px] text-[#00BFFF] mb-2">{hostname}</p>
            <p className="text-[12px] text-[#A0A0A0] line-clamp-2 mb-2 min-h-[2.5rem]">
              {resource.description || "\u00A0"}
            </p>
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className={`ds-badge text-[10px] px-3 py-1 ${getCategoryColor(resource.category)}`}
              >
                {resource.category}
              </span>
              {resource.tags &&
                resource.tags.split(",").slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-[#606060] truncate"
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
                  className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[#A0A0A0]" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Visit site</TooltipContent>
            </Tooltip>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-[#A0A0A0]" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-36 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.2)] z-50 py-1 overflow-hidden"
                  >
                    <button
                      onClick={() => { setShowMenu(false); onEdit(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[14px] hover:bg-[#2A2A2A] transition-colors text-left text-[#A0A0A0] hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); onDelete(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[14px] hover:bg-red-500/10 text-red-400 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
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
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-white" style={{ lineHeight: 1.2 }}>Font Library</h2>
          <p className="text-[14px] text-[#A0A0A0] mt-1" style={{ lineHeight: 1.5 }}>
            {fonts.length} fonts in your collection
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGoogleBrowser(!showGoogleBrowser)}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 ${
              showGoogleBrowser
                ? "bg-[#FF6B35] text-white"
                : "bg-[#333333] text-[#A0A0A0] hover:bg-[#444444] hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" />
            Browse Google Fonts
          </button>
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] text-white rounded-lg text-[14px] font-semibold transition-all duration-200">
                <Upload className="w-4 h-4" />
                Upload Font
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] bg-[#1E1E1E] border-[#333333] rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-white">Upload Custom Font</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="border-2 border-dashed border-[#333333] rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-[#606060] mb-2" />
                  <p className="text-[14px] text-[#A0A0A0] mb-3">
                    Upload .ttf or .otf file
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
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
                  <label className="text-[14px] font-medium text-[#A0A0A0]">Display Name</label>
                  <input
                    placeholder="e.g. My Custom Font"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#A0A0A0]">CSS Font Family</label>
                  <input
                    placeholder="e.g. MyCustomFont"
                    value={uploadFamily}
                    onChange={(e) => setUploadFamily(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
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
            <div className="bg-[#1E1E1E] border border-[#333333] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#333333]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Browse Google Fonts</h3>
                  <button
                    onClick={() => setShowGoogleBrowser(false)}
                    className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors text-[#A0A0A0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
                  <input
                    placeholder="Search Google Fonts..."
                    value={googleSearch}
                    onChange={(e) => {
                      setGoogleSearch(e.target.value);
                      fetchGoogleFonts(e.target.value);
                    }}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
                  />
                </div>
                <ScrollArea className="h-72">
                  {googleLoading ? (
                    <div className="space-y-3 p-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3">
                          <div>
                            <Skeleton className="h-5 w-40 mb-2 bg-[#333333]" />
                            <Skeleton className="h-3 w-24 bg-[#333333]" />
                          </div>
                          <Skeleton className="h-8 w-20 bg-[#333333]" />
                        </div>
                      ))}
                    </div>
                  ) : googleFonts.length === 0 ? (
                    <div className="text-center py-8 text-[#606060] text-[14px]">
                      No fonts found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {googleFonts.map((gf) => (
                        <div
                          key={gf.family}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                          <div>
                            <p
                              className="text-[18px] font-medium text-white"
                              style={{
                                fontFamily: `'${gf.family}', sans-serif`,
                              }}
                            >
                              {gf.family}
                            </p>
                            <p className="text-[12px] text-[#606060] mt-0.5">
                              {gf.category} · {JSON.parse(gf.variants).length}{" "}
                              variants
                            </p>
                          </div>
                          <button
                            onClick={() => addGoogleFont(gf)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[12px] font-medium transition-all duration-200 flex-shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
          <input
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-36 py-3 bg-[#2A2A2A] border-[#333333] text-[#A0A0A0] rounded-lg">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E1E1E] border-[#333333]">
            <SelectItem value="All" className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">All Sources</SelectItem>
            <SelectItem value="google" className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">Google Fonts</SelectItem>
            <SelectItem value="custom" className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">Uploaded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* FONT LIST + PREVIEW */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* FONT LIST */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="border border-[#333333] rounded-xl overflow-hidden bg-[#1E1E1E]">
            <div className="p-3 border-b border-[#333333] bg-[#1A1A1A]">
              <p className="text-[12px] font-medium text-[#606060] uppercase tracking-wider">
                Your Fonts
              </p>
            </div>
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
              {loading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="w-8 h-8 rounded bg-[#333333]" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-28 mb-1 bg-[#333333]" />
                        <Skeleton className="h-3 w-16 bg-[#333333]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : fonts.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Type className="w-8 h-8 mx-auto text-[#606060] mb-2" />
                  <p className="text-[14px] text-[#A0A0A0]">No fonts yet</p>
                  <p className="text-[12px] text-[#606060] mt-1">
                    Browse Google Fonts or upload your own
                  </p>
                </div>
              ) : (
                <div>
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFont(f)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-[#333333]/40 last:border-b-0 ${
                        selectedFont?.id === f.id ? "bg-[#2A2A2A]" : "hover:bg-[#2A2A2A]/60"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center text-lg flex-shrink-0 text-white"
                        style={{
                          fontFamily: `'${f.family}', sans-serif`,
                        }}
                      >
                        Aa
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium truncate text-white">{f.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#606060] capitalize">
                            {f.source}
                          </span>
                          <span className="text-[10px] text-[#606060]/50">
                            ·
                          </span>
                          <span className="text-[10px] text-[#606060]">
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
                        className="p-1 rounded hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-[#606060] hover:text-red-400" />
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
            <div className="border border-[#333333] rounded-xl bg-[#1E1E1E] h-[calc(100vh-380px)] min-h-[300px] flex items-center justify-center">
              <div className="text-center px-4">
                <Eye className="w-12 h-12 mx-auto text-[#606060] mb-4" />
                <h3 className="text-[18px] font-medium text-[#A0A0A0]">
                  Select a font to preview
                </h3>
                <p className="text-[14px] text-[#606060] mt-1">
                  Choose a font from the list to see how it looks
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-[#333333] rounded-xl overflow-hidden bg-[#1E1E1E]">
              {/* FONT HEADER */}
              <div className="p-5 border-b border-[#333333] bg-[#1A1A1A]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className="text-[24px] font-bold text-white"
                      style={{
                        fontFamily: `'${selectedFont.family}', sans-serif`,
                      }}
                    >
                      {selectedFont.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="ds-badge text-[10px] px-3 py-1 bg-[#333333] text-[#A0A0A0] capitalize">
                        {selectedFont.source}
                      </span>
                      <span className="text-[12px] text-[#606060]">
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
                        className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                      >
                        <Copy className="w-4 h-4 text-[#A0A0A0]" />
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
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#2A2A2A] border border-[#333333] text-[10px] font-medium text-[#A0A0A0]"
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
              <div className="p-4 border-b border-[#333333] flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    placeholder="Type your own preview text..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#606060] whitespace-nowrap">
                    Size
                  </span>
                  <input
                    type="number"
                    value={previewSize}
                    onChange={(e) => setPreviewSize(parseInt(e.target.value) || 16)}
                    className="w-16 px-3 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white text-center outline-none focus:border-[#FF6B35] transition-colors duration-200"
                    min={8}
                    max={200}
                  />
                  <span className="text-[12px] text-[#606060]">px</span>
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
                          <span className="text-[12px] font-medium text-[#606060] uppercase tracking-wider">
                            {label} ({w})
                          </span>
                          {hasItalic && (
                            <span className="text-[10px] text-[#606060]/60">
                              · Italic available
                            </span>
                          )}
                        </div>
                        <p
                          className="leading-tight break-words text-[#FFFFFF]/90"
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
                            className="leading-tight break-words text-[#FFFFFF]/70 mt-1"
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
                    <p className="text-[12px] font-medium text-[#606060] uppercase tracking-wider mb-3">
                      Alphabet & Numbers
                    </p>
                    <p
                      className="text-2xl leading-relaxed break-words text-[#FFFFFF]/80"
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
                    <p className="text-[12px] font-medium text-[#606060] uppercase tracking-wider mb-3">
                      Paragraph
                    </p>
                    <p
                      className="text-base leading-relaxed text-[#FFFFFF]/70"
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