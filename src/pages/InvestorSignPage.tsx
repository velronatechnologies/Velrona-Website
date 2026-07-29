import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { X, Calendar, PenTool, CheckCircle2, Download, FileText, Loader2, ExternalLink, ShieldCheck, Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SignatureDoc {
  _id: string;
  title: string;
  description?: string;
  pdfUrl: string;
  createdAt: string;
}

const InvestorSignPage = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<SignatureDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submittedSignedPdfUrl, setSubmittedSignedPdfUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateSigned, setDateSigned] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/signature-docs/${id}`);
        if (!res.ok) throw new Error("Document not found or has been removed.");
        const data = await res.json();
        setDoc(data);
      } catch (err: any) {
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoc();
  }, [id]);

  // Handle canvas sizing and responsiveness with HDPI support
  useEffect(() => {
    const setupCanvas = () => {
      if (isModalOpen && canvasRef.current) {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        if (parent) {
          const rect = parent.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          const displayWidth = rect.width || 400;
          const displayHeight = 180;

          // Set display size (css)
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayHeight}px`;

          // Set actual size in memory (scaled for retina)
          canvas.width = Math.floor(displayWidth * dpr);
          canvas.height = Math.floor(displayHeight * dpr);

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.strokeStyle = "#0f172a"; // Dark slate stroke
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
          }
        }
      }
    };

    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [isModalOpen]);

  // Helper to get complete absolute PDF URL for Google Docs Viewer and iOS Safari compatibility
  const getFullPdfUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getGoogleDocsUrl = (url: string) => {
    const full = getFullPdfUrl(url);
    if (full.startsWith("data:")) return full;
    if (full.includes("localhost") || full.includes("127.0.0.1")) {
      return `${full}#toolbar=0&navpanes=0&scrollbar=1`;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(full)}&embedded=true`;
  };

  // Prevent iOS Safari page scroll while drawing signature
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isModalOpen) return;

    const preventTouchScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("touchstart", preventTouchScroll, { passive: false });
    canvas.addEventListener("touchmove", preventTouchScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", preventTouchScroll);
      canvas.removeEventListener("touchmove", preventTouchScroll);
    };
  }, [isModalOpen]);

  // Touch & Mouse Drawing Helpers with iOS / Mac safety
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    const nativeEvent = e.nativeEvent as any;
    if ("touches" in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("changedTouches" in e && e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if (nativeEvent && nativeEvent.touches && nativeEvent.touches.length > 0) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
      clientX = mouseEvent.clientX || 0;
      clientY = mouseEvent.clientY || 0;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasSignature(false);
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please enter your full name and email.");
      return;
    }

    if (!hasSignature || !canvasRef.current) {
      toast.error("Please draw your signature before submitting.");
      return;
    }

    const signatureData = canvasRef.current.toDataURL("image/png");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/signature-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docId: id,
          fullName: fullName.trim(),
          email: email.trim(),
          dateSigned,
          signatureData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit signature.");
      }

      const json = await res.json().catch(() => ({}));
      if (json.signedPdfUrl) {
        setSubmittedSignedPdfUrl(json.signedPdfUrl);
      }
      setIsSubmitted(true);
      setIsModalOpen(false);
      toast.success("Signature submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading agreement document...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Document Unavailable</h2>
          <p className="text-slate-500 max-w-md mb-6">{error || "This document URL is invalid or has expired."}</p>
          <Button onClick={() => window.location.href = "/"}>Return to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Header />

      <main className="pt-24 lg:pt-32 pb-24 px-4 sm:px-6 lg:px-12 flex-1">
        <div className="container mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Official Investor Document
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">{doc.title}</h1>
              {doc.description && (
                <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-3xl">{doc.description}</p>
              )}
            </div>
          </div>

          {/* Submission Success Banner */}
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center my-8"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-emerald-950 mb-2 uppercase">Signature Submitted Successfully!</h2>
              <p className="text-emerald-800 text-sm sm:text-base max-w-lg mx-auto mb-4">
                Thank you, <strong>{fullName}</strong>. Your signature has been legally recorded for <strong>{doc.title}</strong>.
              </p>
              <div className="inline-block bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-mono text-emerald-800 mb-6">
                Signed on: {dateSigned} • Email: {email}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" className="rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-100" onClick={() => window.location.href = "/"}>
                  Return to Main Website
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Responsive PDF Reader Frame */}
              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Read & Review Document</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getFullPdfUrl(doc.pdfUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Direct PDF
                    </a>

                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Fullscreen
                    </button>
                  </div>
                </div>

                <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-200 min-h-[480px] sm:min-h-[620px]">
                  <object
                    data={`${getFullPdfUrl(doc.pdfUrl)}#toolbar=1&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    className="w-full h-[550px] sm:h-[680px] lg:h-[780px] rounded-2xl border-0 bg-white"
                  >
                    <iframe
                      src={getGoogleDocsUrl(doc.pdfUrl)}
                      title={doc.title}
                      className="w-full h-[550px] sm:h-[680px] lg:h-[780px] rounded-2xl border-0 bg-white"
                    >
                      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300 h-full bg-slate-900">
                        <FileText className="w-12 h-12 text-blue-400 mb-3" />
                        <p className="font-bold text-white text-base mb-1">Viewing on iOS or Safari?</p>
                        <p className="text-xs text-slate-400 max-w-sm mb-4">
                          Safari on iOS limits embedded PDF previews. Tap below to view the document natively.
                        </p>
                        <a
                          href={getFullPdfUrl(doc.pdfUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
                        >
                          <ExternalLink className="w-4 h-4" /> Open Full PDF Document
                        </a>
                      </div>
                    </iframe>
                  </object>
                </div>
              </div>

              {/* End of Page Action Bar */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center sm:flex sm:items-center sm:justify-between">
                <div className="text-left mb-4 sm:mb-0">
                  <h3 className="font-bold text-slate-900 text-lg">Ready to sign this agreement?</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Please review all pages above before submitting your digital signature.</p>
                </div>
                <Button
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl transition-all uppercase tracking-wider text-xs"
                >
                  <PenTool className="w-4 h-4 mr-2" /> Submit Signature
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Signature Modal matching User Mockup screenshot */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Sign & submit</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Fill in your details and draw your signature.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Content */}
              <form onSubmit={handleSubmitSignature} className="p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FULL NAME</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:border-slate-800 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">EMAIL</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:border-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateSigned" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DATE</Label>
                  <div className="relative">
                    <Input
                      id="dateSigned"
                      type="text"
                      value={dateSigned}
                      onChange={(e) => setDateSigned(e.target.value)}
                      required
                      className="h-11 pr-10 bg-white border-slate-200 rounded-xl text-slate-900 text-sm font-medium"
                    />
                    <Calendar className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Signature Canvas Area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SIGNATURE</Label>
                  </div>

                  <div className="relative w-full border border-slate-200 rounded-2xl bg-white overflow-hidden touch-none group">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-44 cursor-crosshair block"
                    />

                    {/* Guidelines and Overlay */}
                    {!hasSignature && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4">
                        <div className="w-full border-b border-dashed border-slate-200 mb-3" />
                        <p className="text-center text-xs text-slate-400 font-medium">Sign here</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                    >
                      Clear signature
                    </button>
                  </div>
                </div>

                {/* Modal Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs text-slate-400">By signing you confirm the details above are accurate.</p>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl px-6 py-2.5 text-sm shadow-md transition-all shrink-0"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                      </span>
                    ) : (
                      "Submit signature"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && doc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl h-[90vh] bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base uppercase">Document Fullscreen Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getFullPdfUrl(doc.pdfUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Direct PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-900 p-2">
                <object
                  data={`${getFullPdfUrl(doc.pdfUrl)}#toolbar=1&navpanes=0&scrollbar=1`}
                  type="application/pdf"
                  className="w-full h-full rounded-2xl border-0 bg-white"
                >
                  <iframe
                    src={getGoogleDocsUrl(doc.pdfUrl)}
                    title={doc.title}
                    className="w-full h-full rounded-2xl border-0 bg-white"
                  >
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300 h-full bg-slate-900">
                      <FileText className="w-12 h-12 text-blue-400 mb-3" />
                      <p className="font-bold text-white text-base mb-1">Viewing on iOS or Safari?</p>
                      <p className="text-xs text-slate-400 max-w-sm mb-4">
                        Safari on iOS limits embedded PDF previews. Tap below to view the document natively.
                      </p>
                      <a
                        href={getFullPdfUrl(doc.pdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Full PDF Document
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default InvestorSignPage;
