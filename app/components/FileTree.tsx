"use client";

import { useMemo, useState } from "react";

type FileItem = {
  path: string;
  size?: number;
};

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
};

type FileTreeProps = {
  files: FileItem[];
  onSelectFile: (path: string) => void;
  selectedPath?: string | null;
};

function getFileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    return <span className="text-blue-400 font-bold text-[10px]">TS</span>;
  }
  if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs")) {
    return <span className="text-amber-400 font-bold text-[10px]">JS</span>;
  }
  if (lower.endsWith(".json")) {
    return <span className="text-yellow-500 font-bold text-[10px]">{}</span>;
  }
  if (lower.endsWith(".py")) {
    return <span className="text-emerald-400 font-bold text-[10px]">PY</span>;
  }
  if (lower.endsWith(".rb")) {
    return <span className="text-red-400 font-bold text-[10px]">RB</span>;
  }
  if (lower.endsWith(".css") || lower.endsWith(".scss")) {
    return <span className="text-cyan-400 font-bold text-[10px]">#</span>;
  }
  if (lower.endsWith(".html")) {
    return <span className="text-orange-400 font-bold text-[10px]">&lt;&gt;</span>;
  }
  if (lower.endsWith(".md") || lower.endsWith(".mdx")) {
    return <span className="text-zinc-400 font-bold text-[10px]">MD</span>;
  }
  if (lower.endsWith(".sql")) {
    return <span className="text-indigo-400 font-bold text-[10px]">SQL</span>;
  }
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) {
    return <span className="text-pink-400 font-bold text-[10px]">YML</span>;
  }
  if (lower === "dockerfile" || lower.startsWith(".docker")) {
    return <span className="text-sky-400 font-bold text-[10px]">🐳</span>;
  }
  return <span className="text-zinc-500 text-xs">📄</span>;
}

function buildTree(files: FileItem[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;

      let existing = current.find((node) => node.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        };
        current.push(existing);
      }

      if (!isFile && existing.children) {
        current = existing.children;
      }
    });
  }

  // Sort folders first, then alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.children) sortNodes(node.children);
    });
  };

  sortNodes(root);
  return root;
}

function TreeNodeView({
  node,
  onSelectFile,
  selectedPath,
  level = 0,
}: {
  node: TreeNode;
  onSelectFile: (path: string) => void;
  selectedPath?: string | null;
  level?: number;
}) {
  const [open, setOpen] = useState(level < 1); // Expand top-level by default

  const isSelected = selectedPath === node.path;

  if (node.type === "file") {
    return (
      <button
        type="button"
        onClick={() => onSelectFile(node.path)}
        className={`group flex w-full items-center gap-2 py-1 text-left text-xs transition ${
          isSelected
            ? "border-l-2 border-blue-500 bg-blue-500/10 font-medium text-blue-400"
            : "border-l-2 border-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
        }`}
        style={{ paddingLeft: `${level * 14 + 10}px`, paddingRight: "10px" }}
      >
        <span className="flex h-4 w-4 items-center justify-center shrink-0">
          {getFileIcon(node.name)}
        </span>
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center gap-1.5 py-1 text-left text-xs font-medium text-zinc-300 transition hover:bg-zinc-800/60 hover:text-zinc-100"
        style={{ paddingLeft: `${level * 14 + 6}px`, paddingRight: "10px" }}
      >
        <span className="text-[10px] text-zinc-500 transition-transform duration-150">
          {open ? "▾" : "▸"}
        </span>
        <span className="text-zinc-400 text-xs">
          {open ? "📂" : "📁"}
        </span>
        <span className="truncate">{node.name}</span>
      </button>

      {open && node.children && (
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 border-l border-zinc-800/60"
            style={{ left: `${level * 14 + 12}px` }}
          />
          {node.children.map((child) => (
            <TreeNodeView
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({
  files,
  onSelectFile,
  selectedPath,
}: FileTreeProps) {
  const [filter, setFilter] = useState("");

  const filteredFiles = useMemo(() => {
    if (!filter.trim()) return files;
    const q = filter.trim().toLowerCase();
    return files.filter((f) => f.path.toLowerCase().includes(q));
  }, [files, filter]);

  const tree = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950">
      {/* Header & Filter */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40 p-2.5">
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 pl-8 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <svg
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tree Content */}
      <div className="h-[480px] overflow-y-auto py-1 font-mono text-xs scrollbar-thin scrollbar-thumb-zinc-800">
        {tree.length > 0 ? (
          tree.map((node) => (
            <TreeNodeView
              key={node.path}
              node={node}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
            />
          ))
        ) : (
          <div className="flex h-32 flex-col items-center justify-center p-4 text-center text-xs text-zinc-500">
            <span>No matching files</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/30 px-3 py-1.5 text-[11px] text-zinc-500">
        <span>{filteredFiles.length} files</span>
        <span>Click to inspect</span>
      </div>
    </div>
  );
}
