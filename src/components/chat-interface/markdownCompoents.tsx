import clsx from "clsx";
import "katex/dist/katex.min.css";
import mermaid from "mermaid";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// icons
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  FileCode2,
  FileText,
  Flame,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Link as LinkIcon,
  Pause,
  Play,
  Quote,
  Table as TableIcon,
  TriangleAlert,
} from "lucide-react";

// Optional transpilers/runners (assumed available in your bundler env)
// If you prefer, swap to @babel/standalone or sucrase.
// @ts-ignore
import * as ts from "typescript";

/**
 * ULTIMATE MARKDOWN RENDERER
 * - GFM, Math (KaTeX), Emoji, Footnotes
 * - Mermaid diagrams
 * - Syntax-enhanced code blocks (filename, copy, highlights, diff coloring, collapsible)
 * - JS/TS Run button (sandboxed iframe runner)
 * - Images: lazy, captions, zoom dialog
 * - Smart links with hover preview
 * - Headings with anchors + scrollspy + TOC
 * - Blockquotes, tables (responsive, sticky header)
 * - Task lists
 * - Shortcodes: {{Alert type="warning" title="Be careful"}}...{{/Alert}}
 * - Live editor mode (split tabs) + drag-and-drop image injection
 */

// ------------------------ Utilities ------------------------
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const parseMeta = (meta?: string) => {
  const o: Record<string, string | boolean> = {};
  if (!meta) return o;
  for (const part of meta.split(/\s+/)) {
    if (!part) continue;
    const [k, v] = part.split("=");
    if (v === undefined) o[k] = true;
    else o[k] = v;
  }
  return o;
};

const parseHighlight = (v?: string) => {
  if (!v) return new Set<number>();
  const set = new Set<number>();
  v.split(",").forEach((seg) => {
    if (seg.includes("-")) {
      const [a, b] = seg.split("-").map((n) => parseInt(n, 10));
      for (let i = a; i <= b; i++) set.add(i);
    } else {
      const n = parseInt(seg, 10);
      if (!Number.isNaN(n)) set.add(n);
    }
  });
  return set;
};

// ------------------------ Mermaid -------------------------
const Mermaid: React.FC<{ code: string }> = ({ code }) => {
  const id = React.useMemo(
    () => `mmd-${Math.random().toString(36).slice(2)}`,
    [code]
  );
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "neutral" });
    const render = async () => {
      try {
        const { svg } = await mermaid.render(id, code);
        if (ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (ref.current) ref.current.innerText = String(e);
      }
    };
    render();
  }, [code, id]);
  return (
    <div
      className="my-4 overflow-auto rounded-2xl border border-border bg-card p-4"
      ref={ref}
    />
  );
};

// ------------------------ Callouts ------------------------
const CALLOUT_ICON: Record<string, React.ReactNode> = {
  info: <Info className="h-5 w-5" />,
  note: <FileText className="h-5 w-5" />,
  tip: <Lightbulb className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  danger: <TriangleAlert className="h-5 w-5" />,
};

