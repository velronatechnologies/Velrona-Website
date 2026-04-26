import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Image as ImageIcon, Calendar, Pin } from "lucide-react";
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
  date: string;
  category: "community" | "press" | "investors";
  communityType?: "csr" | "non-csr";
  pinned?: boolean;
}

const Admin = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [publishedItems, setPublishedItems] = useState<ContentItem[]>([]);
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    category: "community" as ContentItem["category"],
    communityType: "csr" as "csr" | "non-csr",
    publishYear: String(currentYear),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pinUpdatingId, setPinUpdatingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, [formData.category, formData.communityType]);

  const fetchItems = async () => {
    try {
      const query =
        formData.category === "community"
          ? `?communityType=${encodeURIComponent(formData.communityType)}`
          : "";
      const res = await fetch(`/api/content/${formData.category}${query}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setPublishedItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  const handleEdit = (item: ContentItem) => {
    const yearMatch = item.date?.match(/\b(19|20)\d{2}\b/);
    setEditingId(item._id);
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      category: item.category,
      communityType: item.communityType || "csr",
      publishYear: yearMatch?.[0] || String(currentYear),
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
      category: formData.category,
      communityType: formData.communityType,
      publishYear: String(currentYear),
    });
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.image) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const url = editingId ? `/api/content/${editingId}` : "/api/content";
      const method = editingId ? "PUT" : "POST";
      const selectedYear = /^\d{4}$/.test(formData.publishYear)
        ? formData.publishYear
        : String(currentYear);
      
      const payload = {
        ...formData,
        communityType: formData.category === "community" ? formData.communityType : undefined,
        date: `01/01/${selectedYear}`,
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
          category: formData.category,
          communityType: formData.communityType,
          publishYear: String(currentYear),
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

  const quillModules = {
    toolbar: [
      [{ 'size': FONT_SIZES }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const quillFormats = [
    'size',
    'bold', 'italic', 'underline',
    'list', 'bullet',
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 lg:px-16">
      <style>{`
        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before {
          content: '14px' !important;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label {
          color: #334155 !important;
          text-decoration: none !important;
          outline: none !important;
          padding-left: 8px !important;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="8px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="8px"]::before { content: '8px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="10px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="10px"]::before { content: '10px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="12px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before { content: '12px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before { content: '14px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before { content: '16px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="18px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before { content: '18px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="20px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before { content: '20px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before { content: '24px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="28px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="28px"]::before { content: '28px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="32px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="32px"]::before { content: '32px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="36px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="36px"]::before { content: '36px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="40px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="40px"]::before { content: '40px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="48px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="48px"]::before { content: '48px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="56px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="56px"]::before { content: '56px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="64px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="64px"]::before { content: '64px' !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="72px"]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="72px"]::before { content: '72px' !important; }
        
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
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-2">Manage your website content and media.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            View Website
          </Button>
        </div>

        <Tabs defaultValue="community" className="w-full" onValueChange={(v) => setFormData(p => ({ ...p, category: v as any }))}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="press">Press Release</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
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
                      {editingId ? "Edit" : "New"} {formData.category} Post
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

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter heading..."
                      value={formData.title}
                      onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>

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
                          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </>
                      )}
                    </div>
                  </div>

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
                          </p>
                          {item.category === "community" && item.communityType && (
                            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">
                              {item.communityType === "csr" ? "CSR Initiatives" : "Non-CSR Initiatives"}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <Button
                              type="button"
                              variant={item.pinned ? "default" : "outline"}
                              size="sm"
                              className={`h-8 py-0 px-3 text-xs ${item.pinned ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                              onClick={() => handleTogglePin(item._id)}
                              disabled={pinUpdatingId === item._id}
                            >
                              <Pin className="w-3 h-3 mr-1" />
                              {pinUpdatingId === item._id ? "Saving..." : item.pinned ? "Pinned" : "Pin"}
                            </Button>
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
