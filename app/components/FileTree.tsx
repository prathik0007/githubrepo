"use client";

import { useState } from "react";

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
};

function buildTree(files: FileItem[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part;

      const isFile = index === parts.length - 1;

      let existing = current.find(
        (node) => node.name === part
      );

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

  return root;
}

function TreeNodeView({
  node,
  onSelectFile,
  level = 0,
}: {
  node: TreeNode;
  onSelectFile: (path: string) => void;
  level?: number;
}) {
  const [open, setOpen] = useState(false);

  if (node.type === "file") {
    return (
      <button
        type="button"
        onClick={() => onSelectFile(node.path)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
        style={{ paddingLeft: `${level * 18 + 8}px` }}
      >
        <span>📄</span>
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-zinc-200 hover:bg-zinc-800"
        style={{ paddingLeft: `${level * 18 + 8}px` }}
      >
        <span>{open ? "📂" : "📁"}</span>
        <span className="truncate">{node.name}</span>
      </button>

      {open && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeView
              key={child.path}
              node={child}
              onSelectFile={onSelectFile}
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
}: FileTreeProps) {
  const tree = buildTree(files);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
      <div className="mb-3 px-2 text-sm font-semibold text-white">
        📁 Repository Explorer
      </div>

      <div className="max-h-[600px] overflow-auto">
        {tree.map((node) => (
          <TreeNodeView
            key={node.path}
            node={node}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    </div>
  );
}