const Callout: React.FC<{
  type?: string;
  title?: string;
  children?: React.ReactNode;
}> = ({ type = "info", title, children }) => {
  const icon = CALLOUT_ICON[type] ?? CALLOUT_ICON.info;
  return (
    <Card
      className={clsx("my-4 border-l-8", {
        "border-l-blue-600": type === "info" || type === "note",
        "border-l-amber-500": type === "warning",
        "border-l-rose-600": type === "danger",
        "border-l-emerald-600": type === "tip",
      })}
    >
      <CardHeader className="flex flex-row items-center gap-3 py-3">
        <div>{icon}</div>
        <CardTitle className="text-base">
          {title ?? type.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4 text-sm leading-7 text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
};

// ------------------------ Runner (JS/TS) ------------------
const Runner: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const [running, setRunning] = React.useState(false);
  const [logs, setLogs] = React.useState<string[]>([]);

  const run = React.useCallback(() => {
    setRunning(true);
    setLogs([]);
    const iframe = iframeRef.current;
    if (!iframe) return;

    const toJS = (src: string) => {
      try {
        if (lang?.toLowerCase().startsWith("ts")) {
          return ts.transpileModule(src, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2020,
              jsx: ts.JsxEmit.React,
            },
          }).outputText;
        }
        return src;
      } catch (e) {
        return `console.error(${JSON.stringify(String(e))})`;
      }
    };

    const js = toJS(code);
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"/><style>html,body{font-family:ui-monospace, SFMono-Regular, Menlo, monospace; padding:8px;}</style></head><body><pre id=out></pre><script>(function(){
      const out = document.getElementById('out');
      const push = (type, ...args)=>{ out.textContent += '\n['+type+'] '+args.map(a=>typeof a==='object'?JSON.stringify(a):String(a)).join(' ') };
      ['log','warn','error'].forEach(k=>{ const orig = console[k]; console[k] = (...a)=>{ push(k, ...a); orig.apply(console, a); }; });
      try { ${js} } catch(e){ console.error(e); }
    })()</script></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
  }, [code, lang]);

  return (
    <div className="mt-2 rounded-xl border">
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCode2 className="h-4 w-4" /> Sandbox
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="default" onClick={run} disabled={running}>
            <Play className="mr-1 h-4 w-4" /> Run
          </Button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title="runner"
        className="h-56 w-full"
        sandbox="allow-scripts"
      ></iframe>
    </div>
  );
};

// ------------------------ Code Block ----------------------

