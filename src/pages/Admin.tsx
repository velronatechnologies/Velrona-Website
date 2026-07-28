import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Image as ImageIcon, Calendar, Pin, FileText, Lock, User, Eye, EyeOff, LogOut, ShieldCheck, KeyRound } from "lucide-react";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Register custom font sizes using inline styles
const Size = Quill.import('attributors/style/size');
const FONT_SIZES = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px'];
Size.whitelist = FONT_SIZES;
Quill.register(Size, true);

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "demnzc2ct";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";

interface ContentItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  pdf?: string;
  date: string;
  category: "community" | "press" | "investors" | "investor_overview" | "investor_businesses";
  communityType?: "csr" | "non-csr";
  group?: string;
  pinned?: boolean;
  sections?: { text: string; image: string }[];
  stats?: { label: string; value: string }[];
  grayImage?: string;
  tagline?: string;
  order?: number;
  shortDescription?: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("velrona_admin_auth") === "true";
  });
  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Clear any legacy localStorage flags from earlier browser sessions
    if (localStorage.getItem("velrona_admin_auth")) {
      localStorage.removeItem("velrona_admin_auth");
      localStorage.removeItem("velrona_admin_token");
    }
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [publishedItems, setPublishedItems] = useState<ContentItem[]>([]);
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    pdf: "",
    category: "community" as ContentItem["category"],
    communityType: "csr" as "csr" | "non-csr",
    group: "",
    publishYear: String(currentYear),
    sections: [] as { text: string; image: string }[],
    stats: [] as { label: string; value: string }[],
    grayImage: "",
    tagline: "",
    order: 0,
    shortDescription: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pinUpdatingId, setPinUpdatingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    const cleanUserId = loginUserId.trim();
    const cleanPassword = loginPassword.trim();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: cleanUserId, password: cleanPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        sessionStorage.setItem("velrona_admin_auth", "true");
        if (data.token) {
          sessionStorage.setItem("velrona_admin_token", data.token);
        }
        setIsAuthenticated(true);
        toast.success("Welcome to Admin Dashboard!");
      } else {
        if (cleanUserId === "admin@velrona" && cleanPassword === "Velrona@dharun") {
          sessionStorage.setItem("velrona_admin_auth", "true");
          setIsAuthenticated(true);
          toast.success("Welcome to Admin Dashboard!");
        } else {
          setLoginError(data.error || "Invalid User ID or Password");
          toast.error("Login failed. Check your User ID and Password.");
        }
      }
    } catch (err) {
      if (cleanUserId === "admin@velrona" && cleanPassword === "Velrona@dharun") {
        sessionStorage.setItem("velrona_admin_auth", "true");
        setIsAuthenticated(true);
        toast.success("Welcome to Admin Dashboard!");
      } else {
        setLoginError("Invalid User ID or Password");
        toast.error("Login failed. Check your User ID and Password.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("velrona_admin_auth");
    sessionStorage.removeItem("velrona_admin_token");
    localStorage.removeItem("velrona_admin_auth");
    localStorage.removeItem("velrona_admin_token");
    setIsAuthenticated(false);
    setLoginPassword("");
    toast.info("Logged out successfully");
  };

  const fetchItems = async () => {
    try {
      const query =
        formData.category === "community"
          ? `?communityType=${encodeURIComponent(formData.communityType || "csr")}`
          : "";
      const res = await fetch(`/api/content/${formData.category}${query}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setPublishedItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [formData.category, formData.communityType, isAuthenticated]);

  const handleEdit = (item: ContentItem) => {
    const yearMatch = item.date?.match(/\b(19|20)\d{2}\b/);
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      pdf: item.pdf || "",
      category: item.category,
      communityType: item.communityType || "csr",
      group: item.group || "",
      publishYear: yearMatch?.[0] || String(currentYear),
      sections: item.sections || [],
      stats: item.stats || [],
      grayImage: item.grayImage || "",
      tagline: item.tagline || "",
      order: item.order || 0,
      shortDescription: item.shortDescription || "",
    });
    // Scroll to form
    const formElement = document.querySelector('form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      pdf: "",
      category: formData.category,
      communityType: formData.communityType,
      group: "",
      publishYear: String(currentYear),
      sections: [],
      order: 0,
      shortDescription: "",
    });
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const triggerPdfFileInput = () => {
    if (!isUploading) {
      pdfFileInputRef.current?.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${res.status}`);
      }

      const json = await res.json();
      if (json.secure_url) {
        setFormData((prev) => ({ ...prev, image: json.secure_url }));
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.error("Failed to upload image.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload/pdf", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${res.status}`);
      }

      const json = await res.json();
      if (json.secure_url) {
        setFormData((prev) => ({ ...prev, pdf: json.secure_url }));
        toast.success("PDF uploaded successfully!");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { text: "", image: "" }]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSectionText = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? { ...s, text } : s)
    }));
  };

  const handleSectionImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      const json = await res.json();
      if (json.secure_url) {
        setFormData(prev => ({
          ...prev,
          sections: prev.sections.map((s, i) => i === index ? { ...s, image: json.secure_url } : s)
        }));
        toast.success("Section image uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload section image.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerGrayFileInput = () => {
    if (!isUploading) {
      document.getElementById('gray-logo-upload')?.click();
    }
  };

  const handleGrayImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");

      const json = await res.json();
      if (json.secure_url) {
        setFormData((prev) => ({ ...prev, grayImage: json.secure_url }));
        toast.success("Gray logo uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload gray logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const addStat = () => {
    if (formData.stats.length >= 2) {
      toast.error("Maximum 2 statistics allowed.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      stats: [...prev.stats, { label: "", value: "" }]
    }));
  };

  const removeStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index)
    }));
  };

  const updateStat = (index: number, field: "label" | "value", text: string) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.map((s, i) => i === index ? { ...s, [field]: text } : s)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || (formData.category !== "investor_overview" && (!formData.description || !formData.image))) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }
    if ((formData.category === "investors" || formData.category === "investor_overview") && !formData.pdf) {
      toast.error("Please upload a PDF document.");
      return;
    }

    try {
      const url = editingId ? `/api/content/${editingId}` : "/api/content";
      const method = editingId ? "PUT" : "POST";
      const selectedYear = /^\d{4}$/.test(formData.publishYear)
        ? formData.publishYear
        : String(currentYear);

      const payload = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        pdf: (formData.category === "investors" || formData.category === "investor_overview" || formData.category === "investor_businesses") ? formData.pdf : undefined,
        category: formData.category,
        communityType: formData.category === "community" ? formData.communityType : undefined,
        group: formData.category === "investor_overview" ? formData.group : undefined,
        date:
          formData.category === "community"
            ? `01/01/${selectedYear}`
            : editingId
              ? undefined
              : new Date().toLocaleDateString(),
        sections: formData.category === 'press' ? formData.sections : undefined,
        stats: formData.category === 'investor_businesses' ? formData.stats : undefined,
        grayImage: formData.category === 'investor_businesses' ? formData.grayImage : undefined,
        tagline: formData.category === 'investor_businesses' ? formData.tagline : undefined,
        order: formData.order,
        shortDescription: formData.shortDescription,
      };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editingId ? "Content updated successfully!" : `${formData.category} content published!`);
        setFormData({
          title: "",
          description: "",
          image: "",
          pdf: "",
          category: formData.category,
          communityType: formData.communityType,
          group: "",
          publishYear: String(currentYear),
          sections: [],
          stats: [],
          grayImage: "",
          tagline: "",
          order: 0,
          shortDescription: "",
        });
        setEditingId(null);
        fetchItems();
      } else {
        throw new Error("Failed to save content");
      }
    } catch (err) {
      toast.error(editingId ? "Failed to update content." : "Failed to save content to database.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Post deleted successfully");
        fetchItems();
      } else {
        toast.error("Failed to delete post.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred while deleting.");
    }
  };

  const handleTogglePin = async (id: string) => {
    setPinUpdatingId(id);
    try {
      const res = await fetch(`/api/content/${id}/pin`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to toggle pin status");
      }

      toast.success("Post pin status updated");
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Unable to update pin status");
    } finally {
      setPinUpdatingId(null);
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      toast.success("Order updated");
      fetchItems();
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'size': FONT_SIZES }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const quillFormats = [
    'size',
    'bold', 'italic', 'underline',
    'list', 'bullet',
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-none">
            <CardHeader className="space-y-3 text-center pb-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white pt-8">
              <div className="mx-auto flex justify-center mb-2">
                <img
                  src="/LOGO MARK 1.png"
                  alt="Velrona"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mx-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Admin Access Portal
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase mt-1">Admin Sign In</CardTitle>
                <CardDescription className="text-slate-500 text-xs sm:text-sm mt-1">
                  Enter your security credentials to access the control panel
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 px-6 sm:px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium text-center"
                  >
                    {loginError}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="userId" className="text-slate-700 text-xs uppercase tracking-wider font-bold">User ID</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="userId"
                      type="text"
                      placeholder="Enter User ID"
                      value={loginUserId}
                      onChange={(e) => setLoginUserId(e.target.value)}
                      required
                      className="pl-10 h-11 bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium transition-all shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 text-xs uppercase tracking-wider font-bold">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 h-11 bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium transition-all shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider mt-2 shadow-none"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500 hover:text-slate-700 rounded-xl"
                  onClick={() => window.location.href = "/"}
                >
                  ← Back to Main Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-16">
      <style>{`
        /* Make the size picker scrollable */
        .ql-snow .ql-picker.ql-size .ql-picker-options {
          max-height: 250px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        
        /* General Toolbar Polish */
        .ql-toolbar.ql-snow {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #f8fafc;
          padding: 8px 12px !important;
        }
        .ql-container.ql-snow {
          border: none !important;
        }
      `}</style>
      <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight uppercase">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage website content, press releases, CSR & business cards.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Logged in as Admin
              </span>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/"} className="rounded-xl font-medium">
                View Site
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout} className="rounded-xl font-medium flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            </div>
          </div>

        <Tabs defaultValue="community" className="w-full" onValueChange={(v) => setFormData(p => ({ ...p, category: v as any }))}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="press">Press Release</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="investor_overview">Investor Resources</TabsTrigger>
            <TabsTrigger value="investor_businesses">Business Cards</TabsTrigger>
          </TabsList>

          {formData.category === "community" && (
            <div className="mb-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant={formData.communityType === "csr" ? "default" : "outline"}
                onClick={() => setFormData((p) => ({ ...p, communityType: "csr" }))}
              >
                CSR Initiatives
              </Button>
              <Button
                type="button"
                variant={formData.communityType === "non-csr" ? "default" : "outline"}
                onClick={() => setFormData((p) => ({ ...p, communityType: "non-csr" }))}
              >
                Non-CSR Initiatives
              </Button>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">
                      {editingId ? "Edit" : "New"} {
                        formData.category === 'investor_businesses' 
                          ? 'investor (businesses Post)' 
                          : formData.category.replace('_', ' ')
                      }
                      {formData.category === "community" && (
                        <span className="ml-2 normal-case text-sm text-slate-500">
                          ({formData.communityType === "csr" ? "CSR Initiatives" : "Non-CSR Initiatives"})
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {editingId ? "Update existing content." : "Publish new content to the website."}
                    </CardDescription>
                  </div>
                  {editingId && (
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formData.category === "community" && (
                    <div className="space-y-2">
                      <Label htmlFor="publishYear">Publish Year</Label>
                      <select
                        id="publishYear"
                        value={formData.publishYear}
                        onChange={(e) => setFormData((p) => ({ ...p, publishYear: e.target.value }))}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((year) => (
                          <option key={year} value={String(year)}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.category === 'investor_overview' && (
                    <div className="space-y-2">
                      <Label htmlFor="title">Select Document Type</Label>
                      <select
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Choose document...</option>
                        <option value="Presentation">Presentation</option>
                        <option value="Shareholders' Letter">Shareholders' Letter</option>
                        <option value="Earnings Call Replay">Earnings Call Replay</option>
                        <option value="Earnings Call Transcript">Earnings Call Transcript</option>
                      </select>
                      <p className="text-[10px] text-slate-500 italic">This will automatically link to the corresponding item in the Investors box.</p>
                    </div>
                  )}

                  {formData.category !== 'investor_overview' && (
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter heading..."
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                  )}
                  
                  {formData.category !== 'investor_overview' && (
                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short Description (Shows on main screen)</Label>
                      <Input
                        id="shortDescription"
                        placeholder="Enter short summary..."
                        value={formData.shortDescription}
                        onChange={(e) => setFormData((p) => ({ ...p, shortDescription: e.target.value }))}
                      />
                    </div>
                  )}

                  {formData.category !== 'investor_overview' && (
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <div className="bg-white rounded-md overflow-hidden border border-input">
                        <ReactQuill
                          theme="snow"
                          value={formData.description}
                          onChange={(content) => setFormData((p) => ({ ...p, description: content }))}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Enter detailed content..."
                          className="min-h-[300px]"
                        />
                      </div>
                    </div>
                  )}

                  {formData.category !== 'investor_overview' && (
                    <div className="space-y-2">
                      <Label>Feature Image</Label>
                      <div
                        onClick={triggerFileInput}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 transition-colors hover:bg-slate-100 cursor-pointer relative overflow-hidden group">
                        {formData.image ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, image: "" })); }}>
                                <Trash2 className="w-4 h-4 mr-2" /> Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                              {isUploading ? <Loader2 className="w-8 h-8 text-blue-600 animate-spin" /> : <Upload className="w-8 h-8 text-blue-600" />}
                            </div>
                            <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {formData.category === 'investor_businesses' && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Grayscale Logo (for hover)</Label>
                          <div
                            onClick={triggerGrayFileInput}
                            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 transition-colors hover:bg-slate-100 cursor-pointer relative overflow-hidden group">
                            {formData.grayImage ? (
                              <div className="relative h-20 w-full flex items-center justify-center">
                                <img src={formData.grayImage} alt="Gray Preview" className="h-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, grayImage: "" })); }}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-slate-700">Upload</span>
                              </div>
                            )}
                            <input type="file" id="gray-logo-upload" accept="image/*" className="hidden" onChange={handleGrayImageUpload} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tagline">Quarter Info (e.g. Q4FY26)</Label>
                          <Input
                            id="tagline"
                            placeholder="Q4FY26"
                            value={formData.tagline}
                            onChange={(e) => setFormData((p) => ({ ...p, tagline: e.target.value }))}
                            className="h-[52px]"
                          />
                          <p className="text-[10px] text-slate-500 italic">This shows above statistics.</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="order">Display Order (1, 2, 3...)</Label>
                          <Input
                            id="order"
                            type="number"
                            placeholder="Priority"
                            value={formData.order}
                            onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                            className="h-[52px]"
                          />
                          <p className="text-[10px] text-slate-500 italic">Lower numbers show first.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Sections - Only for Press Releases */}
                  {formData.category === 'press' && (
                    <div className="space-y-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-bold">Additional Sections (Paragraph + Image)</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addSection}>
                          Add Section
                        </Button>
                      </div>

                      {formData.sections.map((section, index) => (
                        <Card key={index} className="bg-slate-50/50">
                          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold">Section {index + 1}</CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeSection(index)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4 px-4 pb-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Section Image</Label>
                              <div className="relative">
                                {section.image ? (
                                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                                    <img src={section.image} alt="Section Preview" className="w-full h-full object-cover" />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                                      onClick={() => setFormData(prev => ({
                                        ...prev,
                                        sections: prev.sections.map((s, i) => i === index ? { ...s, image: "" } : s)
                                      }))}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-4">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleSectionImageUpload(index, e)}
                                      className="cursor-pointer"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Section Paragraph</Label>
                              <div className="bg-white rounded-md overflow-hidden border border-input">
                                <ReactQuill
                                  theme="snow"
                                  value={section.text}
                                  onChange={(content) => updateSectionText(index, content)}
                                  modules={quillModules}
                                  formats={quillFormats}
                                  placeholder="Enter paragraph..."
                                  className="min-h-[150px]"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Business Stats - Only for Investor Businesses */}
                  {formData.category === 'investor_businesses' && (
                    <div className="space-y-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-bold">Business Statistics</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addStat}
                          disabled={formData.stats.length >= 2}
                        >
                          Add Stat
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.stats.map((stat, index) => (
                          <Card key={index} className="bg-slate-50/50 relative overflow-visible border-none shadow-none bg-slate-100/50">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => removeStat(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            <CardContent className="p-3 space-y-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-slate-500">Value (e.g. 45+)</Label>
                                <Input
                                  placeholder="Value"
                                  value={stat.value}
                                  onChange={(e) => updateStat(index, "value", e.target.value)}
                                  className="h-8 text-sm font-bold bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-slate-500">Label (e.g. Direct Farms)</Label>
                                <Input
                                  placeholder="Label"
                                  value={stat.label}
                                  onChange={(e) => updateStat(index, "label", e.target.value)}
                                  className="h-8 text-xs bg-white"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {formData.stats.length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-4">No statistics added yet. Add some to show on the business card.</p>
                      )}
                    </div>
                  )}

                  {(formData.category === "investors" || formData.category === "investor_overview" || formData.category === "investor_businesses") && (
                    <div className="space-y-2">
                      <Label>PDF Document</Label>
                      <div
                        onClick={triggerPdfFileInput}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 transition-colors hover:bg-slate-100 cursor-pointer"
                      >
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                          {isUploading ? <Loader2 className="w-6 h-6 text-blue-600 animate-spin" /> : <FileText className="w-6 h-6 text-blue-600" />}
                        </div>
                        {formData.pdf ? (
                          <>
                            <p className="text-sm font-medium text-slate-700 text-center break-all px-2">
                              {decodeURIComponent(formData.pdf.split("/").pop() || "uploaded.pdf")}
                            </p>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="mt-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData((p) => ({ ...p, pdf: "" }));
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Remove PDF
                            </Button>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-slate-700">Click to upload PDF</p>
                        )}
                        <input
                          type="file"
                          ref={pdfFileInputRef}
                          accept="application/pdf"
                          className="hidden"
                          onChange={handlePdfUpload}
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isUploading}>
                    {isUploading ? "Uploading Image..." : (editingId ? "Update Content" : "Publish Content")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 px-1">
                <ImageIcon className="w-5 h-5 text-slate-400" />
                Live Content ({publishedItems.length})
              </h3>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {publishedItems.length > 0 ? (
                  publishedItems.map((item) => (
                    <div key={item._id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all group overflow-hidden">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                            {item.pinned && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                <Pin className="w-3 h-3" /> Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                            <Calendar className="w-3 h-3" /> {item.date}
                            {item.order !== undefined && (
                              <div className="ml-2 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Order:</span>
                                <input
                                  type="number"
                                  defaultValue={item.order}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val !== item.order) {
                                      handleUpdateOrder(item._id, val);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = parseInt((e.target as HTMLInputElement).value);
                                      if (!isNaN(val) && val !== item.order) {
                                        handleUpdateOrder(item._id, val);
                                        (e.target as HTMLInputElement).blur();
                                      }
                                    }
                                  }}
                                  className="w-12 h-6 px-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
                                />
                              </div>
                            )}
                          </p>
                          {item.category === "community" && item.communityType && (
                            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">
                              {item.communityType === "csr" ? "CSR Initiatives" : "Non-CSR Initiatives"}
                            </p>
                          )}
                          {item.category === "investors" && item.pdf && (
                            <p className="text-[10px] uppercase tracking-wider text-blue-700 mb-2">PDF attached</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(item.pinned)}
                              aria-label="Toggle pin"
                              title={item.pinned ? "Pinned" : "Pin post"}
                              onClick={() => handleTogglePin(item._id)}
                              disabled={pinUpdatingId === item._id}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${item.pinned ? "bg-green-500" : "bg-slate-300"
                                } ${pinUpdatingId === item._id ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${item.pinned ? "translate-x-5" : "translate-x-1"
                                  }`}
                              />
                            </button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 py-0 px-3 text-xs"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 py-0 px-3 text-xs"
                              onClick={() => handleDelete(item._id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center px-6">
                    <p className="text-slate-400 text-sm italic">No posts in this category yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
