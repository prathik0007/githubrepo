"use client";

import React, { useState } from "react";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into blocks (code blocks vs regular text blocks)
  const blocks: { type: "code" | "text"; content: string; language?: string }[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  let currentLanguage = "";
  let currentBlockLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          type: "code",
          content: currentBlockLines.join("\n"),
          language: currentLanguage || "text",
        });
        currentBlockLines = [];
        inCodeBlock = false;
        currentLanguage = "";
      } else {
        // Start code block
        if (currentBlockLines.length > 0) {
          blocks.push({
            type: "text",
            content: currentBlockLines.join("\n"),
          });
          currentBlockLines = [];
        }
        inCodeBlock = true;
        currentLanguage = line.trim().slice(3).trim();
      }
    } else {
      currentBlockLines.push(line);
    }
  }

  if (currentBlockLines.length > 0) {
    blocks.push({
      type: inCodeBlock ? "code" : "text",
      content: currentBlockLines.join("\n"),
      language: currentLanguage,
    });
  }

  const parseInline = (text: string): React.ReactNode[] => {
    // Parse inline code, bold, italic
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining) {
      // Inline code: `code`
      const codeMatch = remaining.match(/`([^`]+)`/);
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      // Link: [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      let earliestIndex = remaining.length;
      let matchType: "code" | "bold" | "link" | null = null;
      let matchedString = "";
      let matchPayload: any = null;

      if (codeMatch && codeMatch.index !== undefined && codeMatch.index < earliestIndex) {
        earliestIndex = codeMatch.index;
        matchType = "code";
        matchedString = codeMatch[0];
        matchPayload = codeMatch[1];
      }
      if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIndex) {
        earliestIndex = boldMatch.index;
        matchType = "bold";
        matchedString = boldMatch[0];
        matchPayload = boldMatch[1];
      }
      if (linkMatch && linkMatch.index !== undefined && linkMatch.index < earliestIndex) {
        earliestIndex = linkMatch.index;
        matchType = "link";
        matchedString = linkMatch[0];
        matchPayload = { text: linkMatch[1], url: linkMatch[2] };
      }

      if (matchType && earliestIndex < remaining.length) {
        if (earliestIndex > 0) {
          parts.push(remaining.substring(0, earliestIndex));
        }

        if (matchType === "code") {
          parts.push(
            <code
              key={key++}
              className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-xs font-medium text-blue-300 ring-1 ring-zinc-700/50"
            >
              {matchPayload}
            </code>
          );
        } else if (matchType === "bold") {
          parts.push(
            <strong key={key++} className="font-semibold text-zinc-100">
              {matchPayload}
            </strong>
          );
        } else if (matchType === "link") {
          parts.push(
            <a
              key={key++}
              href={matchPayload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-400 underline decoration-blue-500/30 underline-offset-2 transition hover:text-blue-300 hover:decoration-blue-400"
            >
              {matchPayload.text}
            </a>
          );
        }

        remaining = remaining.substring(earliestIndex + matchedString.length);
      } else {
        parts.push(remaining);
        break;
      }
    }

    return parts;
  };

  const renderTextBlock = (text: string, blockIndex: number) => {
    const rawLines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: { type: "ul" | "ol"; items: string[] } | null = null;

    const flushList = () => {
      if (currentList) {
        if (currentList.type === "ul") {
          elements.push(
            <ul key={`list-${elements.length}`} className="my-3 space-y-1.5 pl-5 text-sm text-zinc-300">
              {currentList.items.map((item, i) => (
                <li key={i} className="list-disc leading-relaxed">
                  {parseInline(item)}
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`list-${elements.length}`} className="my-3 space-y-1.5 pl-5 text-sm text-zinc-300">
              {currentList.items.map((item, i) => (
                <li key={i} className="list-decimal leading-relaxed">
                  {parseInline(item)}
                </li>
              ))}
            </ol>
          );
        }
        currentList = null;
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      // Heading 1 (# ...)
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1
            key={`h1-${i}`}
            className="mt-6 mb-3 text-xl font-bold tracking-tight text-white first:mt-0"
          >
            {parseInline(line.replace(/^#\s+/, ""))}
          </h1>
        );
        continue;
      }

      // Heading 2 (## ...)
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2
            key={`h2-${i}`}
            className="mt-5 mb-2.5 text-lg font-semibold tracking-tight text-white first:mt-0"
          >
            {parseInline(line.replace(/^##\s+/, ""))}
          </h2>
        );
        continue;
      }

      // Heading 3 (### ...)
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3
            key={`h3-${i}`}
            className="mt-4 mb-2 text-base font-semibold text-zinc-100 first:mt-0"
          >
            {parseInline(line.replace(/^###\s+/, ""))}
          </h3>
        );
        continue;
      }

      // Unordered list (- ... or * ...)
      const ulMatch = line.match(/^[-*]\s+(.+)/);
      if (ulMatch) {
        if (!currentList || currentList.type !== "ul") {
          flushList();
          currentList = { type: "ul", items: [] };
        }
        currentList.items.push(ulMatch[1]);
        continue;
      }

      // Ordered list (1. ...)
      const olMatch = line.match(/^\d+\.\s+(.+)/);
      if (olMatch) {
        if (!currentList || currentList.type !== "ol") {
          flushList();
          currentList = { type: "ol", items: [] };
        }
        currentList.items.push(olMatch[1]);
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${i}`} className="my-2 text-sm leading-relaxed text-zinc-300">
          {parseInline(line)}
        </p>
      );
    }

    flushList();

    return <div key={`block-${blockIndex}`}>{elements}</div>;
  };

  return (
    <div className={`space-y-4 text-zinc-300 ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <CodeBlock
              key={`code-${index}`}
              code={block.content}
              language={block.language}
            />
          );
        }
        return renderTextBlock(block.content, index);
      })}
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-lg border border-zinc-800 bg-[#0d1117] text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-3 py-1.5">
        <span className="font-mono text-[11px] text-zinc-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-0.5 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto p-3 font-mono leading-relaxed text-zinc-200">
        <pre>{code}</pre>
      </div>
    </div>
  );
}
