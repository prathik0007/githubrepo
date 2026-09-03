"use client";

import { useMemo, useState } from "react";

type SourceFile = {
  path: string;
  content: string;
};

type CodeSearchProps = {
  files: SourceFile[];
  onSelectFile: (file: SourceFile, lineNumber: number) => void;
  selectedPath?: string | null;
};

type Match = {
  file: SourceFile;
  lineNumber: number;
  line: string;
};

export default function CodeSearch({
  files,
  onSelectFile,
  selectedPath,
}: CodeSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return [];
    }

    const matches: Match[] = [];

    for (const file of files) {
      if (!file.content) {
        continue;
      }

      const lines = file.content.split("\n");

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.toLowerCase().includes(search)) {
          matches.push({
            file,
            lineNumber: index + 1,
            line: line.trim(),
          });

          if (matches.length >= 80) {
            return matches;
          }
        }
      }
    }

    return matches;
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
            placeholder="Search code content..."
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

      {/* Matches List */}
      <div className="h-[480px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
        {query.trim() ? (
          results.length > 0 ? (
            <div className="space-y-1.5">
              {results.map((match, index) => {
                const isSelected = selectedPath === match.file.path;

                return (
                  <button
                    key={`${match.file.path}-${match.lineNumber}-${index}`}
                    type="button"
                    onClick={() => onSelectFile(match.file, match.lineNumber)}
                    className={`group w-full rounded-lg border border-zinc-800/60 p-2.5 text-left transition ${
                      isSelected
                        ? "bg-blue-600/10 border-blue-500/40"
                        : "bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-mono font-medium text-blue-400">
                        {match.file.path}
                      </span>
                      <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        Line {match.lineNumber}
                      </span>
                    </div>

                    <div className="mt-1.5 truncate rounded bg-zinc-950/80 px-2 py-1 font-mono text-[11px] text-zinc-300">
                      {match.line}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-zinc-500">
              <span>No matching code found</span>
            </div>
          )
        ) : (
          <div className="flex h-40 flex-col items-center justify-center p-4 text-center text-xs text-zinc-500">
            <span className="text-lg">🔎</span>
            <span className="mt-2">Type a term to search inside source code</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-900/30 px-3 py-1.5 text-[11px] text-zinc-500">
        <span>
          {query.trim()
            ? `${results.length} matches found`
            : `${files.length} source files searchable`}
        </span>
      </div>
    </div>
  );
}
