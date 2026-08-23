"use client";

type CodeViewerProps = {
  fileName: string;
  content: string;
  htmlUrl?: string;
  onExplain: () => void;
  explaining: boolean;
};

export default function CodeViewer({
  fileName,
  content,
  htmlUrl,
  onExplain,
  explaining,
}: CodeViewerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span>📄</span>

          <span className="font-medium text-white">
            {fileName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {htmlUrl && (
            <a
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              View on GitHub
            </a>
          )}

          <button
            type="button"
            onClick={onExplain}
            disabled={explaining}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {explaining ? "🤖 Explaining..." : "🤖 Explain This File"}
          </button>
        </div>
      </div>

      <pre className="max-h-[600px] overflow-auto p-5 text-sm leading-6 text-zinc-300">
        <code>{content}</code>
      </pre>
    </div>
  );
}
