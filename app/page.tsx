"use client";

import { useState } from "react";
import ArchitectureDiagram from "./components/ArchitectureDiagram";
import CodeSearch from "./components/CodeSearch";
import CodeViewer from "./components/CodeViewer";
import FileTree from "./components/FileTree";
import MarkdownRenderer from "./components/MarkdownRenderer";
import Navbar from "./components/Navbar";
import RepositorySearch from "./components/RepositorySearch";
import { detectTechnologies } from "./lib/detectTechnologies";

type TabType = "tree" | "source" | "search" | "code_search";

const SAMPLE_REPOS = [
  { name: "React", url: "https://github.com/facebook/react" },
  { name: "Express", url: "https://github.com/expressjs/express" },
  { name: "FastAPI", url: "https://github.com/fastapi/fastapi" },
  { name: "Zustand", url: "https://github.com/pmndrs/zustand" },
];

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [highlightLine, setHighlightLine] = useState<number | null>(null);
  const [fileExplanation, setFileExplanation] = useState("");
  const [fileExplaining, setFileExplaining] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("tree");

  const technologyFiles = repoData
    ? [...(repoData.files || []), ...(repoData.sourceFiles || [])]
    : [];
  const technologies = repoData ? detectTechnologies(technologyFiles) : [];

  const languageNames = new Set([
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "Ruby",
    "PHP",
    "SQL",
  ]);

  const frameworkNames = new Set([
    "React",
    "Next.js",
    "Express.js",
    "Node.js",
    "React Router",
    "FastAPI",
    "Django",
    "Flask",
  ]);

  const languages = technologies.filter((t) => languageNames.has(t));
  const frameworks = technologies.filter((t) => frameworkNames.has(t));
  const libraries = technologies.filter(
    (t) => !languageNames.has(t) && !frameworkNames.has(t)
  );

  const technologyCategories = [
    { name: "Languages", values: languages },
    { name: "Frameworks & Runtime", values: frameworks },
    { name: "Libraries & Database", values: libraries },
  ];

  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl || repoUrl;
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError("");
    setRepoData(null);
    setAiAnswer("");
    setAnalysis(null);
    setSelectedFile(null);
    setHighlightLine(null);
    setFileExplanation("");

    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: targetUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to analyze this repository. Please make sure it is public and the URL is valid."
        );
        return;
      }

      setRepoData(data);

      // Auto-select first source file if available
      if (data.sourceFiles && data.sourceFiles.length > 0) {
        setSelectedFile({
          path: data.sourceFiles[0].path,
          content: data.sourceFiles[0].content,
          size: data.sourceFiles[0].size,
        });
      }

      // Ask AI to explain the repository
      setAiLoading(true);
      setAiAnswer("");
      setAnalysis(null);

      try {
        const aiResponse = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: `Analyze this GitHub repository and explain it to a developer who is seeing the project for the first time.
Repository name: ${data.name}
Description: ${data.description || "No description available"}
Primary language: ${data.language || "Unknown"}
Important files:
${data.files
  .slice(0, 15)
  .map((file: { path: string }) => file.path)
  .join("\n")}
Source code:
${data.sourceFiles
  .map(
    (file: { path: string; content: string }) =>
      `\n--- ${file.path} ---\n${file.content}`
  )
  .join("\n")}

Explain:
1. What this project does
2. Main technologies used
3. Important files and their purpose
4. How the application works
5. The basic architecture
6. Where a new developer should start`,
            repository: {
              name: data.name,
              description: data.description,
              language: data.language,
              files: data.files,
            },
          }),
        });

        const aiData = await aiResponse.json();
        setAnalysis(aiData.analysis || null);
        setAiAnswer(aiData.answer || "");
      } catch (err) {
        console.error("AI analysis error:", err);
        setAiAnswer(
          "Unable to generate AI explanation. Please check your API configuration."
        );
      } finally {
        setAiLoading(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const explainFile = async () => {
    if (!selectedFile) return;

    setFileExplaining(true);
    setFileExplanation("");

    // Scroll to the full-width file explanation section
    setTimeout(() => {
      document
        .getElementById("ai-file-explanation-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `
Explain this source code file to a developer who is unfamiliar with the repository.

File:
${selectedFile.path}

Source code:
${selectedFile.content}

Please explain:
1. What this file does
2. Its main responsibilities
3. Important classes, functions, or methods
4. How it connects to the rest of the application
5. What a beginner should understand first
        `,
          file: {
            path: selectedFile.path,
            content: selectedFile.content,
          },
        }),
      });

      const data = await response.json();

      if (data.answer) {
        setFileExplanation(data.answer);
      }
    } catch (err) {
      console.error("Explain file error:", err);
      setFileExplanation("Unable to generate an explanation for this file.");
    } finally {
      setFileExplaining(false);
    }
  };

  const handleFileSelect = async (path: string) => {
    setHighlightLine(null);

    if (!repoData) return;

    const binaryExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".ico",
      ".pdf",
      ".zip",
      ".exe",
      ".svg",
    ];

    const isBinary = binaryExtensions.some((ext) =>
      path.toLowerCase().endsWith(ext)
    );

    if (isBinary) {
      setSelectedFile({
        path,
        content: "This binary file cannot be previewed in the code viewer.",
      });
      setFileExplanation("");
      return;
    }

    // Check if we already have it in local sourceFiles
    const localFile = repoData.sourceFiles?.find(
      (f: { path: string; content: string }) => f.path === path
    );

    if (localFile && localFile.content) {
      setSelectedFile({
        path: localFile.path,
        content: localFile.content,
        size: localFile.size,
      });
      setFileExplanation("");
      return;
    }

    setSelectedFile({
      path,
      content: "// Loading file content from GitHub...",
    });
    setFileExplanation("");

    try {
      const [owner, repo] = (repoData.fullName || "").split("/");
      const response = await fetch(
        `/api/github/file?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(
          path
        )}&branch=${encodeURIComponent(repoData.defaultBranch || "main")}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `GitHub request failed (${response.status})`);
      }

      setSelectedFile({
        path: data.path,
        content: data.content,
        size: data.size,
        sha: data.sha,
        htmlUrl: data.htmlUrl,
      });
    } catch (err) {
      console.error("File loading error:", err);
      setSelectedFile({
        path,
        content:
          err instanceof Error
            ? `// Error loading file from GitHub:\n// ${err.message}`
            : "// Unable to load this file from GitHub.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased selection:bg-blue-600/30 selection:text-blue-300">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-[#09090b] px-4 py-16 sm:px-6 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_50%)]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>AI-Powered Repository Explainer & Code Inspector</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Understand any <span className="text-blue-500">codebase</span> faster.
            </h1>

            <p className="mt-4 text-base leading-7 text-zinc-400 sm:text-lg">
              Paste a public GitHub repository to generate an AI technical overview,
              interactive architecture map, full code explorer, and onboarding guide.
            </p>

            {/* URL Input Bar */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnalyze();
                }}
                className="flex w-full max-w-2xl items-center rounded-xl border border-zinc-800 bg-zinc-900/90 p-1.5 shadow-2xl transition focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20"
              >
                <div className="flex items-center pl-3 text-zinc-500">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </div>

                <input
                  type="url"
                  required
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={loading || !repoUrl.trim()}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-3.5 w-3.5 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <span>Analyze</span>
                  )}
                </button>
              </form>

              {/* Sample Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-xs text-zinc-500">Try popular repos:</span>
                {SAMPLE_REPOS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => {
                      setRepoUrl(sample.url);
                      handleAnalyze(sample.url);
                    }}
                    className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-left text-xs text-red-300">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* REPOSITORY DASHBOARD RESULT */}
        {repoData ? (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
            {/* 1. Repository Header Summary */}
            <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-5 shadow-lg backdrop-blur-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-sm font-bold text-blue-400 ring-1 ring-blue-500/30">
                      📦
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      {repoData.name}
                    </h2>
                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
                      {repoData.defaultBranch || "main"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 max-w-3xl">
                    {repoData.description || "No description provided for this repository."}
                  </p>
                </div>

                {/* Right badges & action */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300">
                    <span className="text-blue-400">●</span>
                    <span>{repoData.language || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300">
                    <span>⭐</span>
                    <span>{repoData.stars?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300">
                    <span>🍴</span>
                    <span>{repoData.forks?.toLocaleString()}</span>
                  </div>
                  <a
                    href={repoData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700"
                  >
                    <span>View on GitHub</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* Technology Categories Bar */}
              {technologies.length > 0 && (
                <div className="mt-4 border-t border-zinc-800/80 pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                  {technologyCategories.map(
                    (cat) =>
                      cat.values.length > 0 && (
                        <div key={cat.name} className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            {cat.name}:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.values.map((val) => (
                              <span
                                key={val}
                                className="rounded bg-blue-950/60 px-2 py-0.5 text-[11px] font-medium text-blue-300 ring-1 ring-blue-800/50"
                              >
                                {val}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>

            {/* 2. Main Two-Column Layout (Explorer + Code Viewer) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Explorer (4 cols) */}
              <div className="lg:col-span-4 flex flex-col space-y-3">
                {/* Explorer Tabs */}
                <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tree")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                      activeTab === "tree"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    📁 Explorer
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("source")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                      activeTab === "source"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    📄 Source ({repoData.sourceFiles?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("search")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                      activeTab === "search"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    🔍 Path
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("code_search")}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                      activeTab === "code_search"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    🔎 Code
                  </button>
                </div>

                {/* Explorer Panels */}
                <div className="h-[540px]">
                  {activeTab === "tree" && (
                    <FileTree
                      files={repoData.files || []}
                      onSelectFile={handleFileSelect}
                      selectedPath={selectedFile?.path}
                    />
                  )}

                  {activeTab === "source" && (
                    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950">
                      <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs font-semibold text-zinc-300">
                        Analyzed Source Files
                      </div>
                      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                        {repoData.sourceFiles?.map(
                          (file: { path: string; size: number }) => {
                            const isSelected = selectedFile?.path === file.path;
                            return (
                              <button
                                key={file.path}
                                type="button"
                                onClick={() => handleFileSelect(file.path)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                                  isSelected
                                    ? "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30"
                                    : "text-zinc-300 hover:bg-zinc-900"
                                }`}
                              >
                                <span className="truncate font-mono">{file.path}</span>
                                <span className="text-[10px] text-zinc-500 shrink-0 ml-2">
                                  {file.size ? `${(file.size / 1024).toFixed(1)}k` : ""}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "search" && (
                    <RepositorySearch
                      files={repoData.files || []}
                      onSelectFile={handleFileSelect}
                      selectedPath={selectedFile?.path}
                    />
                  )}

                  {activeTab === "code_search" && (
                    <CodeSearch
                      files={repoData.sourceFiles || []}
                      onSelectFile={(file, lineNumber) => {
                        setSelectedFile(file);
                        setHighlightLine(lineNumber);
                        setFileExplanation("");
                      }}
                      selectedPath={selectedFile?.path}
                    />
                  )}
                </div>
              </div>

              {/* Right Column: Code Viewer (8 cols) */}
              <div className="lg:col-span-8">
                <div className="h-[585px]">
                  <CodeViewer
                    fileName={selectedFile?.path}
                    content={selectedFile?.content}
                    size={selectedFile?.size}
                    htmlUrl={selectedFile?.htmlUrl}
                    onExplain={explainFile}
                    explaining={fileExplaining}
                    highlightLine={highlightLine}
                  />
                </div>
              </div>
            </div>

            {/* 3. AI Repository Technical Overview Section (Full Width) */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col gap-1 border-b border-zinc-800 pb-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-sm text-blue-400 ring-1 ring-blue-500/30">
                    ✨
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    AI Repository Explanation
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  AI-generated technical architecture, components overview, and onboarding roadmap.
                </p>
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-xl text-blue-400 animate-pulse">
                    🤖
                  </div>
                  <p className="mt-4 text-sm font-medium text-zinc-200">
                    Gemini AI is analyzing codebase architecture...
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Parsing dependencies, components, and code relationships
                  </p>
                </div>
              ) : analysis ? (
                <div className="mt-8 space-y-8">
                  {/* Overview */}
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                      📋 Repository Overview
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">
                      {analysis.overview}
                    </p>
                  </div>

                  {/* Architecture Diagram */}
                  {analysis.architecture && (
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                        🏗️ Architecture & Component Flow
                      </h4>
                      <p className="mt-2 text-xs leading-6 text-zinc-400">
                        {analysis.architecture.description}
                      </p>
                      <ArchitectureDiagram architecture={analysis.architecture} />
                    </div>
                  )}

                  {/* Important Files Grid */}
                  {analysis.importantFiles && analysis.importantFiles.length > 0 && (
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                        📁 Key Files & Purpose
                      </h4>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {analysis.importantFiles.map(
                          (item: { file: string; purpose: string }) => (
                            <div
                              key={item.file}
                              className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5 transition hover:border-zinc-700"
                            >
                              <p className="font-mono text-xs font-semibold text-blue-400">
                                {item.file}
                              </p>
                              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                                {item.purpose}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Onboarding Guide */}
                  {analysis.onboardingGuide && analysis.onboardingGuide.length > 0 && (
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                        🚀 Start Here Onboarding Guide
                      </h4>
                      <div className="mt-4 space-y-3">
                        {analysis.onboardingGuide.map(
                          (
                            step: {
                              file: string;
                              title: string;
                              description: string;
                            },
                            index: number
                          ) => (
                            <div
                              key={`${step.file}-${index}`}
                              className="flex items-start gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-xs font-bold text-blue-400 ring-1 ring-blue-500/40">
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-semibold text-white">
                                  {step.title}
                                </h5>
                                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                                  {step.description}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleFileSelect(step.file)}
                                    className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-400 hover:underline"
                                  >
                                    <span>📄 {step.file}</span>
                                    <span>→</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : aiAnswer ? (
                <div className="mt-6">
                  <MarkdownRenderer content={aiAnswer} />
                </div>
              ) : (
                <div className="mt-6 rounded-lg bg-zinc-900/40 p-4 text-xs text-zinc-500 text-center">
                  No AI explanation generated yet.
                </div>
              )}
            </div>

            {/* 4. AI File Explanation Section (Full Width) */}
            {(fileExplaining || fileExplanation) && (
              <div
                id="ai-file-explanation-section"
                className="rounded-2xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-2xl transition-all"
              >
                {/* Header */}
                <div className="flex flex-col gap-2 border-b border-zinc-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-base text-blue-400 ring-1 ring-blue-500/30">
                      🤖
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold tracking-tight text-white">
                          AI File Explanation
                        </h3>
                        <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 font-mono text-xs text-blue-400">
                          {selectedFile?.path}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        In-depth technical breakdown of responsibilities, key functions, and project role.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFileExplanation("")}
                    className="self-start rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white sm:self-center"
                  >
                    ✕ Close Explanation
                  </button>
                </div>

                {/* Content */}
                <div className="mt-6">
                  {fileExplaining ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-xl text-blue-400 animate-pulse">
                        ⚙️
                      </div>
                      <p className="mt-4 text-sm font-medium text-zinc-200">
                        Analyzing {selectedFile?.path}...
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Extracting responsibilities, functions, methods, and architectural context
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-8">
                      <MarkdownRenderer
                        content={fileExplanation}
                        className="leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Feature Cards (Landing State) */
          <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-sm transition hover:border-zinc-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-xl text-blue-400">
                  📋
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">
                  Repository Overview
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Detects project architecture, languages, runtime frameworks, and libraries automatically.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-sm transition hover:border-zinc-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-xl text-blue-400">
                  🏗️
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">
                  Interactive Architecture
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Generates interactive ReactFlow visual maps showing how system components connect.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-sm transition hover:border-zinc-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-xl text-blue-400">
                  🚀
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">
                  Start Here Guide
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Step-by-step onboarding walkthrough highlighting the most crucial files for new contributors.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p>© {new Date().getFullYear()} GitHub Repository Explainer • Powered by Next.js & Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}