const CodeBlock: React.FC<{
  children: string;
  language?: string;
  meta?: string;
}> = ({ children, language = "", meta }) => {
  const [copied, setCopied] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [showCode, setShowCode] = React.useState(false);
  const metaObj = React.useMemo(() => parseMeta(meta), [meta]);
  const highlightLines = React.useMemo(
    () => parseHighlight(String(metaObj.highlight || "")),
    [metaObj]
  );
  const code = String(children).replace(/\n$/, "");
  const lines = React.useMemo(() => code.split("\n"), [code]);
  const showLineNumbers = Boolean(metaObj.showLineNumbers) || lines.length > 3;
  const filename = (metaObj.filename || metaObj.title) as string | undefined;
  const isCollapsible = Boolean(metaObj.collapsible) && lines.length > 20;
  const isRunnable =
    Boolean(metaObj.run) ||
    ["js", "javascript", "ts", "tsx"].includes(language);
  const isDiff = language === "diff" || Boolean(metaObj.diff);
  const isHtml = language === "html";

  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // HTML Preview Dialog (unchanged)
  const HtmlPreviewDialog: React.FC = () => {
    const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
    const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
    const [exporting, setExporting] = React.useState(false);

    React.useEffect(() => {
      if (previewOpen) {
        const blob = new Blob([code], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        return () => {
          URL.revokeObjectURL(url);
          setBlobUrl(null);
        };
      } else {
        setBlobUrl(null);
      }
    }, [code, previewOpen]);

    // PDF Export handler (unchanged)
    const handleExportPdf = async () => {
      if (!iframeRef.current) return;
      setExporting(true);
      try {
        if (!(window as any).html2pdf) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
        const iframe = iframeRef.current;
        if (!iframe.contentDocument) throw new Error("No iframe content");
        const html = iframe.contentDocument.documentElement;
        (window as any)
          .html2pdf()
          .set({
            margin: 0,
            filename: "preview.pdf",
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
          })
          .from(html)
          .save();
      } catch (e) {
        alert("Failed to export PDF: " + e);
      } finally {
        setExporting(false);
      }
    };

    return (
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="fixed  max-w-none w-screen h-screen p-0 border-none bg-white dark:bg-gray-900">
          {/* Full-width top nav with close button */}
          <div
            className="flex items-center justify-between px-6 py-3 border-b border-border shadow-sm"
            style={{
              background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
              color: "#fff",
              minHeight: 56,
            }}
          >
            <div className="flex items-center gap-2">
              <FileCode2 className="h-6 w-6 text-white/90 drop-shadow" />
              <span className="font-bold text-lg tracking-wide drop-shadow">
                HTML Preview
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportPdf}
                disabled={exporting}
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-none shadow-md px-4 py-2 rounded-lg font-semibold transition"
                style={{ boxShadow: "0 2px 8px 0 rgba(99,102,241,0.10)" }}
              >
                <FileText className="h-4 w-4 text-white" />
                {exporting ? "Exporting..." : "Export as PDF"}
              </Button>

              {/* Close button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreviewOpen(false)}
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-none shadow-md px-3 py-2 rounded-lg font-semibold transition"
                style={{ boxShadow: "0 2px 8px 0 rgba(99,102,241,0.10)" }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Close
              </Button>
            </div>
          </div>

          {/* Full-screen iframe container */}
          <div
            className="flex-1 w-full h-full"
            style={{ height: "calc(100vh - 56px)" }}
          >
            {blobUrl && (
              <iframe
                ref={iframeRef}
                src={blobUrl}
                title="HTML Preview"
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // --- Preview logic ---
  // Show preview by default, code on toggle
  // HTML preview
  if (!showCode && isHtml) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b p-2 pl-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
            >
              html
            </Badge>
            {filename && (
              <span className="text-xs text-muted-foreground">{filename}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowCode(true)}
              className="h-7 px-2 text-xs"
            >
              <FileCode2 className="mr-1 h-3.5 w-3.5" /> Show Code
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewOpen(true)}
              className="h-7 px-2 text-xs"
            >
              <Play className="mr-1 h-3.5 w-3.5" /> Fullscreen
            </Button>
          </div>
        </div>
        <div className="w-full min-h-[120px] bg-white dark:bg-gray-900">
          <iframe
            srcDoc={code}
            title="HTML Preview"
            className="w-full min-h-[120px] border-none"
            sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin"
          />
        </div>
        <HtmlPreviewDialog />
      </div>
    );
  }

  // Image preview (if code is a valid image URL or data URL)
  const isImage =
    language === "image" ||
    /^data:image\//.test(code.trim()) ||
    /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))/i.test(code.trim());
  if (!showCode && isImage) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-6">
        <img
          src={code.trim()}
          alt={filename || "Image preview"}
          className="max-h-64 rounded-xl shadow mb-3"
          style={{ objectFit: "contain" }}
        />
        <Button
          size="sm"
          variant="default"
          onClick={() => setShowCode(true)}
          className="text-xs"
        >
          <FileCode2 className="mr-1 h-3.5 w-3.5" /> Show Code
        </Button>
      </div>
    );
  }

  // Markdown preview (if language is markdown)
  if (!showCode && (language === "md" || language === "markdown")) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
          >
            markdown
          </Badge>
          {filename && (
            <span className="text-xs text-muted-foreground">{filename}</span>
          )}
        </div>
        <ReactMarkdown>{code}</ReactMarkdown>
        <div className="mt-4 flex justify-end">
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowCode(true)}
            className="text-xs"
          >
            <FileCode2 className="mr-1 h-3.5 w-3.5" /> Show Code
          </Button>
        </div>
      </div>
    );
  }

  // Generic preview for other code (icon, description, show code button)
  if (!showCode) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2 mb-4">
          <FileCode2 className="h-8 w-8 text-muted-foreground" />
          <span className="text-base text-muted-foreground font-medium">
            This block contains {language ? language.toUpperCase() : "code"}.
          </span>
          <span className="text-xs text-muted-foreground opacity-80">
            Click below to view the code.
          </span>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={() => setShowCode(true)}
          className="text-xs"
        >
          <FileCode2 className="mr-1 h-3.5 w-3.5" /> Show Code
        </Button>
      </div>
    );
  }

  // --- Code view (with Hide Preview button) ---
  // HTML code block (add Hide Preview button)
  if (isHtml) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b p-2 pl-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
            >
              html
            </Badge>
            {filename && (
              <span className="text-xs text-muted-foreground">{filename}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCode(false)}
              className="h-7 px-2 text-xs"
            >
              Hide Code
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewOpen(true)}
              className="h-7 px-2 text-xs"
            >
              <Play className="mr-1 h-3.5 w-3.5" /> Fullscreen
            </Button>
          </div>
        </div>
        <pre
          className={clsx(
            "relative max-h-[65vh] overflow-auto p-4 text-sm leading-6"
          )}
        >
          <code className="grid gap-0.5">
            {lines.map((line, i) => (
              <div
                key={i}
                className="min-h-[1.2rem] whitespace-pre break-words rounded"
              >
                <span>{line || "\u00A0"}</span>
              </div>
            ))}
          </code>
        </pre>
        <HtmlPreviewDialog />
      </div>
    );
  }

  // Image code block (add Hide Preview button)
  if (isImage) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-6">
        <img
          src={code.trim()}
          alt={filename || "Image preview"}
          className="max-h-64 rounded-xl shadow mb-3"
          style={{ objectFit: "contain" }}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowCode(false)}
          className="text-xs"
        >
          Hide Code
        </Button>
        <pre
          className={clsx(
            "relative max-h-[65vh] overflow-auto p-4 text-sm leading-6 mt-4"
          )}
        >
          <code className="grid gap-0.5">
            {lines.map((line, i) => (
              <div
                key={i}
                className="min-h-[1.2rem] whitespace-pre break-words rounded"
              >
                <span>{line || "\u00A0"}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    );
  }

  // Markdown code block (add Hide Preview button)
  if (language === "md" || language === "markdown") {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
          >
            markdown
          </Badge>
          {filename && (
            <span className="text-xs text-muted-foreground">{filename}</span>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowCode(false)}
          className="text-xs mb-3"
        >
          Hide Code
        </Button>
        <pre
          className={clsx(
            "relative max-h-[65vh] overflow-auto p-4 text-sm leading-6"
          )}
        >
          <code className="grid gap-0.5">
            {lines.map((line, i) => (
              <div
                key={i}
                className="min-h-[1.2rem] whitespace-pre break-words rounded"
              >
                <span>{line || "\u00A0"}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    );
  }

  // Normal code block (add Hide Preview button)
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b p-2 pl-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide"
          >
            {language || "text"}
          </Badge>
          {filename && (
            <span className="text-xs text-muted-foreground">{filename}</span>
          )}
          {isDiff && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Flame className="h-3.5 w-3.5" />
              diff
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isCollapsible && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCollapsed((s) => !s)}
              className="h-7 px-2 text-xs"
            >
              {collapsed ? (
                <Play className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Pause className="mr-1 h-3.5 w-3.5" />
              )}
              {collapsed ? "Expand" : "Collapse"}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCode(false)}
            className="h-7 px-2 text-xs"
          >
            Hide Code
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCopy}
            className="h-7 gap-1 px-2 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <pre
        className={clsx(
          "relative max-h-[65vh] overflow-auto p-4 text-sm leading-6",
          { "max-h-32": collapsed }
        )}
      >
        <code
          className={clsx(
            "grid gap-0.5",
            showLineNumbers && "[counter-reset:line]"
          )}
        >
          {lines.map((line, i) => {
            const isAdd = isDiff && /^\+/.test(line);
            const isDel = isDiff && /^-/.test(line);
            const isCtx = isDiff && !isAdd && !isDel;
            return (
              <div
                key={i}
                className={clsx(
                  "min-h-[1.2rem] whitespace-pre break-words rounded",
                  showLineNumbers &&
                    "pl-10 [counter-increment:line] before:absolute before:-ml-8 before:content-[counter(line)] before:text-muted-foreground before:opacity-60 before:tabular-nums before:text-xs",
                  highlightLines.has(i + 1) && "bg-amber-500/10",
                  isAdd && "bg-emerald-500/10",
                  isDel && "bg-rose-500/10",
                  isCtx && "bg-transparent"
                )}
              >
                <span>{line || "\u00A0"}</span>
              </div>
            );
          })}
        </code>
      </pre>
      {isRunnable && <Runner code={code} lang={language} />}
    </div>
  );
};

