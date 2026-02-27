import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Upload, Download, X, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";

const Workspace = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { id: string; name: string; original: string; output: string; ts: number }[]
  >([]);
  const [activeTab, setActiveTab] = useState<"editor" | "history">(
    (searchParams.get("tab") as "editor" | "history") || "editor",
  );
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [plan, setPlan] = useState<"free" | "credits">(
    (localStorage.getItem("removix.plan") as "free" | "credits") || "free",
  );
  const limit = plan === "credits" ? 200 : 100;

  const user = getCurrentUser();
  const emailKey = user?.email?.toLowerCase();
  const historyStorageKey = emailKey ? `removix.history.${emailKey}` : "removix.history";
  const usageStorageKey = emailKey ? `removix.usage.${emailKey}` : "removix.usage";

  const todayKey = () => new Date().toISOString().slice(0, 10);
  const readUsage = useCallback(() => {
    try {
      const raw = localStorage.getItem(usageStorageKey);
      if (!raw) return { date: todayKey(), count: 0 };
      const obj = JSON.parse(raw);
      if (obj.date !== todayKey()) return { date: todayKey(), count: 0 };
      return { date: obj.date, count: Number(obj.count) || 0 };
    } catch {
      return { date: todayKey(), count: 0 };
    }
  }, [usageStorageKey]);
  const writeUsage = (count: number) => {
    try {
      localStorage.setItem(usageStorageKey, JSON.stringify({ date: todayKey(), count }));
    } catch {}
  };

  const handleFile = useCallback((f: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(f.type)) return;
    if (f.size > 10 * 1024 * 1024) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const items = Array.from(e.dataTransfer.items || []);
    const imageItem = items.find((it) => it.kind === "file" && it.type.startsWith("image/"));
    const fileFromItem = imageItem?.getAsFile() || e.dataTransfer.files?.[0] || null;
    if (fileFromItem) handleFile(fileFromItem);
  }, [handleFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items || []);
    const imageItem = items.find((it) => it.kind === "file" && it.type.startsWith("image/"));
    const f = imageItem?.getAsFile() || e.clipboardData.files?.[0] || null;
    if (f) {
      e.preventDefault();
      handleFile(f);
    }
  }, [handleFile]);

  const triggerBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const loadHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(historyStorageKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setHistory(arr);
      }
      // Migrate guest history to user on first login
      if (emailKey) {
        const guest = localStorage.getItem("removix.history");
        if (guest && (!raw || raw === "[]")) {
          localStorage.setItem(historyStorageKey, guest);
          localStorage.removeItem("removix.history");
          const arr = JSON.parse(guest);
          if (Array.isArray(arr)) setHistory(arr);
        }
      }
    } catch {}
  }, [historyStorageKey, emailKey]);

  const saveHistory = useCallback(
    (item: { id: string; name: string; original: string; output: string; ts: number }) => {
      const next = [item, ...history].slice(0, 100);
      setHistory(next);
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(next));
      } catch {}
    },
    [history, historyStorageKey],
  );

  const toDataUrl = useCallback(async (src: string) => {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.readAsDataURL(blob);
    });
  }, []);

  const addHistoryFromResult = useCallback(
    async (outputSrc: string, name: string) => {
      let persistSrc = outputSrc;
      if (outputSrc.startsWith("blob:")) {
        try {
          persistSrc = await toDataUrl(outputSrc);
        } catch {}
      }
      if (preview) {
        saveHistory({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name,
          original: preview,
          output: persistSrc,
          ts: Date.now(),
        });
      }
    },
    [preview, saveHistory, toDataUrl],
  );

  const downloadAny = useCallback(async (src: string, filename: string) => {
    try {
      if (src.startsWith("data:") || src.startsWith("blob:")) {
        const a = document.createElement("a");
        a.href = src;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      const r = await fetch(src);
      const b = await r.blob();
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      const a = document.createElement("a");
      a.href = src;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    const usage = readUsage();
    setDailyCount(usage.count);
    if (usage.count >= limit) {
      toast({
        title: "Daily limit reached",
        description: `You have used your ${limit} ${plan === "credits" ? "credits" : "free"} images today.`,
      });
      return;
    }
    setProcessing(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file, file.name || "image.png");
      const res = await fetch("https://eaglethorondor.app.n8n.cloud/webhook/remove-background", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
      }
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json().catch(() => null);
        let url: string | undefined;
        if (json) {
          url = typeof json === "string" ? json : json.url;
        }
        if (url) {
          const cleaned = String(url).trim().replace(/^`|`$/g, "");
          setResult(cleaned);
          if (file) await addHistoryFromResult(cleaned, file.name || "image.png");
          const next = usage.count + 1;
          setDailyCount(next);
          writeUsage(next);
          return;
        }
      }
      if (contentType.startsWith("image/")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setResult(url);
        if (file) await addHistoryFromResult(url, file.name || "image.png");
        const next = usage.count + 1;
        setDailyCount(next);
        writeUsage(next);
        return;
      }
      const text = await res.text().catch(() => "");
      if (text) {
        try {
          const json = JSON.parse(text);
          let url = typeof json === "string" ? json : json?.url;
          if (url) {
            const cleaned = String(url).trim().replace(/^`|`$/g, "");
            setResult(cleaned);
            if (file) await addHistoryFromResult(cleaned, file.name || "image.png");
            const next = usage.count + 1;
            setDailyCount(next);
            writeUsage(next);
            return;
          }
        } catch {}
        toast({ title: "Received response", description: text });
      }
      if (preview) setResult(preview);
    } catch (err: any) {
      toast({
        title: "Background removal failed",
        description: err?.message || "Could not reach the background removal service.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  useEffect(() => {
    const data = sessionStorage.getItem("workspace.initialImage");
    if (data) {
      const name = sessionStorage.getItem("workspace.initialImageName") || "image.png";
      try {
        const arr = data.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/png";
        const bstr = atob(arr[1]);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
        const f = new File([u8arr], name, { type: mime });
        handleFile(f);
      } catch {}
      sessionStorage.removeItem("workspace.initialImage");
      sessionStorage.removeItem("workspace.initialImageName");
    }
    loadHistory();
  }, [handleFile, loadHistory]);

  useEffect(() => {
    const tab = (searchParams.get("tab") as "editor" | "history") || "editor";
    setActiveTab(tab);
    const usage = readUsage();
    setDailyCount(usage.count);
    const p = (searchParams.get("plan") as "free" | "credits") || null;
    if (p && (p === "free" || p === "credits")) {
      setPlan(p);
      localStorage.setItem("removix.plan", p);
    }
  }, [searchParams]);

  const onTabChange = (val: string) => {
    const v = (val === "history" ? "history" : "editor") as "editor" | "history";
    setActiveTab(v);
    const next = new URLSearchParams(searchParams);
    next.set("tab", v);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold mb-2 text-center">
              Upload & <span className="gradient-text">Remove Background</span>
            </h1>
            <p className="text-muted-foreground text-center mb-10">
              JPG, PNG, WEBP • Max 10 MB
            </p>

            <Tabs value={activeTab} onValueChange={onTabChange}>
              <div className="flex justify-center mb-6">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="editor">
                {!preview ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                    className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                      dragOver ? "border-primary bg-primary/5 glow-primary" : "border-border/50 hover:border-primary/40"
                    }`}
                  >
                    <label
                      className="flex flex-col items-center justify-center h-80 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={triggerBrowse}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); triggerBrowse(); } }}
                    >
                      <Upload className="text-primary/60 mb-4" size={56} onClick={triggerBrowse} />
                      <p className="text-foreground font-medium mb-1" onClick={triggerBrowse}>
                        Drag & drop your image here
                      </p>
                      <p className="text-sm text-muted-foreground mb-4" onClick={triggerBrowse}>
                        or click to browse
                      </p>
                      <Button size="sm" className="gradient-btn border-0 text-primary-foreground" type="button" onClick={triggerBrowse}>
                        Browse Files
                      </Button>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="glass rounded-2xl p-4">
                        <p className="text-sm text-muted-foreground mb-3 font-medium">Original</p>
                        <div className="rounded-xl overflow-hidden bg-muted/20 aspect-square flex items-center justify-center">
                          <img src={preview} alt="Original" className="max-w-full max-h-full object-contain" />
                        </div>
                      </div>
                      <div className="glass rounded-2xl p-4">
                        <p className="text-sm text-muted-foreground mb-3 font-medium">Result</p>
                        <div className="rounded-xl overflow-hidden checkerboard aspect-square flex items-center justify-center">
                          {processing ? (
                            <div className="text-center">
                              <Loader2 className="mx-auto text-primary animate-spin mb-2" size={40} />
                              <p className="text-sm text-muted-foreground">Processing...</p>
                            </div>
                          ) : result ? (
                            <img src={result} alt="Result" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <Image className="mx-auto text-muted-foreground/40 mb-2" size={40} />
                              <p className="text-sm text-muted-foreground">Click "Remove Background" to process</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {!result ? (
                        <Button
                          size="lg"
                          className="gradient-btn border-0 text-primary-foreground font-semibold glow-primary"
                          onClick={handleProcess}
                          disabled={processing}
                        >
                          {processing ? (
                            <><Loader2 className="mr-2 animate-spin" size={18} /> Processing...</>
                          ) : (
                            "Remove Background"
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          className="gradient-btn border-0 text-primary-foreground font-semibold glow-primary"
                          onClick={() => downloadAny(result, (file?.name?.replace(/\.[^.]+$/, "") || "image") + "-bg-removed.png")}
                        >
                          <Download className="mr-2" size={18} /> Download PNG
                        </Button>
                      )}
                      <Button size="lg" variant="outline" onClick={reset} className="border-border/50">
                        <X className="mr-2" size={18} /> New Image
                      </Button>
                      <div className="text-xs text-muted-foreground self-center">
                        Uses left today ({plan}): {Math.max(limit - dailyCount, 0)}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="history">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {history.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground col-span-full">No history yet</div>
                  ) : (
                    history.map((h) => (
                      <div key={h.id} className="glass rounded-xl p-3">
                        <div className="rounded-lg overflow-hidden aspect-square bg-muted/20 flex items-center justify-center mb-3">
                          <img src={h.output} alt={h.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="text-xs text-muted-foreground truncate mb-2">{h.name}</div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border/50"
                            onClick={() => window.open(h.output, "_blank")}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadAny(h.output, h.name.replace(/\.[^.]+$/, "") + "-bg-removed.png")}
                            className="gradient-btn border-0 text-primary-foreground"
                          >
                            <Download className="mr-2" size={16} /> Download
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Workspace;
