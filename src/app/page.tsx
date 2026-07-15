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
  Settings2,
  Palette,
  ImageIcon,
  FileText,
  Download,
  Tag,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface CategoryItem {
  id: string;
  name: string;
  count: number;
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

interface BrandProfile {
  id: string;
  name: string;
  primaryLogo: string;
  order: number;
  createdAt: string;
  _count?: { assets: number };
}

interface BrandAsset {
  id: string;
  type: string;
  name: string;
  value: string;
  metadata: string;
  order: number;
  profileId: string | null;
  createdAt: string;
}

interface FontVariant {
  weight: number;
  style: string;
  label: string;
}

// ===================== ICON HELPERS =====================

function getCategoryIcon(category: string) {
  switch (category) {
    case "Design": return "🎨";
    case "Assets": return "📦";
    case "Development": return "💻";
    case "AI": return "🤖";
    case "Productivity": return "⚡";
    case "Reference": return "📖";
    case "Typography": return "🔤";
    default: return "🔗";
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Design": return "badge-design";
    case "Assets": return "badge-assets";
    case "Development": return "badge-development";
    case "AI": return "badge-ai";
    case "Productivity": return "badge-productivity";
    case "Reference": return "badge-reference";
    case "Typography": return "badge-typography";
    default: return "badge-reference";
  }
}

// ===================== PASSWORD GATE =====================

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (res.ok) {
        sessionStorage.setItem("toolkit_auth", "true");
        onUnlock();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[380px]"
      >
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="ToolKit" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-[22px] font-bold text-white mb-1">ToolKit</h1>
          <p className="text-[14px] text-[#A0A0A0]">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full px-4 py-3.5 bg-[#1E1E1E] border border-[#333333] rounded-xl text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200 text-center tracking-widest"
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="text-[13px] text-red-400 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-semibold transition-all duration-200"
          >
            {loading ? "Verifying..." : "Unlock"}
          </button>
        </form>
        <p className="text-center text-[11px] text-[#606060] mt-6">
          Natural Eye Media
        </p>
      </motion.div>
    </div>
  );
}

// ===================== MAIN APP =====================

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("toolkit_auth") === "true";
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState("resources");

  if (!isAuthenticated) {
    return <PasswordGate onUnlock={() => setIsAuthenticated(true)} />;
  }

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
                <TabsTrigger value="resources" className="h-8 px-4 rounded-full text-[14px] font-medium transition-all duration-200 data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white data-[state=active]:shadow-none text-[#A0A0A0] hover:text-[#FFFFFF]">
                  <Link2 className="w-4 h-4 mr-2" />Resources
                </TabsTrigger>
                <TabsTrigger value="brand" className="h-8 px-4 rounded-full text-[14px] font-medium transition-all duration-200 data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white data-[state=active]:shadow-none text-[#A0A0A0] hover:text-[#FFFFFF]">
                  <Palette className="w-4 h-4 mr-2" />Brand Assets
                </TabsTrigger>
                <TabsTrigger value="fonts" className="h-8 px-4 rounded-full text-[14px] font-medium transition-all duration-200 data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white data-[state=active]:shadow-none text-[#A0A0A0] hover:text-[#FFFFFF]">
                  <Type className="w-4 h-4 mr-2" />Fonts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === "resources" ? (
              <motion.div key="resources" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <ResourcesSection />
              </motion.div>
            ) : activeTab === "brand" ? (
              <motion.div key="brand" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <BrandAssetsSection />
              </motion.div>
            ) : (
              <motion.div key="fonts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <FontsSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-[#333333] bg-[#121212]/60 mt-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-[#606060]">
            <span>Copyright © Natural Eye Media</span>
            <span>
              <a href="#" className="hover:text-[#A0A0A0] transition-colors duration-200">Privacy Policy</a>
              <span className="mx-3 text-[#333333]">|</span>
              <span>Crafted By NEM</span>
            </span>
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
  const [allTags, setAllTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Resource | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formTags, setFormTags] = useState("");
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catList, setCatList] = useState<CategoryItem[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [allCatNames, setAllCatNames] = useState<string[]>([]);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory !== "All") params.set("category", activeCategory);
      if (search) params.set("search", search);
      if (showFavorites) params.set("favorites", "true");
      if (activeTag) params.set("tag", activeTag);

      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setCategories(data.categories || []);
      setAllCatNames(data.categories || []);
      setAllTags(data.allTags || []);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, showFavorites, activeTag]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Also fetch all tags (unfiltered) to show all available tags
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/resources")
      .then(r => r.json())
      .then(d => setGlobalTags(d.allTags || []))
      .catch(() => {});
  }, []);

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
        await fetch("/api/resources", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editItem.id, ...body }) });
        toast.success("Resource updated");
      } else {
        await fetch("/api/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
      await fetch("/api/resources", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, isFavorite: !r.isFavorite }) });
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

  const openAdd = () => { setEditItem(null); resetForm(); setDialogOpen(true); };
  const resetForm = () => { setEditItem(null); setFormTitle(""); setFormUrl(""); setFormDesc(""); setFormCategory("General"); setFormTags(""); };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCatList(data.categories || []);
      const names = (data.categories || []).map((c: CategoryItem) => c.name);
      setAllCatNames(names);
      setCategories(names);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCatName.trim() }) });
      if (res.status === 409) { toast.error("Category already exists"); return; }
      if (!res.ok) throw new Error();
      toast.success(`Category "${newCatName.trim()}" added`);
      setNewCatName("");
      fetchCategories();
      fetchResources();
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    try {
      const msg = cat.count > 0 ? `${cat.count} resource${cat.count > 1 ? "s" : ""} will be moved to General.` : "This category has no resources.";
      if (!confirm(`Delete "${cat.name}"?\n\n${msg}`)) return;
      await fetch(`/api/categories?id=${cat.id}`, { method: "DELETE" });
      toast.success(`Category "${cat.name}" deleted`);
      if (activeCategory === cat.name) setActiveCategory("All");
      fetchCategories();
      fetchResources();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const openCatDialog = () => { setNewCatName(""); fetchCategories(); setCatDialogOpen(true); };

  const allCategories = ["All", ...categories];
  const currentFormTags = formTags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  const suggestedTags = globalTags.filter(t => !currentFormTags.includes(t.toLowerCase())).slice(0, 8);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-white" style={{ lineHeight: 1.2 }}>Resource Library</h2>
          <p className="text-[14px] text-[#A0A0A0] mt-1" style={{ lineHeight: 1.5 }}>{resources.length} resources in your collection</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] text-white rounded-lg text-[14px] font-semibold transition-all duration-200">
          <Plus className="w-4 h-4" />Add Resource
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#606060]" />
          <input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
        </div>
        <button onClick={() => setShowFavorites(!showFavorites)} className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 ${showFavorites ? "bg-[#FF6B35] text-white" : "bg-[#333333] text-[#A0A0A0] hover:bg-[#444444] hover:text-white"}`}>
          <Heart className={`w-4 h-4 ${showFavorites ? "fill-current" : ""}`} />Favorites
        </button>
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {allCategories.map((cat) => (
          <button key={cat} onClick={() => { setActiveCategory(cat); setActiveTag(null); }} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat && !activeTag ? "bg-[#FF6B35] text-white" : "bg-[#333333] text-[#A0A0A0] hover:bg-[#444444] hover:text-white"}`}>
            {cat !== "All" && <span className="text-xs">{getCategoryIcon(cat)}</span>}{cat}
          </button>
        ))}
        <button onClick={openCatDialog} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 bg-[#2A2A2A] text-[#606060] hover:bg-[#333333] hover:text-[#A0A0A0] border border-dashed border-[#444444]">
          <Settings2 className="w-3.5 h-3.5" />Manage
        </button>
      </div>

      {/* TAG FILTERS */}
      {globalTags.length > 0 && (
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {globalTags.map((tag) => (
            <button key={tag} onClick={() => { setActiveTag(activeTag === tag ? null : tag); }} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${activeTag === tag ? "bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40" : "bg-[#2A2A2A] text-[#606060] border border-[#333333] hover:text-[#A0A0A0] hover:border-[#444444]"}`}>
              <Tag className="w-3 h-3" />{tag}
            </button>
          ))}
        </div>
      )}

      {/* ACTIVE TAG INDICATOR */}
      {activeTag && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[12px] text-[#A0A0A0]">Filtering by tag:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium bg-[#FF6B35]/20 text-[#FF6B35]">
            #{activeTag}
            <button onClick={() => setActiveTag(null)} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        </div>
      )}

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
          <p className="text-[14px] text-[#A0A0A0]">{showFavorites ? "You haven't favorited any resources yet" : "Try adjusting your search or filters"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} onFavorite={() => toggleFavorite(r)} onEdit={() => openEdit(r)} onDelete={() => handleDelete(r.id)} onTagClick={(tag) => setActiveTag(tag)} />
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
              <input placeholder="e.g. Figma" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">URL *</label>
              <input placeholder="https://example.com" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Description</label>
              <textarea placeholder="Brief description of this resource..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200 resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Category</label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger className="w-full bg-[#2A2A2A] border-[#333333] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-[#333333]">
                  {allCatNames.length > 0 ? allCatNames.map((c) => (<SelectItem key={c} value={c} className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">{getCategoryIcon(c)} {c}</SelectItem>)) : ["General"].map((c) => (<SelectItem key={c} value={c} className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">{getCategoryIcon(c)} {c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Tags</label>
              <input placeholder="design, ui, free (comma separated)" value={formTags} onChange={(e) => setFormTags(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
              {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-[#606060] leading-6">Suggested:</span>
                  {suggestedTags.map((tag) => (
                    <button key={tag} type="button" onClick={() => { const current = formTags.split(",").map(t => t.trim()).filter(Boolean); if (!current.map(t => t.toLowerCase()).includes(tag.toLowerCase())) { setFormTags(formTags ? `${formTags}, ${tag}` : tag); } }} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#2A2A2A] text-[#A0A0A0] border border-[#333333] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors duration-200">
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setDialogOpen(false); resetForm(); }} className="px-5 py-3 bg-[#333333] hover:bg-[#444444] text-white rounded-lg text-[14px] font-medium transition-all duration-200">Cancel</button>
              <button onClick={handleSubmit} className="px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] text-white rounded-lg text-[14px] font-semibold transition-all duration-200">{editItem ? "Save Changes" : "Add Resource"}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MANAGE CATEGORIES DIALOG */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader><DialogTitle className="text-white">Manage Categories</DialogTitle></DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="flex gap-2">
              <input placeholder="New category name..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} className="flex-1 px-4 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
              <button onClick={handleAddCategory} disabled={!newCatName.trim()} className="px-4 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[14px] font-semibold transition-all duration-200">Add</button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {catList.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm">{getCategoryIcon(cat.name)}</span>
                    <span className="text-[14px] text-white truncate">{cat.name}</span>
                    <span className="text-[11px] text-[#606060]">{cat.count}</span>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-[#606060] hover:text-red-400 transition-all duration-200" title="Delete category">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {catList.length === 0 && <p className="text-center text-[14px] text-[#606060] py-6">No categories yet</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================== RESOURCE CARD =====================

function ResourceCard({ resource, onFavorite, onEdit, onDelete, onTagClick }: { resource: Resource; onFavorite: () => void; onEdit: () => void; onDelete: () => void; onTagClick: (tag: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hostname = (() => { try { return new URL(resource.url).hostname; } catch { return resource.url; } })();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const tags = resource.tags ? resource.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="h-full">
      <div className="group bg-[#1E1E1E] border border-[#333333] rounded-xl p-5 h-full flex flex-col transition-all duration-200 hover:border-[#444444] hover:shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {resource.faviconUrl ? (
              <img src={resource.faviconUrl} alt="" className="w-6 h-6" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg">${getCategoryIcon(resource.category)}</span>`; }} />
            ) : (
              <span className="text-lg">{getCategoryIcon(resource.category)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-[14px] text-white truncate">{resource.title}</h3>
              <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} className="flex-shrink-0">
                <Star className={`w-3.5 h-3.5 transition-colors ${resource.isFavorite ? "fill-[#FFD700] text-[#FFD700]" : "text-[#606060] hover:text-[#FFD700]"}`} />
              </button>
            </div>
            <p className="text-[12px] text-[#00BFFF] mb-2">{hostname}</p>
            <p className="text-[12px] text-[#A0A0A0] line-clamp-2 mb-2 min-h-[2.5rem]">{resource.description || "\u00A0"}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`ds-badge text-[10px] px-3 py-1 ${getCategoryColor(resource.category)}`}>{resource.category}</span>
              {tags.slice(0, 3).map((tag) => (
                <button key={tag} onClick={() => onTagClick(tag.toLowerCase())} className="text-[10px] text-[#606060] hover:text-[#FF6B35] transition-colors truncate" title={`Filter by #${tag}`}>#{tag}</button>
              ))}
              {tags.length > 3 && <span className="text-[10px] text-[#606060]">+{tags.length - 3}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0" ref={menuRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors"><ExternalLink className="w-4 h-4 text-[#A0A0A0]" /></a>
              </TooltipTrigger>
              <TooltipContent>Visit site</TooltipContent>
            </Tooltip>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors"><MoreHorizontal className="w-4 h-4 text-[#A0A0A0]" /></button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-full mt-1 w-36 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.2)] z-50 py-1 overflow-hidden">
                    <button onClick={() => { setShowMenu(false); onEdit(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[14px] hover:bg-[#2A2A2A] transition-colors text-left text-[#A0A0A0] hover:text-white"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => { setShowMenu(false); onDelete(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[14px] hover:bg-red-500/10 text-red-400 transition-colors text-left"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
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

// ===================== BRAND ASSETS SECTION =====================

function BrandAssetsSection() {
  // Profile state
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Assets state (for selected profile)
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Sub-tab
  const [activeTab, setActiveTab] = useState<string>("logos");

  // Profile dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLogo, setProfileLogo] = useState("");
  const [profileLogoPreview, setProfileLogoPreview] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Font picker for brand fonts
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [fontSearch, setFontSearch] = useState("");
  const [fontList, setFontList] = useState<FontItem[]>([]);

  // Asset dialogs
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoName, setLogoName] = useState("");
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState("#");
  const [gradientDialogOpen, setGradientDialogOpen] = useState(false);
  const [gradientName, setGradientName] = useState("");
  const [gradientValue, setGradientValue] = useState("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfName, setPdfName] = useState("");

  // Selected profile helper
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || null;

  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await fetch("/api/brand-profiles");
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch {
      toast.error("Failed to load brand profiles");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Fetch assets for a profile
  const fetchAssets = useCallback(async (profileId: string) => {
    try {
      setAssetsLoading(true);
      const res = await fetch(`/api/brand-assets?profileId=${profileId}`);
      const data = await res.json();
      setAssets(data.assets || []);
    } catch {
      toast.error("Failed to load assets");
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (selectedProfileId) {
      fetchAssets(selectedProfileId);
      setActiveTab("logos");
    }
  }, [selectedProfileId, fetchAssets]);

  // Filtered assets by tab
  const logos = assets.filter((a) => a.type === "logo");
  const brandFonts = assets.filter((a) => a.type === "font");
  const colors = assets.filter((a) => a.type === "color");
  const gradients = assets.filter((a) => a.type === "gradient");
  const pdfs = assets.filter((a) => a.type === "pdf");

  // Profile CRUD
  const handleCreateProfile = async () => {
    if (!profileName.trim()) { toast.error("Please enter a brand name"); return; }
    try {
      const res = await fetch("/api/brand-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName.trim(), primaryLogo: profileLogo }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfiles((prev) => [...prev, data.profile]);
        toast.success(`Brand "${profileName.trim()}" created`);
        setCreateDialogOpen(false);
        setProfileName("");
        setProfileLogo("");
        setProfileLogoPreview("");
      } else {
        toast.error(data.error || "Failed to create brand");
      }
    } catch {
      toast.error("Failed to create brand");
    }
  };

  const handleEditProfile = async () => {
    if (!selectedProfileId || !profileName.trim()) return;
    try {
      const res = await fetch("/api/brand-profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedProfileId, name: profileName.trim(), primaryLogo: profileLogo }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfiles((prev) => prev.map((p) => p.id === selectedProfileId ? { ...p, ...data.profile } : p));
        toast.success("Brand updated");
        setEditDialogOpen(false);
      } else {
        toast.error(data.error || "Failed to update brand");
      }
    } catch {
      toast.error("Failed to update brand");
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await fetch(`/api/brand-profiles?id=${id}`, { method: "DELETE" });
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (selectedProfileId === id) {
        setSelectedProfileId(null);
        setAssets([]);
      }
      toast.success("Brand deleted");
    } catch {
      toast.error("Failed to delete brand");
    }
  };

  // Logo upload for profile
  const handleProfileLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfileLogo(base64);
      setProfileLogoPreview(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Open edit dialog
  const openEditDialog = () => {
    if (!selectedProfile) return;
    setProfileName(selectedProfile.name);
    setProfileLogo(selectedProfile.primaryLogo);
    setProfileLogoPreview(selectedProfile.primaryLogo);
    setEditDialogOpen(true);
  };

  // Asset CRUD helpers
  const handleAddAsset = async (type: string, name: string, value: string, metadata: string = "") => {
    if (!selectedProfileId) return;
    try {
      const res = await fetch("/api/brand-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, value, metadata, profileId: selectedProfileId }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssets((prev) => [...prev, data.asset]);
        toast.success(`Added "${name}"`);
      } else {
        toast.error(data.error || "Failed to add asset");
      }
    } catch {
      toast.error("Failed to add asset");
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await fetch(`/api/brand-assets?id=${id}`, { method: "DELETE" });
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success("Asset removed");
    } catch {
      toast.error("Failed to delete asset");
    }
  };

  // Download helper (for logos and PDFs)
  const handleDownload = (value: string, name: string) => {
    const a = document.createElement("a");
    a.href = value;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // File size formatter
  const formatFileSize = (base64: string) => {
    try {
      const bytes = Math.round((base64.length - base64.indexOf(",") - 1) * 0.75);
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch {
      return "";
    }
  };

  // Font picker
  const fetchFontList = useCallback(async (search: string = "") => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/fonts?${params}`);
      const data = await res.json();
      setFontList(data.fonts || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (fontPickerOpen) fetchFontList(fontSearch);
  }, [fontPickerOpen, fontSearch, fetchFontList]);

  // Logo file upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleAddAsset("logo", logoName.trim() || file.name, base64, file.type);
      setLogoName("");
      setLogoDialogOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // PDF file upload handler
  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleAddAsset("pdf", pdfName.trim() || file.name, base64, file.type);
      setPdfName("");
      setPdfDialogOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Sub-tab config
  const tabs = [
    { key: "logos", label: "Logos", icon: ImageIcon, count: logos.length },
    { key: "fonts", label: "Fonts", icon: Type, count: brandFonts.length },
    { key: "colors", label: "Colors", icon: Palette, count: colors.length },
    { key: "gradients", label: "Gradients", icon: Settings2, count: gradients.length },
    { key: "pdfs", label: "PDFs", icon: FileText, count: pdfs.length },
  ];

  // ==================== PROFILE LIST VIEW ====================
  if (!selectedProfileId) {
    return (
      <motion.div
        key="brand-profiles"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
        className="max-w-[1200px] mx-auto px-6 py-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[24px] font-bold tracking-tight text-white" style={{ lineHeight: 1.2 }}>Brand Assets</h2>
            <p className="text-[14px] text-[#A0A0A0] mt-1" style={{ lineHeight: 1.5 }}>
              {profiles.length} brand{profiles.length !== 1 ? "s" : ""} in your collection
            </p>
          </div>
          <button
            onClick={() => { setProfileName(""); setProfileLogo(""); setProfileLogoPreview(""); setCreateDialogOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
          >
            <Plus className="w-4 h-4" />Add Brand
          </button>
        </div>

        {profileLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-6">
                <Skeleton className="w-16 h-16 rounded-xl bg-[#333333] mx-auto mb-4" />
                <Skeleton className="h-5 w-24 bg-[#333333] mx-auto mb-2" />
                <Skeleton className="h-3 w-16 bg-[#333333] mx-auto" />
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-14 h-14 mx-auto text-[#606060] mb-4" />
            <h3 className="text-[18px] font-medium text-[#A0A0A0] mb-2">No brands yet</h3>
            <p className="text-[14px] text-[#606060] mb-6">Create your first brand profile to start organizing assets</p>
            <button
              onClick={() => { setProfileName(""); setProfileLogo(""); setProfileLogoPreview(""); setCreateDialogOpen(true); }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
            >
              <Plus className="w-4 h-4" />Create Your First Brand
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <motion.button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-6 text-left hover:border-[#FF6B35]/40 transition-all duration-200 group"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 rounded-xl bg-[#2A2A2A] border border-[#333333] flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {profile.primaryLogo ? (
                    <img src={profile.primaryLogo} alt={profile.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-[#606060] group-hover:text-[#FF6B35] transition-colors" />
                  )}
                </div>
                <h3 className="text-[15px] font-semibold text-white text-center mb-2 truncate">{profile.name}</h3>
                <div className="flex justify-center">
                  <span className="ds-badge text-[11px] px-3 py-1 bg-[#333333] text-[#A0A0A0] rounded-full">
                    {profile._count?.assets || 0} asset{(profile._count?.assets || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Create Profile Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[440px] bg-[#1E1E1E] border-[#333333] rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create Brand Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#A0A0A0]">Brand Name</label>
                <input
                  placeholder="e.g. Acme Corp"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProfile()}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#A0A0A0]">Primary Logo</label>
                <div className="border-2 border-dashed border-[#333333] rounded-lg p-6 text-center hover:border-[#FF6B35]/40 transition-colors">
                  {profileLogoPreview ? (
                    <div className="space-y-3">
                      <img src={profileLogoPreview} alt="Preview" className="w-20 h-20 object-contain mx-auto" />
                      <button
                        onClick={() => { setProfileLogo(""); setProfileLogoPreview(""); }}
                        className="text-[12px] text-[#A0A0A0] hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto text-[#606060] mb-2" />
                      <p className="text-[13px] text-[#A0A0A0] mb-3">PNG, JPG, SVG, or WebP</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
                        Choose File
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          className="hidden"
                          onChange={handleProfileLogoUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setCreateDialogOpen(false)}
                className="px-4 py-2.5 bg-[#333333] text-[#A0A0A0] rounded-lg text-[14px] font-medium hover:bg-[#444444] hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProfile}
                className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
              >
                Create Brand
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // ==================== PROFILE DETAIL VIEW ====================
  return (
    <motion.div
      key="brand-detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-6 py-8"
    >
      {/* Profile Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => setSelectedProfileId(null)}
          className="p-2.5 rounded-lg bg-[#1E1E1E] border border-[#333333] hover:bg-[#2A2A2A] transition-colors mt-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#A0A0A0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="w-12 h-12 rounded-xl bg-[#2A2A2A] border border-[#333333] flex items-center justify-center overflow-hidden flex-shrink-0">
          {selectedProfile?.primaryLogo ? (
            <img src={selectedProfile.primaryLogo} alt={selectedProfile.name} className="w-full h-full object-contain p-1.5" />
          ) : (
            <ImageIcon className="w-5 h-5 text-[#606060]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[24px] font-bold tracking-tight text-white truncate" style={{ lineHeight: 1.2 }}>{selectedProfile?.name}</h2>
          <p className="text-[14px] text-[#A0A0A0] mt-1">{assets.length} asset{assets.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={openEditDialog}
            className="p-2.5 rounded-lg bg-[#1E1E1E] border border-[#333333] hover:bg-[#2A2A2A] transition-colors"
          >
            <Edit3 className="w-4 h-4 text-[#A0A0A0]" />
          </button>
          <button
            onClick={() => { if (selectedProfileId && confirm("Delete this brand and all its assets?")) handleDeleteProfile(selectedProfileId); }}
            className="p-2.5 rounded-lg bg-[#1E1E1E] border border-[#333333] hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#A0A0A0] hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-[#FF6B35] text-white"
                : "bg-[#1E1E1E] text-[#A0A0A0] border border-[#333333] hover:bg-[#2A2A2A] hover:text-white"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-[#333333]"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {assetsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-5">
              <Skeleton className="w-full h-24 rounded-lg bg-[#333333] mb-3" />
              <Skeleton className="h-4 w-20 bg-[#333333]" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ===== LOGOS TAB ===== */}
          {activeTab === "logos" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-white">Logos</h3>
                <button
                  onClick={() => { setLogoName(""); setLogoDialogOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-medium transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />Add Logo
                </button>
              </div>
              {logos.length === 0 ? (
                <div className="text-center py-12 bg-[#1E1E1E] border border-[#333333] rounded-xl">
                  <ImageIcon className="w-10 h-10 mx-auto text-[#606060] mb-3" />
                  <p className="text-[14px] text-[#A0A0A0]">No logos yet</p>
                  <p className="text-[12px] text-[#606060] mt-1">Upload your brand logos</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {logos.map((logo) => (
                    <div key={logo.id} className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-4 group">
                      <div className="aspect-square bg-[#2A2A2A] rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <img src={logo.value} alt={logo.name} className="max-w-full max-h-full object-contain p-3" />
                      </div>
                      <p className="text-[13px] font-medium text-white truncate mb-2">{logo.name}</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDownload(logo.value, logo.name)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#333333] hover:bg-[#444444] text-[#A0A0A0] hover:text-white rounded-lg text-[11px] font-medium transition-all"
                        >
                          <Download className="w-3 h-3" />Download
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(logo.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#606060] hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ===== FONTS TAB ===== */}
          {activeTab === "fonts" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-white">Brand Fonts</h3>
                <button
                  onClick={() => { setFontSearch(""); setFontPickerOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-medium transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />Add Font
                </button>
              </div>
              {brandFonts.length === 0 ? (
                <div className="text-center py-12 bg-[#1E1E1E] border border-[#333333] rounded-xl">
                  <Type className="w-10 h-10 mx-auto text-[#606060] mb-3" />
                  <p className="text-[14px] text-[#A0A0A0]">No fonts linked yet</p>
                  <p className="text-[12px] text-[#606060] mt-1">Link fonts from your library</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {brandFonts.map((font) => (
                    <div key={font.id} className="flex items-center gap-4 bg-[#1E1E1E] border border-[#333333] rounded-xl px-5 py-4 group">
                      <div
                        className="w-12 h-12 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center text-lg flex-shrink-0 text-white"
                        style={{ fontFamily: `'${font.value}', sans-serif` }}
                      >
                        Aa
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-white">{font.name}</p>
                        <p
                          className="text-[18px] text-[#A0A0A0] mt-0.5"
                          style={{ fontFamily: `'${font.value}', sans-serif` }}
                        >
                          The quick brown fox
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(`font-family: \'${font.value}\', sans-serif;`, "CSS")}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#333333] hover:bg-[#444444] text-[#A0A0A0] hover:text-white rounded-lg text-[12px] font-medium transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />Copy CSS
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(font.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#606060] hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ===== COLORS TAB ===== */}
          {activeTab === "colors" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-white">Colors</h3>
                <button
                  onClick={() => { setColorName(""); setColorValue("#"); setColorDialogOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-medium transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />Add Color
                </button>
              </div>
              {colors.length === 0 ? (
                <div className="text-center py-12 bg-[#1E1E1E] border border-[#333333] rounded-xl">
                  <Palette className="w-10 h-10 mx-auto text-[#606060] mb-3" />
                  <p className="text-[14px] text-[#A0A0A0]">No colors yet</p>
                  <p className="text-[12px] text-[#606060] mt-1">Add your brand colors</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {colors.map((color) => (
                    <div key={color.id} className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-4 group">
                      <div
                        className="w-full aspect-[3/2] rounded-lg mb-3 border border-[#333333]"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-[13px] font-medium text-white truncate mb-1">{color.name}</p>
                      <p className="text-[12px] text-[#606060] font-mono mb-3">{color.value}</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCopy(color.value, "Hex")}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#333333] hover:bg-[#444444] text-[#A0A0A0] hover:text-white rounded-lg text-[11px] font-medium transition-all"
                        >
                          <Copy className="w-3 h-3" />COPY
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(color.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#606060] hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ===== GRADIENTS TAB ===== */}
          {activeTab === "gradients" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-white">Gradients</h3>
                <button
                  onClick={() => { setGradientName(""); setGradientValue("linear-gradient(135deg, #667eea 0%, #764ba2 100%)"); setGradientDialogOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-medium transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />Add Gradient
                </button>
              </div>
              {gradients.length === 0 ? (
                <div className="text-center py-12 bg-[#1E1E1E] border border-[#333333] rounded-xl">
                  <Settings2 className="w-10 h-10 mx-auto text-[#606060] mb-3" />
                  <p className="text-[14px] text-[#A0A0A0]">No gradients yet</p>
                  <p className="text-[12px] text-[#606060] mt-1">Add your brand gradients</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gradients.map((grad) => (
                    <div key={grad.id} className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-4 group">
                      <div
                        className="w-full aspect-[3/2] rounded-lg mb-3 border border-[#333333]"
                        style={{ background: grad.value }}
                      />
                      <p className="text-[13px] font-medium text-white truncate mb-1">{grad.name}</p>
                      <p className="text-[11px] text-[#606060] font-mono truncate mb-3">{grad.value}</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleCopy(grad.value, "Gradient CSS")}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#333333] hover:bg-[#444444] text-[#A0A0A0] hover:text-white rounded-lg text-[11px] font-medium transition-all"
                        >
                          <Copy className="w-3 h-3" />Copy CSS
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(grad.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#606060] hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ===== PDFS TAB ===== */}
          {activeTab === "pdfs" && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-white">PDFs</h3>
                <button
                  onClick={() => { setPdfName(""); setPdfDialogOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-medium transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />Add PDF
                </button>
              </div>
              {pdfs.length === 0 ? (
                <div className="text-center py-12 bg-[#1E1E1E] border border-[#333333] rounded-xl">
                  <FileText className="w-10 h-10 mx-auto text-[#606060] mb-3" />
                  <p className="text-[14px] text-[#A0A0A0]">No PDFs yet</p>
                  <p className="text-[12px] text-[#606060] mt-1">Upload brand guidelines and documents</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pdfs.map((pdf) => (
                    <div key={pdf.id} className="flex items-center gap-4 bg-[#1E1E1E] border border-[#333333] rounded-xl px-5 py-4 group">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-white truncate">{pdf.name}</p>
                        <p className="text-[12px] text-[#606060] mt-0.5">{formatFileSize(pdf.value)}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(pdf.value, pdf.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#333333] hover:bg-[#444444] text-[#A0A0A0] hover:text-white rounded-lg text-[12px] font-medium transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />DOWNLOAD
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(pdf.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#606060] hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* ===== ADD LOGO DIALOG ===== */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Logo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Logo Name</label>
              <input
                placeholder="e.g. Primary Logo Dark"
                value={logoName}
                onChange={(e) => setLogoName(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="border-2 border-dashed border-[#333333] rounded-lg p-8 text-center hover:border-[#FF6B35]/40 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-[#606060] mb-2" />
              <p className="text-[13px] text-[#A0A0A0] mb-3">PNG, JPG, SVG, or WebP</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
                Choose File
                <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoFileUpload} />
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ADD COLOR DIALOG ===== */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Color</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Color Name</label>
              <input
                placeholder="e.g. Brand Orange"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Hex Value</label>
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg border border-[#333333] flex-shrink-0" style={{ backgroundColor: colorValue }} />
                <input
                  placeholder="#FF6B35"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200 font-mono"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setColorDialogOpen(false)}
              className="px-4 py-2.5 bg-[#333333] text-[#A0A0A0] rounded-lg text-[14px] font-medium hover:bg-[#444444] hover:text-white transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!colorName.trim()) { toast.error("Please enter a color name"); return; }
                if (!/^#[0-9A-Fa-f]{3,8}$/.test(colorValue)) { toast.error("Please enter a valid hex color"); return; }
                handleAddAsset("color", colorName.trim(), colorValue);
                setColorDialogOpen(false);
              }}
              className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
            >
              Add Color
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ADD GRADIENT DIALOG ===== */}
      <Dialog open={gradientDialogOpen} onOpenChange={setGradientDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Gradient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Gradient Name</label>
              <input
                placeholder="e.g. Hero Gradient"
                value={gradientName}
                onChange={(e) => setGradientName(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">CSS Value</label>
              <div
                className="w-full h-20 rounded-lg border border-[#333333] mb-2"
                style={{ background: gradientValue }}
              />
              <input
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                value={gradientValue}
                onChange={(e) => setGradientValue(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200 font-mono text-[12px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setGradientDialogOpen(false)}
              className="px-4 py-2.5 bg-[#333333] text-[#A0A0A0] rounded-lg text-[14px] font-medium hover:bg-[#444444] hover:text-white transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!gradientName.trim()) { toast.error("Please enter a gradient name"); return; }
                handleAddAsset("gradient", gradientName.trim(), gradientValue);
                setGradientDialogOpen(false);
              }}
              className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
            >
              Add Gradient
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ADD PDF DIALOG ===== */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add PDF</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Document Name</label>
              <input
                placeholder="e.g. Brand Guidelines v2"
                value={pdfName}
                onChange={(e) => setPdfName(e.target.value)}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="border-2 border-dashed border-[#333333] rounded-lg p-8 text-center hover:border-[#FF6B35]/40 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-[#606060] mb-2" />
              <p className="text-[13px] text-[#A0A0A0] mb-3">PDF files</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
                Choose File
                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfFileUpload} />
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== FONT PICKER DIALOG ===== */}
      <Dialog open={fontPickerOpen} onOpenChange={setFontPickerOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Link Font from Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
              <input
                placeholder="Search fonts..."
                value={fontSearch}
                onChange={(e) => setFontSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <ScrollArea className="h-72">
              {fontList.length === 0 ? (
                <div className="text-center py-8 text-[#606060] text-[14px]">No fonts found</div>
              ) : (
                <div className="space-y-1">
                  {fontList.map((f) => {
                    const alreadyLinked = brandFonts.some((bf) => bf.value === f.family);
                    return (
                      <div
                        key={f.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${alreadyLinked ? "opacity-50" : "hover:bg-[#2A2A2A]"}`}
                      >
                        <div>
                          <p className="text-[15px] font-medium text-white" style={{ fontFamily: `'${f.family}', sans-serif` }}>{f.name}</p>
                          <p className="text-[11px] text-[#606060] capitalize mt-0.5">{f.source}</p>
                        </div>
                        {alreadyLinked ? (
                          <span className="text-[11px] text-[#606060]">Linked</span>
                        ) : (
                          <button
                            onClick={() => {
                              handleAddAsset("font", f.name, f.family, f.source);
                              setFontPickerOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[12px] font-medium transition-all duration-200"
                          >
                            <Plus className="w-3.5 h-3.5" />Link
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT PROFILE DIALOG ===== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[440px] bg-[#1E1E1E] border-[#333333] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Brand Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Brand Name</label>
              <input
                placeholder="e.g. Acme Corp"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditProfile()}
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#A0A0A0]">Primary Logo</label>
              <div className="border-2 border-dashed border-[#333333] rounded-lg p-6 text-center hover:border-[#FF6B35]/40 transition-colors">
                {profileLogoPreview ? (
                  <div className="space-y-3">
                    <img src={profileLogoPreview} alt="Preview" className="w-20 h-20 object-contain mx-auto" />
                    <button
                      onClick={() => { setProfileLogo(""); setProfileLogoPreview(""); }}
                      className="text-[12px] text-[#A0A0A0] hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-[#606060] mb-2" />
                    <p className="text-[13px] text-[#A0A0A0] mb-3">PNG, JPG, SVG, or WebP</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
                      Choose File
                      <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleProfileLogoUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setEditDialogOpen(false)}
              className="px-4 py-2.5 bg-[#333333] text-[#A0A0A0] rounded-lg text-[14px] font-medium hover:bg-[#444444] hover:text-white transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleEditProfile}
              className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ===================== FONTS SECTION =====================

function FontsSection() {
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [selectedFont, setSelectedFont] = useState<FontItem | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [previewSize, setPreviewSize] = useState(48);
  const [showUpload, setShowUpload] = useState(false);
  const [showGoogleBrowser, setShowGoogleBrowser] = useState(false);
  const [googleFonts, setGoogleFonts] = useState<GoogleFontResult[]>([]);
  const [googleSearch, setGoogleSearch] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loadedFontFamilies, setLoadedFontFamilies] = useState<Set<string>>(new Set());
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

  useEffect(() => { fetchFonts(); }, [fetchFonts]);

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
        style.textContent = `@font-face { font-family: '${selectedFont.family}'; src: url('${selectedFont.filePath}') format('truetype'); font-weight: normal; font-style: normal; }`;
        document.head.appendChild(style);
        setLoadedFontFamilies((prev) => new Set(prev).add(selectedFont.family));
      }
    }
  }, [selectedFont, loadedFontFamilies]);

  const fetchGoogleFonts = async (q: string = "") => {
    try {
      setGoogleLoading(true);
      const existingNames = fonts.filter((f) => f.source === "google").map((f) => f.family).join(",");
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

  useEffect(() => { if (showGoogleBrowser) fetchGoogleFonts(); }, [showGoogleBrowser]);

  const addGoogleFont = async (gf: GoogleFontResult) => {
    try {
      const res = await fetch("/api/fonts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: gf.name, family: gf.family, source: "google", variants: gf.variants }) });
      const font = await res.json();
      setFonts((prev) => [font, ...prev]);
      toast.success(`Added "${gf.family}" to your collection`);
    } catch { toast.error("Failed to add font"); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!uploadName.trim() || !uploadFamily.trim()) { toast.error("Please enter font name and family"); return; }
    const formData = new FormData();
    formData.append("font", file);
    formData.append("name", uploadName.trim());
    formData.append("family", uploadFamily.trim());
    try {
      const res = await fetch("/api/fonts/upload", { method: "POST", body: formData });
      const font = await res.json();
      if (res.ok) { setFonts((prev) => [font, ...prev]); toast.success(`Uploaded "${uploadFamily}"`); setShowUpload(false); setUploadName(""); setUploadFamily(""); }
      else { toast.error(font.error || "Upload failed"); }
    } catch { toast.error("Failed to upload font"); }
    e.target.value = "";
  };

  const handleDownloadFont = (font: FontItem) => {
    if (font.source === "google") {
      window.open(`https://fonts.google.com/download?family=${encodeURIComponent(font.family)}`, "_blank");
    } else if (font.filePath) {
      const link = document.createElement("a");
      link.href = font.filePath;
      link.download = `${font.family.replace(/\s+/g, "-")}.ttf`;
      link.click();
    }
  };

  const handleDeleteFont = async (id: string) => {
    try {
      await fetch(`/api/fonts?id=${id}`, { method: "DELETE" });
      setFonts((prev) => prev.filter((f) => f.id !== id));
      if (selectedFont?.id === id) setSelectedFont(null);
      toast.success("Font removed");
    } catch { toast.error("Failed to delete font"); }
  };

  const parseVariants = (variantsStr: string): FontVariant[] => {
    try {
      const raw: string[] = JSON.parse(variantsStr);
      return raw.map((v) => {
        let weight = 400; let style = "normal"; let label = v;
        if (v.includes("italic")) style = "italic";
        const num = v.match(/\d+/);
        if (num) weight = parseInt(num[0]);
        const weightLabels: Record<number, string> = { 100: "Thin", 200: "Extra Light", 300: "Light", 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold", 800: "Extra Bold", 900: "Black" };
        label = weightLabels[weight] || `Weight ${weight}`;
        if (style === "italic") label += " Italic";
        return { weight, style, label };
      });
    } catch { return [{ weight: 400, style: "normal", label: "Regular" }]; }
  };

  const variants = selectedFont ? parseVariants(selectedFont.variants) : [];
  const uniqueWeights = [...new Set(variants.map((v) => v.weight))].sort((a, b) => a - b);
  const variantCount = new Set(variants.map((v) => `${v.weight}-${v.style}`)).size;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-white" style={{ lineHeight: 1.2 }}>Font Library</h2>
          <p className="text-[14px] text-[#A0A0A0] mt-1" style={{ lineHeight: 1.5 }}>{fonts.length} fonts in your collection</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGoogleBrowser(!showGoogleBrowser)} className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg text-[14px] font-medium transition-all duration-200 ${showGoogleBrowser ? "bg-[#FF6B35] text-white" : "bg-[#333333] text-[#A0A0A0] hover:bg-[#444444] hover:text-white"}`}>
            <Globe className="w-4 h-4" />Browse Google Fonts
          </button>
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] active:bg-[#E64A19] text-white rounded-lg text-[14px] font-semibold transition-all duration-200"><Upload className="w-4 h-4" />Upload Font</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] bg-[#1E1E1E] border-[#333333] rounded-xl">
              <DialogHeader><DialogTitle className="text-white">Upload Custom Font</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="border-2 border-dashed border-[#333333] rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto text-[#606060] mb-2" />
                  <p className="text-[14px] text-[#A0A0A0] mb-3">Upload .ttf or .otf file</p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[14px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
                    Choose File
                    <input type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#A0A0A0]">Display Name</label>
                  <input placeholder="e.g. My Custom Font" value={uploadName} onChange={(e) => setUploadName(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#A0A0A0]">CSS Font Family</label>
                  <input placeholder="e.g. MyCustomFont" value={uploadFamily} onChange={(e) => setUploadFamily(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* GOOGLE FONTS BROWSER */}
      <AnimatePresence>
        {showGoogleBrowser && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mb-6">
            <div className="bg-[#1E1E1E] border border-[#333333] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#333333]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Browse Google Fonts</h3>
                  <button onClick={() => setShowGoogleBrowser(false)} className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors text-[#A0A0A0]"><X className="w-4 h-4" /></button>
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606060]" />
                  <input placeholder="Search Google Fonts..." value={googleSearch} onChange={(e) => { setGoogleSearch(e.target.value); fetchGoogleFonts(e.target.value); }} className="w-full pl-11 pr-4 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                </div>
                <ScrollArea className="h-72">
                  {googleLoading ? (
                    <div className="space-y-3 p-1">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="flex items-center justify-between p-3"><div><Skeleton className="h-5 w-40 mb-2 bg-[#333333]" /><Skeleton className="h-3 w-24 bg-[#333333]" /></div><Skeleton className="h-8 w-20 bg-[#333333]" /></div>))}</div>
                  ) : googleFonts.length === 0 ? (
                    <div className="text-center py-8 text-[#606060] text-[14px]">No fonts found</div>
                  ) : (
                    <div className="space-y-1">
                      {googleFonts.map((gf) => (
                        <div key={gf.family} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#2A2A2A] transition-colors">
                          <div>
                            <p className="text-[18px] font-medium text-white" style={{ fontFamily: `'${gf.family}', sans-serif` }}>{gf.family}</p>
                            <p className="text-[12px] text-[#606060] mt-0.5">{gf.category} · {JSON.parse(gf.variants).length} variants</p>
                          </div>
                          <button onClick={() => addGoogleFont(gf)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[12px] font-medium transition-all duration-200 flex-shrink-0"><Plus className="w-3.5 h-3.5" />Add</button>
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
          <input placeholder="Search fonts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-36 py-3 bg-[#2A2A2A] border-[#333333] text-[#A0A0A0] rounded-lg"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent className="bg-[#1E1E1E] border-[#333333]">
            <SelectItem value="All" className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">All Sources</SelectItem>
            <SelectItem value="google" className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">Google Fonts</SelectItem>
            <SelectItem value="custom" className="text-[#A0A0A0] focus:bg-[#2A2A2A] focus:text-white">Uploaded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* FONT LIST + PREVIEW */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80 flex-shrink-0">
          <div className="border border-[#333333] rounded-xl overflow-hidden bg-[#1E1E1E]">
            <div className="p-3 border-b border-[#333333] bg-[#1A1A1A]">
              <p className="text-[12px] font-medium text-[#606060] uppercase tracking-wider">Your Fonts</p>
            </div>
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[300px]">
              {loading ? (
                <div className="p-3 space-y-2">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="flex items-center gap-3 p-2"><Skeleton className="w-8 h-8 rounded bg-[#333333]" /><div className="flex-1"><Skeleton className="h-4 w-28 mb-1 bg-[#333333]" /><Skeleton className="h-3 w-16 bg-[#333333]" /></div></div>))}</div>
              ) : fonts.length === 0 ? (
                <div className="text-center py-12 px-4"><Type className="w-8 h-8 mx-auto text-[#606060] mb-2" /><p className="text-[14px] text-[#A0A0A0]">No fonts yet</p><p className="text-[12px] text-[#606060] mt-1">Browse Google Fonts or upload your own</p></div>
              ) : (
                <div>
                  {fonts.map((f) => (
                    <button key={f.id} onClick={() => setSelectedFont(f)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-[#333333]/40 last:border-b-0 ${selectedFont?.id === f.id ? "bg-[#2A2A2A]" : "hover:bg-[#2A2A2A]/60"}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center text-lg flex-shrink-0 text-white" style={{ fontFamily: `'${f.family}', sans-serif` }}>Aa</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium truncate text-white">{f.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#606060] capitalize">{f.source}</span>
                          <span className="text-[10px] text-[#606060]/50">·</span>
                          <span className="text-[10px] text-[#606060]">{(() => { try { return JSON.parse(f.variants).length; } catch { return 0; } })()} variants</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={(e) => { e.stopPropagation(); handleDownloadFont(f); }} className="p-1 rounded hover:bg-[#2A2A2A] transition-all"><Download className="w-3.5 h-3.5 text-[#606060] hover:text-[#A0A0A0]" /></button>
                          </TooltipTrigger>
                          <TooltipContent>{f.source === "google" ? "Download from Google" : "Download Font"}</TooltipContent>
                        </Tooltip>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFont(f.id); }} className="p-1 rounded hover:bg-red-500/10 transition-all"><Trash2 className="w-3 h-3 text-[#606060] hover:text-red-400" /></button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!selectedFont ? (
            <div className="border border-[#333333] rounded-xl bg-[#1E1E1E] h-[calc(100vh-380px)] min-h-[300px] flex items-center justify-center">
              <div className="text-center px-4"><Eye className="w-12 h-12 mx-auto text-[#606060] mb-4" /><h3 className="text-[18px] font-medium text-[#A0A0A0]">Select a font to preview</h3><p className="text-[14px] text-[#606060] mt-1">Choose a font from the list to see how it looks</p></div>
            </div>
          ) : (
            <div className="border border-[#333333] rounded-xl overflow-hidden bg-[#1E1E1E]">
              <div className="p-5 border-b border-[#333333] bg-[#1A1A1A]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[24px] font-bold text-white" style={{ fontFamily: `'${selectedFont.family}', sans-serif` }}>{selectedFont.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="ds-badge text-[10px] px-3 py-1 bg-[#333333] text-[#A0A0A0] capitalize">{selectedFont.source}</span>
                      <span className="text-[12px] text-[#606060]">{variantCount} variant{variantCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => { navigator.clipboard.writeText(`font-family: '${selectedFont.family}', sans-serif;`); toast.success("CSS copied to clipboard!"); }} className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"><Copy className="w-4 h-4 text-[#A0A0A0]" /></button>
                      </TooltipTrigger>
                      <TooltipContent>Copy CSS</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => handleDownloadFont(selectedFont)} className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"><Download className="w-4 h-4 text-[#A0A0A0]" /></button>
                      </TooltipTrigger>
                      <TooltipContent>{selectedFont.source === "google" ? "Download from Google Fonts" : "Download Font File"}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueWeights.map((w) => (
                    <span key={w} className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#2A2A2A] border border-[#333333] text-[10px] font-medium text-[#A0A0A0]">
                      {(() => { const labels: Record<number, string> = { 100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black" }; return labels[w] || `${w}`; })()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 border-b border-[#333333] flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input placeholder="Type your own preview text..." value={previewText} onChange={(e) => setPreviewText(e.target.value)} className="w-full px-4 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#606060] whitespace-nowrap">Size</span>
                  <input type="number" value={previewSize} onChange={(e) => setPreviewSize(parseInt(e.target.value) || 16)} className="w-16 px-3 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white text-center outline-none focus:border-[#FF6B35] transition-colors duration-200" min={8} max={200} />
                  <span className="text-[12px] text-[#606060]">px</span>
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-580px)] min-h-[250px]">
                <div className="p-6 space-y-8">
                  {uniqueWeights.map((w) => {
                    const labels: Record<number, string> = { 100: "Thin", 200: "Extra Light", 300: "Light", 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold", 800: "Extra Bold", 900: "Black" };
                    const label = labels[w] || `Weight ${w}`;
                    const hasItalic = variants.some((v) => v.weight === w && v.style === "italic");
                    return (
                      <div key={w}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[12px] font-medium text-[#606060] uppercase tracking-wider">{label} ({w})</span>
                          {hasItalic && <span className="text-[10px] text-[#606060]/60">· Italic available</span>}
                        </div>
                        <p className="leading-tight break-words text-[#FFFFFF]/90" style={{ fontFamily: `'${selectedFont.family}', sans-serif`, fontWeight: w, fontSize: `${Math.min(previewSize, 96)}px` }}>{previewText}</p>
                        {hasItalic && <p className="leading-tight break-words text-[#FFFFFF]/70 mt-1" style={{ fontFamily: `'${selectedFont.family}', sans-serif`, fontWeight: w, fontStyle: "italic", fontSize: `${Math.min(previewSize * 0.75, 72)}px` }}>{previewText}</p>}
                      </div>
                    );
                  })}
                  <div>
                    <p className="text-[12px] font-medium text-[#606060] uppercase tracking-wider mb-3">Alphabet & Numbers</p>
                    <p className="text-2xl leading-relaxed break-words text-[#FFFFFF]/80" style={{ fontFamily: `'${selectedFont.family}', sans-serif`, fontWeight: 400 }}>
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789<br />!@#$%^&*()_+-=[]{}|;':&quot;,./&lt;&gt;?
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#606060] uppercase tracking-wider mb-3">Paragraph</p>
                    <p className="text-base leading-relaxed text-[#FFFFFF]/70" style={{ fontFamily: `'${selectedFont.family}', sans-serif`, fontWeight: 400 }}>
                      Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.
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