// ------------------------ Zoomable Image ------------------
const Figure: React.FC<
  {
    src?: string;
    alt?: string;
    title?: string;
  } & React.ImgHTMLAttributes<HTMLImageElement>
> = ({ src, alt, title, ...imgProps }) => {
  if (!src) return null;
  const caption = title || alt;
  return (
    <figure className="my-4">
      <Dialog>
        <DialogTrigger asChild>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            {...imgProps}
            className={clsx(
              "cursor-zoom-in rounded-2xl shadow",
              imgProps.className
            )}
          />
        </DialogTrigger>
        <DialogContent className="max-w-5xl border-none p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="h-auto w-full" />
        </DialogContent>
      </Dialog>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// ------------------------ Smart Link ----------------------
const SmartLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href = "#",
  children,
  ...rest
}) => {
  const isExternal = /^https?:\/\//i.test(href);
  const domain = React.useMemo(() => {
    try {
      return new URL(href).hostname.replace(/^www\./, "");
    } catch {
      return href;
    }
  }, [href]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
          {...rest}
        >
          {children}
          {isExternal && <ExternalLink className="h-3.5 w-3.5" />}
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start gap-3">
          <LinkIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{domain}</div>
            <div className="text-xs text-muted-foreground">{href}</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

// ------------------------ YouTube Embeds ------------------
const isYouTube = (url: string) =>
  /https?:\/\/(?:www\.)?(?:youtube.com\/watch\?v=|youtu.be\/)/.test(url);
const toYouTubeId = (url: string) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
  } catch {}
  return null;
};

