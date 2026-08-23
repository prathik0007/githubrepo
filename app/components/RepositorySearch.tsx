"use client";

import { useMemo, useState } from "react";

type FileItem = {
  path: string;
  size?: number;
};

type RepositorySearchProps = {
  files: FileItem[];
  onSelectFile: (path: string) => void;
};

export default function RepositorySearch({
  files,
  onSelectFile,
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
      .slice(0, 30);
  }, [files, query]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-white">
          🔍 Search Repository
        </h3>

        <p className="mt-1 text-xs text-zinc-500">
          Search for files by name or path.
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search files..."
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
      />

      {query.trim() && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-zinc-500">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </p>

          <div className="max-h-72 overflow-auto">
            {results.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => onSelectFile(file.path)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
              >
                <span>📄</span>
                <span className="truncate">{file.path}</span>
              </button>
            ))}

            {results.length === 0 && (
              <p className="py-4 text-center text-sm text-zinc-500">
                No matching files found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
