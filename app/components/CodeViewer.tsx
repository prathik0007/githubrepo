"use client";

type CodeViewerProps = {
  fileName: string;
  content: string;
};

export default function CodeViewer({
  fileName,
  content,
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
      </div>

      <pre className="max-h-[600px] overflow-auto p-5 text-sm leading-6 text-zinc-300">
        <code>{content}</code>
      </pre>
    </div>
  );
}