const YouTubeEmbed: React.FC<{ url: string }> = ({ url }) => {
  const id = toYouTubeId(url);
  if (!id) return null;
  return (
    <div className="my-4 aspect-video w-full overflow-hidden rounded-2xl border">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
};

// ------------------------ Table Wrapper -------------------
const TableWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="my-4 overflow-hidden rounded-2xl border">
    <div className="relative max-w-full overflow-auto">
      <table className="w-full border-separate border-spacing-0">
        {children}
      </table>
    </div>
  </div>
);

// ------------------------ TOC & Scrollspy -----------------
interface TOCItem {
  depth: number;
  id: string;
  text: string;
}

// ------------------------ Shortcodes ----------------------
// Very small preprocessor to support {{Alert ...}}...{{/Alert}}
function expandShortcodes(src: string): string {
  return src.replace(
    /\{\{Alert([^}]*)\}\}([\s\S]*?)\{\{\/Alert\}\}/g,
    (_, attrs, body) => {
      const typeMatch = /type=\"(.*?)\"/.exec(attrs);
      const titleMatch = /title=\"(.*?)\"/.exec(attrs);
      const type = typeMatch ? typeMatch[1] : "info";
      const title = titleMatch ? titleMatch[1] : "";
      // We emit HTML that ReactMarkdown will pass through (rehypeRaw enabled)
      return `<div data-alert data-type="${type}" data-title="${title}">${body}</div>`;
    }
  );
}

// ------------------------ Editor (live) -------------------
function LiveEditor({
  value,
  onChange,
  onDropImage,
}: {
  value: string;
  onChange: (v: string) => void;
  onDropImage: (dataUrl: string) => void;
}) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  const onDrop = React.useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result);
        onDropImage(url);
      };
      reader.readAsDataURL(file);
    },
    [onDropImage]
  );

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="md-editor">Markdown</Label>
      <textarea
        id="md-editor"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder="Write Markdown here... (Tip: drag an image file to embed as data URL)"
        className="min-h-[50vh] w-full resize-y rounded-xl border bg-background p-3 font-mono text-sm"
      />
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <ImageIcon className="h-4 w-4" /> Drag & drop an image file to insert as
        `![](data:image/...)`
      </div>
    </div>
  );
}

