import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Upload, Download, X, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

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
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "settings" | "billing" | "keys">(
    (searchParams.get("tab") as any) || "dashboard",
  );
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [plan, setPlan] = useState<"free" | "credits">(
    (localStorage.getItem("removix.plan") as "free" | "credits") || "free",
  );
  const limit = plan === "credits" ? 200 : 100;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [profileName, setProfileName] = useState<string>(getCurrentUser()?.name || "");
  const [profilePass, setProfilePass] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const user = getCurrentUser();
  const emailKey = user?.email?.toLowerCase();
  const historyStorageKey = emailKey ? `removix.history.${emailKey}` : "removix.history";
  const usageStorageKey = emailKey ? `removix.usage.${emailKey}` : "removix.usage";
  const apiKeyStorageKey = emailKey ? `removix.apikey.${emailKey}` : "removix.apikey";
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(apiKeyStorageKey) || "";
    } catch {
      return "";
    }
  });

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
    async (item: { id: string; name: string; original: string; output: string; ts: number }) => {
      const next = [item, ...history].slice(0, 100);
      setHistory(next);
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(next));
      } catch {}
      const supabase = await getSupabaseClient();
      if (supabase && emailKey) {
        supabase.from("histories").insert({
          email: emailKey,
          name: item.name,
          original: item.original,
          output: item.output,
          ts: item.ts,
        }).then(() => {}).catch(() => {});
      }
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
    (async () => {
      const supabase = await getSupabaseClient();
      if (supabase && emailKey) {
        supabase
          .from("histories")
          .select("*")
          .eq("email", emailKey)
          .order("ts", { ascending: false })
          .then(({ data, error }: any) => {
            if (!error && Array.isArray(data) && data.length) {
              const mapped = data.map((r: any) => ({
                id: String(r.id ?? `${r.ts}`),
                name: r.name,
                original: r.original,
                output: r.output,
                ts: r.ts,
              }));
              setHistory(mapped);
            }
          })
          .catch(() => {});
        try {
          const channel = supabase
            .channel("histories-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "histories", filter: `email=eq.${emailKey}` }, (payload: any) => {
              if (payload.new) {
                const r = payload.new;
                const item = {
                  id: String(r.id ?? `${r.ts}`),
                  name: r.name,
                  original: r.original,
                  output: r.output,
                  ts: r.ts,
                };
                setHistory((prev) => {
                  const exists = prev.find((p) => p.id === item.id);
                  if (exists) return prev;
                  return [item, ...prev].slice(0, 100);
                });
              }
            })
            .subscribe();
          return () => {
            try {
              channel.unsubscribe();
            } catch {}
          };
        } catch {}
      }
    })();
  }, [handleFile, loadHistory]);

  useEffect(() => {
    const tab = (searchParams.get("tab") as any) || "dashboard";
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
    const v = (["dashboard","history","settings","billing","keys"].includes(val) ? val : "dashboard") as any;
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
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="keys">API Keys</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="dashboard">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Images processed</p>
                    <p className="text-3xl font-bold">{history.length}</p>
                  </div>
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Uses left today</p>
                    <p className="text-3xl font-bold">{Math.max(limit - dailyCount, 0)}</p>
                  </div>
                  <div className="glass rounded-2xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="text-3xl font-bold capitalize">{plan}</p>
                  </div>
                </div>
                <div
                  onClick={triggerBrowse}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") triggerBrowse(); }}
                  tabIndex={0}
                  role="button"
                  className="glass rounded-2xl border-2 border-dashed hover:border-primary/40 transition-all cursor-pointer mb-6"
                >
                  <div className="flex flex-col items-center justify-center h-48">
                    <Upload className="text-primary/60 mb-2" size={40} />
                    <p className="text-sm text-muted-foreground">Quick upload (click to browse)</p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
                {preview ? (
                  <div className="space-y-6 mb-8">
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
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Recent</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {history.slice(0, 6).map((h) => (
                      <div key={h.id} className="glass rounded-xl p-2">
                        <div className="rounded-lg overflow-hidden aspect-square bg-muted/20 flex items-center justify-center">
                          <img src={h.output} alt={h.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <div className="text-sm text-muted-foreground">No history yet</div>
                    )}
                  </div>
                </div>
              </TabsContent>
              {/* Upload tab removed; dashboard includes upload and processing */}
              <TabsContent value="settings">
                <div className="glass rounded-2xl p-6">
                  <p className="text-sm text-muted-foreground mb-4">Profile Settings</p>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Display Name</p>
                        <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" />
                      </div>
                      <Button
                        variant="outline"
                        className="border-border/50"
                        onClick={() => {
                          if (!user || !profileName.trim()) return;
                          try {
                            const raw = localStorage.getItem("removix.users");
                            const arr = raw ? JSON.parse(raw) : [];
                            const idx = arr.findIndex((u: any) => u.email === user.email);
                            if (idx >= 0) {
                              arr[idx].name = profileName.trim();
                              localStorage.setItem("removix.users", JSON.stringify(arr));
                              toast({ title: "Name updated" });
                            }
                          } catch {
                            toast({ title: "Update failed", description: "Could not update name" });
                          }
                        }}
                      >
                        Save Name
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">New Password</p>
                        <Input type="password" value={profilePass} onChange={(e) => setProfilePass(e.target.value)} placeholder="********" />
                      </div>
                      <Button
                        variant="outline"
                        className="border-border/50"
                        onClick={async () => {
                          if (!user || !profilePass) return;
                          try {
                            const raw = localStorage.getItem("removix.users");
                            const arr = raw ? JSON.parse(raw) : [];
                            const idx = arr.findIndex((u: any) => u.email === user.email);
                            if (idx >= 0) {
                              const enc = new TextEncoder();
                              const data = enc.encode(profilePass);
                              const digest = await crypto.subtle.digest("SHA-256", data);
                              const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
                              arr[idx].passwordHash = hash;
                              localStorage.setItem("removix.users", JSON.stringify(arr));
                              setProfilePass("");
                              toast({ title: "Password updated" });
                            }
                          } catch {
                            toast({ title: "Update failed", description: "Could not update password" });
                          }
                        }}
                      >
                        Save Password
                      </Button>
                    </div>
                    <div>
                      {!confirmDelete ? (
                        <Button
                          variant="destructive"
                          onClick={() => setConfirmDelete(true)}
                        >
                          Delete Account
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <p className="text-sm">Confirm delete?</p>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (!user) return;
                              try {
                                const raw = localStorage.getItem("removix.users");
                                const arr = raw ? JSON.parse(raw) : [];
                                const next = arr.filter((u: any) => u.email !== user.email);
                                localStorage.setItem("removix.users", JSON.stringify(next));
                                localStorage.removeItem(`removix.history.${user.email.toLowerCase()}`);
                                localStorage.removeItem(`removix.usage.${user.email.toLowerCase()}`);
                                localStorage.removeItem("removix.session");
                                toast({ title: "Account deleted" });
                                window.location.href = "/";
                              } catch {
                                toast({ title: "Delete failed", description: "Could not delete account" });
                              }
                            }}
                          >
                            Yes, Delete
                          </Button>
                          <Button variant="outline" className="border-border/50" onClick={() => setConfirmDelete(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="billing">
                <div className="glass rounded-2xl p-6">
                  <p className="text-sm text-muted-foreground mb-4">Plan and Limits</p>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                      <p className="text-xl font-semibold capitalize">{plan}</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Daily Limit</p>
                      <p className="text-xl font-semibold">{limit}</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Uses Left Today</p>
                      <p className="text-xl font-semibold">{Math.max(limit - dailyCount, 0)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-border/50" onClick={() => { setPlan("free"); localStorage.setItem("removix.plan", "free"); toast({ title: "Switched to Free plan" }); }}>
                      Switch to Free
                    </Button>
                    <Button className="gradient-btn border-0 text-primary-foreground" onClick={() => { setPlan("credits"); localStorage.setItem("removix.plan", "credits"); toast({ title: "Switched to Credits plan" }); }}>
                      Switch to Credits
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="keys">
                <div className="glass rounded-2xl p-6">
                  <p className="text-sm text-muted-foreground mb-2">API Keys</p>
                  <p className="text-xs text-muted-foreground mb-4">Use this key to call Removix AI from your backend. Keep it secret.</p>
                  <div className="flex gap-3 items-center">
                    <Input readOnly value={apiKey || "No API key yet"} />
                    <Button
                      variant="outline"
                      className="border-border/50"
                      onClick={() => {
                        const key = `rk_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
                        setApiKey(key);
                        try {
                          localStorage.setItem(apiKeyStorageKey, key);
                        } catch {}
                        toast({ title: "API key generated" });
                      }}
                    >
                      {apiKey ? "Regenerate" : "Generate"}
                    </Button>
                    {apiKey && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setApiKey("");
                          try { localStorage.removeItem(apiKeyStorageKey); } catch {}
                          toast({ title: "API key revoked" });
                        }}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      Example usage (server-side): POST multipart/form-data to your n8n webhook with field name <strong>file</strong>. Include this key in your backend.
                    </p>
                  </div>
                </div>
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
                          {editingId === h.id ? (
                            <>
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-9"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border/50"
                                onClick={async () => {
                                  const newName = editingName?.trim();
                                  if (!newName) return;
                                  setHistory((prev) => prev.map((x) => (x.id === h.id ? { ...x, name: newName } : x)));
                                  try {
                                    const next = history.map((x) => (x.id === h.id ? { ...x, name: newName } : x));
                                    localStorage.setItem(historyStorageKey, JSON.stringify(next));
                                  } catch {}
                                  const supabase = await getSupabaseClient();
                                  if (supabase && emailKey) {
                                    supabase
                                      .from("histories")
                                      .update({ name: newName })
                                      .eq("email", emailKey)
                                      .eq("ts", h.ts)
                                      .then(() => {})
                                      .catch(() => {});
                                  }
                                  setEditingId(null);
                                  setEditingName("");
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border/50"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingName("");
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border/50"
                              onClick={() => {
                                setEditingId(h.id);
                                setEditingName(h.name);
                              }}
                            >
                              Rename
                            </Button>
                          )}
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
