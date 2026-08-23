"use client";

import { useMemo, useState } from "react";

type SourceFile = {
  path: string;
  content: string;
};

type CodeSearchProps = {
  files: SourceFile[];
  onSelectFile: (
    file: SourceFile,
    lineNumber: number
  ) => void;
};

type Match = {
  file: SourceFile;
  lineNumber: number;
  line: string;
};

export default function CodeSearch({
  files,
  onSelectFile,
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

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(search)) {
          matches.push({
            file,
            lineNumber: index + 1,
            line: line.trim(),
          });
        }
      });

      if (matches.length >= 50) {
        break;
      }
    }

    return matches;
  }, [files, query]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="font-semibold text-white">
        🔎 Search Code
      </h3>

      <p className="mt-1 text-xs text-zinc-500">
        Search inside the source code.
      </p>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search code..."
        className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
      />

      {query.trim() && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-zinc-500">
            {results.length} {results.length === 1 ? "match" : "matches"}
          </p>

          <div className="max-h-96 space-y-1 overflow-auto">
            {results.map((match, index) => (
              <button
                key={`${match.file.path}-${match.lineNumber}-${index}`}
                type="button"
                onClick={() =>
                  onSelectFile(match.file, match.lineNumber)
                }
                className="w-full rounded-lg p-3 text-left hover:bg-zinc-800"
              >
                <div className="text-sm font-medium text-blue-400">
                  {match.file.path}
                  <span className="ml-2 text-xs text-zinc-500">
                    Line {match.lineNumber}
                  </span>
                </div>

                <code className="mt-1 block truncate text-xs text-zinc-400">
                  {match.line}
                </code>
              </button>
            ))}

            {results.length === 0 && (
              <p className="py-4 text-center text-sm text-zinc-500">
                No matching code found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