// ------------------------ Main Component ------------------
export default function UltimateMarkdownRenderer({
  content,
  showToc = true,
  live = false,
  themeToggle = true,
}: {
  content: string;
  showToc?: boolean;
  live?: boolean; // show editor/preview tabs
  themeToggle?: boolean;
}) {
  const [md, setMd] = React.useState<string>(content);
  const [toc, setToc] = React.useState<TOCItem[]>([]);
  const [activeId, setActiveId] = React.useState<string>("");
  const tocRef = React.useRef<TOCItem[]>([]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = React.useState<boolean>(true);

  React.useEffect(() => {
    tocRef.current = [];
    setToc([]);
  }, [md]);
  React.useEffect(() => {
    setToc(tocRef.current);
  }, [tocRef.current.length]);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const headings = Array.from(
      containerRef.current.querySelectorAll("h1,h2,h3,h4,h5,h6")
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveId(id);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -80% 0px", threshold: 1.0 }
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [md]);

  const preprocess = React.useCallback(
    (src: string) => expandShortcodes(src),
    []
  );

  const components = React.useMemo(
    () => ({
      // Headings
      h1: ({ children }: any) => Heading({ children, depth: 1 }),
      h2: ({ children }: any) => Heading({ children, depth: 2 }),
      h3: ({ children }: any) => Heading({ children, depth: 3 }),
      h4: ({ children }: any) => Heading({ children, depth: 4 }),
      h5: ({ children }: any) => Heading({ children, depth: 5 }),
      h6: ({ children }: any) => Heading({ children, depth: 6 }),

      p: ({ children }: any) => (
        <p className="my-4 leading-7 text-foreground/90">{children}</p>
      ),

      a: (props: any) => <SmartLink {...props} />,

      img: ({ src, alt, title, ...rest }: any) => (
        <Figure src={src} alt={alt} title={title} {...rest} />
      ),

      blockquote: ({ children }: any) => (
        <blockquote className="my-4 rounded-2xl border-l-4 border-primary/60 bg-muted/30 p-4 text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <Quote className="h-4 w-4 opacity-70" /> Quote
          </div>
          {children}
        </blockquote>
      ),

      table: ({ children }: any) => <TableWrapper>{children}</TableWrapper>,
      thead: (props: any) => (
        <thead className="bg-muted sticky top-0">{props.children}</thead>
      ),
      th: (props: any) => (
        <th className="border-b px-3 py-2 text-left text-sm font-semibold">
          {props.children}
        </th>
      ),
      td: (props: any) => (
        <td className="border-b px-3 py-2 align-top">{props.children}</td>
      ),

      ul: ({ children }: any) => (
        <ul className="my-3 ml-6 list-disc space-y-1">{children}</ul>
      ),
      ol: ({ children }: any) => (
        <ol className="my-3 ml-6 list-decimal space-y-1">{children}</ol>
      ),
      li: ({ children, checked, ...rest }: any) => (
        <li className="leading-7">
          {typeof checked === "boolean" ? (
            <>
              <input
                type="checkbox"
                checked={checked}
                readOnly
                className="mr-2 inline-block h-4 w-4 align-middle"
              />
              <span
                className={clsx(
                  "align-middle",
                  checked && "line-through opacity-70"
                )}
              >
                {children}
              </span>
            </>
          ) : (
            children
          )}
        </li>
      ),

      hr: () => <hr className="my-8 border-dashed" />,

      code: ({ inline, className, children, node, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || "");
        const lang = match?.[1] || "";
        const meta =
          (node?.data as any)?.meta || (props?.["data-meta"] as string) || "";
        const raw = String(children);
        if (!inline && lang === "mermaid") return <Mermaid code={raw} />;
        if (!inline && raw.trim() && isYouTube(raw.trim()))
          return <YouTubeEmbed url={raw.trim()} />;
        if (!inline && lang)
          return (
            <CodeBlock language={lang} meta={meta}>
              {raw}
            </CodeBlock>
          );
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm leading-normal">
            {children}
          </code>
        );
      },

      // Shortcode container emitted by expandShortcodes()
      div: ({ children, ...props }: any) => {
        if (props["data-alert"]) {
          return (
            <Callout
              type={String(props["data-type"])}
              title={String(props["data-title"] || "")}
            >
              {children}
            </Callout>
          );
        }
        return <div {...props}>{children}</div>;
      },
    }),
    []
  );

  function Heading({
    children,
    depth,
  }: {
    children: React.ReactNode;
    depth: number;
  }) {
    const text = React.Children.toArray(children)
      .map((c: any) => (typeof c === "string" ? c : c?.props?.children ?? ""))
      .join("");
    const id = slugify(text);
    React.useEffect(() => {
      tocRef.current.push({ depth, id, text });
    }, [text, depth, id]);

    const Tag: any = `h${depth}` as any;
    return (
      <Tag
        id={id}
        className={clsx(
          "group scroll-mt-24 font-semibold tracking-tight",
          depth === 1 && "mt-8 text-4xl",
          depth === 2 && "mt-10 text-3xl",
          depth === 3 && "mt-8 text-2xl",
          depth === 4 && "mt-6 text-xl",
          depth >= 5 && "mt-4 text-lg"
        )}
      >
        <a href={`#${id}`} className="no-underline">
          <span>{children}</span>
          <Button
            size="icon"
            variant="ghost"
            className="ml-2 hidden h-6 w-6 align-middle opacity-0 group-hover:inline-flex group-hover:opacity-100"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </a>
      </Tag>
    );
  }

  const processed = preprocess(md);

  return (
    <div
      className={clsx(
        "grid grid-cols-1 gap-6 lg:grid-cols-12",
        isDark ? "dark" : ""
      )}
    >
      {showToc && toc.length > 0 && (
        <aside className="lg:col-span-3">
          <Card className="sticky top-24">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TableIcon className="h-4 w-4" /> Table of contents
              </CardTitle>
              {themeToggle && (
                <div className="flex items-center gap-2 text-xs">
                  <span>Dark</span>
                  <Switch checked={isDark} onCheckedChange={setIsDark} />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[60vh] pr-4">
                <nav className="text-sm">
                  <ul className="space-y-1">
                    {toc.map((h, i) => (
                      <li
                        key={`${h.id}-${i}`}
                        className={clsx({
                          "ml-0": h.depth === 1,
                          "ml-2": h.depth === 2,
                          "ml-4": h.depth === 3,
                          "ml-6": h.depth >= 4,
                        })}
                      >
                        <a
                          href={`#${h.id}`}
                          className={clsx(
                            "hover:text-foreground",
                            activeId === h.id
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      )}

      <main
        className={clsx(
          "prose prose-neutral max-w-none lg:col-span-9 dark:prose-invert",
          "prose-pre:!bg-transparent prose-code:before:content-[''] prose-code:after:content-['']"
        )}
      >
        {live ? (
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <div ref={containerRef}>
                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                    remarkMath,
                    remarkBreaks,
                    remarkEmoji,
                  ]}
                  rehypePlugins={[
                    rehypeRaw,
                    rehypeKatex,
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: "append" }],
                  ]}
                  components={components as any}
                >
                  {processed}
                </ReactMarkdown>
              </div>
            </TabsContent>
            <TabsContent value="edit">
              <LiveEditor
                value={md}
                onChange={setMd}
                onDropImage={(dataUrl) =>
                  setMd((s) => s + `\n\n![](${dataUrl})`)
                }
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div ref={containerRef}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath, remarkBreaks, remarkEmoji]}
              rehypePlugins={[
                rehypeRaw,
                rehypeKatex,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "append" }],
              ]}
              components={components as any}
            >
              {processed}
            </ReactMarkdown>
          </div>
        )}
      </main>
    </div>
  );
}

