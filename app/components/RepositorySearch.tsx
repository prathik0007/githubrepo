"use client";

import { useMemo, useState } from "react";

type FileItem = {
  path: string;
  size?: number;
};

type RepositorySearchProps = {
  files: FileItem[];
  onSelectFile: (path: string) => void;
  selectedPath?: string | null;
};

export default function RepositorySearch({
  files,
  onSelectFile,
  selectedPath,
}: RepositorySearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return files
      .filter((file) => {
        const lowerPath = file.path.toLowerCase();
        const fileName = lowerPath.split("/").pop() || "";
        return lowerPath.includes(search) || fileName.includes(search);
      })
      .slice(0, 50);
  }, [files, query]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950">
      {/* Search Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40 p-2.5">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file name or path..."
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
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Results List */}
      <div className="h-[480px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
        {query.trim() ? (
          results.length > 0 ? (
            <div className="space-y-1">
              {results.map((file) => {
                const isSelected = selectedPath === file.path;
                const fileName = file.path.split("/").pop();
                const folderPath = file.path.substring(
                  0,
                  file.path.length - (fileName?.length || 0)
                );

                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => onSelectFile(file.path)}
                    className={`flex w-full flex-col rounded-lg px-3 py-2 text-left transition ${
                      isSelected
                        ? "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30"
                        : "text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">📄</span>
                      <span className="truncate font-mono text-xs font-medium text-white">
                        {fileName}
                      </span>
                    </div>
                    {folderPath && (
                      <span className="truncate pl-5 font-mono text-[10px] text-zinc-500">
                        {folderPath}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-zinc-500">
              <span>No matching files found</span>
            </div>
          )
        ) : (
          <div className="flex h-40 flex-col items-center justify-center p-4 text-center text-xs text-zinc-500">
            <span className="text-lg">🔍</span>
            <span className="mt-2">Type above to search file paths</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/30 px-3 py-1.5 text-[11px] text-zinc-500">
        <span>
          {query.trim() ? `${results.length} results` : `${files.length} indexed files`}
        </span>
      </div>
    </div>
  );
}
