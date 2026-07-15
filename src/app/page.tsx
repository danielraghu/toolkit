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
  Lock,
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

interface BrandAsset {
  id: string;
  type: string;
  name: string;
  value: string;
  metadata: string;
  order: number;
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1E1E1E] border border-[#333333] flex items-center justify-center">
            <Lock className="w-7 h-7 text-[#FF6B35]" />
          </div>
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
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [fonts, setFonts] = useState<FontItem[]>([]);

  // Logo dialog
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoName, setLogoName] = useState("");

  // Font link dialog
  const [fontDialogOpen, setFontDialogOpen] = useState(false);

  // Color dialog
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [colorName, setColorName] = useState("");
  const [colorValue, setColorValue] = useState("#");

  // Gradient dialog
  const [gradientDialogOpen, setGradientDialogOpen] = useState(false);
  const [gradientName, setGradientName] = useState("");
  const [gradientValue, setGradientValue] = useState("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");

  // PDF dialog
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfName, setPdfName] = useState("");

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/brand-assets?type=all");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch {
      toast.error("Failed to load brand assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const fetchFonts = async () => {
    try {
      const res = await fetch("/api/fonts");
      const data = await res.json();
      setFonts(data.fonts || []);
    } catch { /* ignore */ }
  };

  const deleteAsset = async (id: string) => {
    try {
      await fetch(`/api/brand-assets?id=${id}`, { method: "DELETE" });
      toast.success("Asset removed");
      fetchAssets();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ---- LOGO HANDLERS ----
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !logoName.trim()) {
      if (!logoName.trim()) toast.error("Please enter a name");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await fetch("/api/brand-assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "logo", name: logoName.trim(), value: base64, metadata: { mimeType: file.type, size: file.size } }),
        });
        toast.success("Logo added");
        setLogoDialogOpen(false);
        setLogoName("");
        fetchAssets();
      } catch { toast.error("Failed to upload logo"); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ---- FONT LINK HANDLERS ----
  const handleLinkFont = async (font: FontItem) => {
    try {
      await fetch("/api/brand-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "font", name: font.name, value: font.id, metadata: { family: font.family, source: font.source } }),
      });
      toast.success(`"${font.name}" linked to brand`);
      setFontDialogOpen(false);
      fetchAssets();
    } catch { toast.error("Failed to link font"); }
  };

  // ---- COLOR HANDLERS ----
  const handleAddColor = async () => {
    if (!colorName.trim() || !colorValue.trim()) { toast.error("Name and color are required"); return; }
    try {
      await fetch("/api/brand-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "color", name: colorName.trim(), value: colorValue.trim() }),
      });
      toast.success("Color added");
      setColorDialogOpen(false);
      setColorName("");
      setColorValue("#");
      fetchAssets();
    } catch { toast.error("Failed to add color"); }
  };

  // ---- GRADIENT HANDLERS ----
  const handleAddGradient = async () => {
    if (!gradientName.trim() || !gradientValue.trim()) { toast.error("Name and gradient are required"); return; }
    try {
      await fetch("/api/brand-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "gradient", name: gradientName.trim(), value: gradientValue.trim() }),
      });
      toast.success("Gradient added");
      setGradientDialogOpen(false);
      setGradientName("");
      setGradientValue("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
      fetchAssets();
    } catch { toast.error("Failed to add gradient"); }
  };

  // ---- PDF HANDLERS ----
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pdfName.trim()) {
      if (!pdfName.trim()) toast.error("Please enter a name");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await fetch("/api/brand-assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "pdf", name: pdfName.trim(), value: base64, metadata: { mimeType: "application/pdf", size: file.size } }),
        });
        toast.success("PDF uploaded");
        setPdfDialogOpen(false);
        setPdfName("");
        fetchAssets();
      } catch { toast.error("Failed to upload PDF"); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadPdf = (asset: BrandAsset) => {
    const link = document.createElement("a");
    link.href = asset.value;
    link.download = asset.name + ".pdf";
    link.click();
  };

  const logos = assets.filter(a => a.type === "logo");
  const brandFonts = assets.filter(a => a.type === "font");
  const colors = assets.filter(a => a.type === "color");
  const gradients = assets.filter(a => a.type === "gradient");
  const pdfs = assets.filter(a => a.type === "pdf");

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-10">
      {/* HEADER */}
      <div>
        <h2 className="text-[24px] font-bold tracking-tight text-white" style={{ lineHeight: 1.2 }}>Brand Assets</h2>
        <p className="text-[14px] text-[#A0A0A0] mt-1">Manage your brand identity — logos, fonts, colors, gradients, and brand guides</p>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full bg-[#1E1E1E] rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* ---- LOGOS ---- */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center"><ImageIcon className="w-4 h-4 text-[#FF6B35]" /></div>
                <h3 className="text-[18px] font-semibold text-white">Logos</h3>
                <span className="text-[12px] text-[#606060] bg-[#2A2A2A] px-2 py-0.5 rounded-full">{logos.length}</span>
              </div>
              <Dialog open={logoDialogOpen} onOpenChange={(o) => { setLogoDialogOpen(o); if (!o) setLogoName(""); }}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-semibold transition-all duration-200"><Plus className="w-4 h-4" />Add Logo</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] bg-[#1E1E1E] border-[#333333] rounded-xl">
                  <DialogHeader><DialogTitle className="text-white">Add Logo</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-[#A0A0A0]">Name</label>
                      <input placeholder="e.g. Primary Logo Dark" value={logoName} onChange={(e) => setLogoName(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                    </div>
                    <div className="border-2 border-dashed border-[#333333] rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-[#606060] mb-2" />
                      <p className="text-[13px] text-[#A0A0A0] mb-3">Upload PNG, JPG, SVG, or WebP</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
                        Choose File
                        <input type="file" accept=".png,.jpg,.jpeg,.svg,.webp" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {logos.length === 0 ? (
              <div className="border border-[#333333] rounded-xl bg-[#1E1E1E] p-8 text-center">
                <p className="text-[14px] text-[#606060]">No logos yet. Upload your brand logos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {logos.map((logo) => (
                  <div key={logo.id} className="group relative bg-[#1E1E1E] border border-[#333333] rounded-xl p-4 flex flex-col items-center justify-center hover:border-[#444444] transition-all duration-200 aspect-square">
                    <img src={logo.value} alt={logo.name} className="max-w-full max-h-full object-contain" />
                    <p className="text-[11px] text-[#A0A0A0] mt-2 truncate w-full text-center">{logo.name}</p>
                    <button onClick={() => deleteAsset(logo.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ---- BRAND FONTS ---- */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center"><Type className="w-4 h-4 text-[#FF6B35]" /></div>
                <h3 className="text-[18px] font-semibold text-white">Brand Fonts</h3>
                <span className="text-[12px] text-[#606060] bg-[#2A2A2A] px-2 py-0.5 rounded-full">{brandFonts.length}</span>
              </div>
              <Dialog open={fontDialogOpen} onOpenChange={(o) => { setFontDialogOpen(o); if (o) fetchFonts(); }}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-semibold transition-all duration-200"><Plus className="w-4 h-4" />Link Font</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] bg-[#1E1E1E] border-[#333333] rounded-xl">
                  <DialogHeader><DialogTitle className="text-white">Link Brand Font</DialogTitle></DialogHeader>
                  <div className="mt-2">
                    <p className="text-[13px] text-[#A0A0A0] mb-3">Select a font from your library to add as a brand font.</p>
                    <ScrollArea className="max-h-64">
                      <div className="space-y-1">
                        {fonts.length === 0 ? (
                          <p className="text-center text-[14px] text-[#606060] py-8">No fonts in your library. Add some in the Fonts tab first.</p>
                        ) : fonts.map((f) => {
                          const alreadyLinked = brandFonts.some(bf => bf.value === f.id);
                          return (
                            <button key={f.id} onClick={() => !alreadyLinked && handleLinkFont(f)} disabled={alreadyLinked} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${alreadyLinked ? "opacity-40 cursor-not-allowed" : "hover:bg-[#2A2A2A]"}`}>
                              <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center text-lg flex-shrink-0 text-white" style={{ fontFamily: `'${f.family}', sans-serif` }}>Aa</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-medium truncate text-white">{f.name}</p>
                                <p className="text-[11px] text-[#606060] capitalize">{f.source}</p>
                              </div>
                              {alreadyLinked ? <span className="text-[11px] text-[#606060]">Linked</span> : <Plus className="w-4 h-4 text-[#FF6B35] flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {brandFonts.length === 0 ? (
              <div className="border border-[#333333] rounded-xl bg-[#1E1E1E] p-8 text-center">
                <p className="text-[14px] text-[#606060]">No brand fonts linked yet. Link fonts from your library.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {brandFonts.map((bf) => {
                  let meta: { family?: string; source?: string } = {};
                  try { meta = JSON.parse(bf.metadata); } catch {}
                  return (
                    <div key={bf.id} className="flex items-center justify-between px-4 py-3 bg-[#1E1E1E] border border-[#333333] rounded-xl hover:border-[#444444] transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center text-xl flex-shrink-0 text-white" style={{ fontFamily: `'${meta.family || bf.name}', sans-serif` }}>Aa</div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-white truncate">{bf.name}</p>
                          <p className="text-[11px] text-[#606060] capitalize">{meta.source || "unknown"} · {meta.family || bf.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip><TooltipTrigger asChild><button onClick={() => copyToClipboard(`font-family: '${meta.family || bf.name}', sans-serif;`)} className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors"><Copy className="w-4 h-4 text-[#606060] hover:text-[#A0A0A0]" /></button></TooltipTrigger><TooltipContent>Copy CSS</TooltipContent></Tooltip>
                        <button onClick={() => deleteAsset(bf.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-[#606060] hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ---- COLORS ---- */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 via-green-400 to-blue-400" /></div>
                <h3 className="text-[18px] font-semibold text-white">Colors</h3>
                <span className="text-[12px] text-[#606060] bg-[#2A2A2A] px-2 py-0.5 rounded-full">{colors.length}</span>
              </div>
              <Dialog open={colorDialogOpen} onOpenChange={(o) => { setColorDialogOpen(o); if (!o) { setColorName(""); setColorValue("#"); } }}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-semibold transition-all duration-200"><Plus className="w-4 h-4" />Add Color</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] bg-[#1E1E1E] border-[#333333] rounded-xl">
                  <DialogHeader><DialogTitle className="text-white">Add Brand Color</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-[#A0A0A0]">Name</label>
                      <input placeholder="e.g. Primary Orange" value={colorName} onChange={(e) => setColorName(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-[#A0A0A0]">Hex Value</label>
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg border border-[#333333] flex-shrink-0 overflow-hidden" style={{ backgroundColor: colorValue }} />
                        <input placeholder="#FF6B35" value={colorValue} onChange={(e) => setColorValue(e.target.value)} className="flex-1 px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200 font-mono" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button onClick={handleAddColor} disabled={!colorName.trim() || !colorValue.trim()} className="px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[14px] font-semibold transition-all duration-200">Add Color</button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {colors.length === 0 ? (
              <div className="border border-[#333333] rounded-xl bg-[#1E1E1E] p-8 text-center">
                <p className="text-[14px] text-[#606060]">No brand colors yet. Add your color palette.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {colors.map((c) => (
                  <div key={c.id} className="group bg-[#1E1E1E] border border-[#333333] rounded-xl overflow-hidden hover:border-[#444444] transition-all duration-200">
                    <div className="h-20" style={{ backgroundColor: c.value }} />
                    <div className="p-3">
                      <p className="text-[12px] font-medium text-white truncate">{c.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[11px] text-[#606060] font-mono">{c.value}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => copyToClipboard(c.value)} className="p-1 rounded hover:bg-[#2A2A2A] transition-colors"><Copy className="w-3 h-3 text-[#606060] hover:text-[#A0A0A0]" /></button>
                          <button onClick={() => deleteAsset(c.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-all"><Trash2 className="w-3 h-3 text-[#606060] hover:text-red-400" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ---- GRADIENTS ---- */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center"><div className="w-4 h-4 rounded-full" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }} /></div>
                <h3 className="text-[18px] font-semibold text-white">Gradients</h3>
                <span className="text-[12px] text-[#606060] bg-[#2A2A2A] px-2 py-0.5 rounded-full">{gradients.length}</span>
              </div>
              <Dialog open={gradientDialogOpen} onOpenChange={(o) => { setGradientDialogOpen(o); if (!o) { setGradientName(""); setGradientValue("linear-gradient(135deg, #667eea 0%, #764ba2 100%)"); } }}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-semibold transition-all duration-200"><Plus className="w-4 h-4" />Add Gradient</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px] bg-[#1E1E1E] border-[#333333] rounded-xl">
                  <DialogHeader><DialogTitle className="text-white">Add Gradient</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-[#A0A0A0]">Name</label>
                      <input placeholder="e.g. Sunset Glow" value={gradientName} onChange={(e) => setGradientName(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-[#A0A0A0]">CSS Gradient</label>
                      <input placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" value={gradientValue} onChange={(e) => setGradientValue(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[13px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200 font-mono" />
                      <div className="h-24 rounded-lg border border-[#333333]" style={{ background: gradientValue }} />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button onClick={handleAddGradient} disabled={!gradientName.trim() || !gradientValue.trim()} className="px-5 py-3 bg-[#FF6B35] hover:bg-[#FF5722] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-[14px] font-semibold transition-all duration-200">Add Gradient</button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {gradients.length === 0 ? (
              <div className="border border-[#333333] rounded-xl bg-[#1E1E1E] p-8 text-center">
                <p className="text-[14px] text-[#606060]">No gradients yet. Add your brand gradients.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gradients.map((g) => (
                  <div key={g.id} className="group bg-[#1E1E1E] border border-[#333333] rounded-xl overflow-hidden hover:border-[#444444] transition-all duration-200">
                    <div className="h-28" style={{ background: g.value }} />
                    <div className="p-3">
                      <p className="text-[12px] font-medium text-white truncate">{g.name}</p>
                      <p className="text-[10px] text-[#606060] font-mono truncate mt-1">{g.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <button onClick={() => copyToClipboard(g.value)} className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-[#2A2A2A] text-[11px] text-[#A0A0A0] hover:bg-[#333333] transition-colors"><Copy className="w-3 h-3" />Copy CSS</button>
                        <button onClick={() => deleteAsset(g.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-[#606060] hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ---- PDF / BRAND GUIDE ---- */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center"><FileText className="w-4 h-4 text-[#FF6B35]" /></div>
                <h3 className="text-[18px] font-semibold text-white">Brand Guide / PDFs</h3>
                <span className="text-[12px] text-[#606060] bg-[#2A2A2A] px-2 py-0.5 rounded-full">{pdfs.length}</span>
              </div>
              <Dialog open={pdfDialogOpen} onOpenChange={(o) => { setPdfDialogOpen(o); if (!o) setPdfName(""); }}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#FF5722] text-white rounded-lg text-[13px] font-semibold transition-all duration-200"><Upload className="w-4 h-4" />Upload PDF</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px] bg-[#1E1E1E] border-[#333333] rounded-xl">
                  <DialogHeader><DialogTitle className="text-white">Upload Brand Guide</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-[#A0A0A0]">Name</label>
                      <input placeholder="e.g. Brand Guidelines v2" value={pdfName} onChange={(e) => setPdfName(e.target.value)} className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[14px] text-white placeholder:text-[#606060] outline-none focus:border-[#FF6B35] transition-colors duration-200" />
                    </div>
                    <div className="border-2 border-dashed border-[#333333] rounded-lg p-6 text-center">
                      <FileText className="w-8 h-8 mx-auto text-[#606060] mb-2" />
                      <p className="text-[13px] text-[#A0A0A0] mb-3">Upload PDF file</p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#333333] rounded-lg text-[13px] font-medium cursor-pointer hover:bg-[#444444] transition-colors text-[#A0A0A0] hover:text-white">
                        Choose File
                        <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                      </label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {pdfs.length === 0 ? (
              <div className="border border-[#333333] rounded-xl bg-[#1E1E1E] p-8 text-center">
                <p className="text-[14px] text-[#606060]">No PDFs uploaded yet. Add your brand guidelines.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pdfs.map((p) => {
                  let meta: { size?: number } = {};
                  try { meta = JSON.parse(p.metadata); } catch {}
                  return (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-[#1E1E1E] border border-[#333333] rounded-xl hover:border-[#444444] transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] border border-[#333333] flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-red-400" /></div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-[#606060]">{meta.size ? formatFileSize(meta.size) : "PDF"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => downloadPdf(p)} className="p-1.5 rounded-md hover:bg-[#2A2A2A] transition-colors"><Download className="w-4 h-4 text-[#606060] hover:text-[#A0A0A0]" /></button>
                        <button onClick={() => deleteAsset(p.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-[#606060] hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
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
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteFont(f.id); }} className="p-1 rounded hover:bg-red-500/10 transition-all"><Trash2 className="w-3 h-3 text-[#606060] hover:text-red-400" /></button>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => { navigator.clipboard.writeText(`font-family: '${selectedFont.family}', sans-serif;`); toast.success("CSS copied to clipboard!"); }} className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"><Copy className="w-4 h-4 text-[#A0A0A0]" /></button>
                    </TooltipTrigger>
                    <TooltipContent>Copy CSS</TooltipContent>
                  </Tooltip>
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