// ------------------------ Exposed Callouts --------------
export function InfoCallout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Callout type="info" title={title}>
      {children}
    </Callout>
  );
}
export function WarningCallout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Callout type="warning" title={title}>
      {children}
    </Callout>
  );
}
export function TipCallout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Callout type="tip" title={title}>
      {children}
    </Callout>
  );
}
export function DangerCallout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Callout type="danger" title={title}>
      {children}
    </Callout>
  );
}

// ------------------------ Usage Notes --------------------
/**
 * Examples:
 *
 * <UltimateMarkdownRenderer content={md} live showToc />
 *
 * Code meta options on fenced blocks:
 * ```ts filename=app.tsx highlight=2-4,8 showLineNumbers collapsible run
 * const x = 1
 * const y = 2
 * console.log(x + y)
 * ```
 *
 * Diff blocks:
 * ```diff
 * - old line
 * + new line
 * ```
 *
 * Mermaid:
 * ```mermaid
 * graph TD; A-->B; A-->C; B-->D; C-->D;
 * ```
 *
 * Footnotes:
 * Here is a footnote reference,[^1] and another.[^longnote]
 * [^1]: This is the first footnote.
 * [^longnote]: Here's one with multiple paragraphs and code.
 *
 * Shortcodes (alerts):
 * {{Alert type="warning" title="Be careful"}}
 * This is a warning body with **markdown** inside.
 * {{/Alert}}
 *
 * Images with caption: ![Alt text](url "Caption text")
 *
 * Drag & drop image files onto the editor when live={true}.
 */
