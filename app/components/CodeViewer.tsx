"use client";

import { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeViewerProps = {
  fileName?: string;
  content?: string;
  size?: number;
  htmlUrl?: string;
  onExplain?: () => void;
  explaining?: boolean;
  highlightLine?: number | null;
};

function getLanguage(fileName?: string) {
  if (!fileName) return "text";
  const name = fileName.toLowerCase();

  if (name.endsWith(".rb")) return "ruby";
  if (name.endsWith(".py")) return "python";
  if (name.endsWith(".js") || name.endsWith(".mjs")) return "javascript";
  if (name.endsWith(".jsx")) return "jsx";
  if (name.endsWith(".ts")) return "typescript";
  if (name.endsWith(".tsx")) return "tsx";
  if (name.endsWith(".java")) return "java";
  if (name.endsWith(".css") || name.endsWith(".scss")) return "css";
  if (name.endsWith(".html")) return "html";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".yml") || name.endsWith(".yaml")) return "yaml";
  if (name.endsWith(".sql")) return "sql";
  if (name.endsWith(".md") || name.endsWith(".mdx")) return "markdown";
  if (name.endsWith(".sh") || name.endsWith(".bash")) return "bash";
  if (name === "dockerfile") return "docker";

  return "text";
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function CodeViewer({
  fileName,
  content,
  size,
  htmlUrl,
  onExplain,
  explaining,
  highlightLine,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const language = getLanguage(fileName);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!highlightLine) {
      return;
    }

    codeContainerRef.current
      ?.querySelector<HTMLElement>(`#code-line-${highlightLine}`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [content, highlightLine]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!fileName || !content) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-xl border border-zinc-800/90 bg-zinc-950 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-xl text-zinc-500">
          🔍
        </div>
        <h4 className="mt-4 text-sm font-semibold text-zinc-200">
          No file selected
        </h4>
        <p className="mt-1 max-w-sm text-xs text-zinc-500">
          Select any source file from the repository explorer on the left to inspect its code.
        </p>
      </div>
    );
  }

  const lineCount = content.split("\n").length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-[#0d1117] shadow-xl">
      {/* Editor Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5 backdrop-blur-md">
        {/* Left: Breadcrumbs & Meta */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-400">
            📄
          </span>
          <span className="truncate font-mono text-xs font-semibold text-zinc-100">
            {fileName}
          </span>
          <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {language}
          </span>
          {size && (
            <span className="hidden text-[11px] text-zinc-500 sm:inline-block">
              {formatBytes(size)}
            </span>
          )}
          <span className="hidden text-[11px] text-zinc-500 sm:inline-block">
            • {lineCount} lines
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>

          {htmlUrl && (
            <a
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white sm:inline-flex"
            >
              GitHub ↗
            </a>
          )}

          {onExplain && (
            <button
              type="button"
              onClick={onExplain}
              disabled={explaining}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {explaining ? (
                <>
                  <svg
                    className="h-3 w-3 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Explain File</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code Content Area */}
      <div
        ref={codeContainerRef}
        className="h-[480px] overflow-auto scrollbar-thin scrollbar-thumb-zinc-800"
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          wrapLongLines={false}
          lineProps={(lineNumber) => ({
            id: `code-line-${lineNumber}`,
            style:
              highlightLine === lineNumber
                ? {
                    display: "block",
                    background: "rgba(59, 130, 246, 0.2)",
                    borderLeft: "3px solid #3b82f6",
                  }
                : {},
          })}
          customStyle={{
            margin: 0,
            padding: "16px 0",
            background: "#0d1117",
            fontSize: "12.5px",
            lineHeight: "1.65",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
          lineNumberStyle={{
            minWidth: "3.2em",
            paddingRight: "1.2em",
            color: "#4b5563",
            textAlign: "right",
            userSelect: "none",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
