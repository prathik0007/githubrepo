"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeViewerProps = {
  fileName: string;
  content: string;
  htmlUrl?: string;
  onExplain: () => void;
  explaining: boolean;
};

function getLanguage(fileName: string) {
  const name = fileName.toLowerCase();

  if (name.endsWith(".rb")) return "ruby";
  if (name.endsWith(".py")) return "python";
  if (name.endsWith(".js")) return "javascript";
  if (name.endsWith(".jsx")) return "jsx";
  if (name.endsWith(".ts")) return "typescript";
  if (name.endsWith(".tsx")) return "tsx";
  if (name.endsWith(".java")) return "java";
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".html")) return "html";
  if (name.endsWith(".json")) return "json";
  if (name.endsWith(".yml") || name.endsWith(".yaml")) return "yaml";
  if (name.endsWith(".sql")) return "sql";
  if (name.endsWith(".md")) return "markdown";
  if (name.endsWith(".sh")) return "bash";
  if (name === "dockerfile") return "docker";

  return "text";
}

export default function CodeViewer({
  fileName,
  content,
  htmlUrl,
  onExplain,
  explaining,
}: CodeViewerProps) {
  const language = getLanguage(fileName);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span>📄</span>
          <span className="font-medium text-white">{fileName}</span>
          <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
            {language}
          </span>
        </div>

        <div className="flex gap-2">
          {htmlUrl && (
            <a
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              View on GitHub
            </a>
          )}

          <button
            type="button"
            onClick={onExplain}
            disabled={explaining}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {explaining ? "🤖 Explaining..." : "🤖 Explain This File"}
          </button>
        </div>
      </div>

      <div className="max-h-[650px] overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            padding: "20px 0",
            background: "#0d1117",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
          lineNumberStyle={{
            minWidth: "3.5em",
            paddingRight: "1em",
            color: "#6b7280",
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
