"use client";

import { useState } from "react";
import ArchitectureDiagram from "./components/ArchitectureDiagram";
import CodeSearch from "./components/CodeSearch";
import CodeViewer from "./components/CodeViewer";
import FileTree from "./components/FileTree";
import RepositorySearch from "./components/RepositorySearch";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFallback, setAiFallback] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [highlightLine, setHighlightLine] =
    useState<number | null>(null);
  const [fileExplanation, setFileExplanation] = useState("");
  const [fileExplaining, setFileExplaining] = useState(false);
  const [fileExplanationFallback, setFileExplanationFallback] =
    useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setRepoData(null);
    setAiAnswer("");
    setAiFallback(false);
    setAnalysis(null);
    setSelectedFile(null);
    setHighlightLine(null);
    setFileExplanation("");
    setFileExplanationFallback(false);

    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: repoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setRepoData(data);

      // Ask AI to explain the repository
      setAiLoading(true);
      setAiAnswer("");
      setAiFallback(false);
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
        setAiFallback(aiData.fallback === true);
      } catch (error) {
        console.error(error);
        setAiAnswer("Unable to generate AI explanation.");
      } finally {
        setAiLoading(false);
      }
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const explainFile = async () => {
    if (!selectedFile) {
      return;
    }

    setFileExplaining(true);
    setFileExplanation("");
    setFileExplanationFallback(false);

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

      setFileExplanationFallback(data.fallback === true);
    } catch (error) {
      console.error(error);
      setFileExplanation("Unable to generate an explanation for this file.");
    } finally {
      setFileExplaining(false);
    }
  };

  const handleFileSelect = async (path: string) => {
    setHighlightLine(null);

    if (!repoData) {
      return;
    }

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
    ];

    const isBinary = binaryExtensions.some((extension) =>
      path.toLowerCase().endsWith(extension)
    );

    if (isBinary) {
      setSelectedFile({
        path,
        content: "This file type cannot be displayed in the code viewer.",
      });
      setFileExplanation("");
      setFileExplanationFallback(false);
      return;
    }

    setSelectedFile({
      path,
      content: "Loading file...",
    });

    setFileExplanation("");
    setFileExplanationFallback(false);

    try {
      const [owner, repo] = (repoData.fullName || "").split("/");
      const response = await fetch(
        `/api/github/file?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(
          repo
        )}&path=${encodeURIComponent(
          path
        )}&branch=${encodeURIComponent(repoData.defaultBranch || "main")}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load file");
      }

      setSelectedFile({
        path: data.path,
        content: data.content,
        size: data.size,
        sha: data.sha,
        htmlUrl: data.htmlUrl,
      });
    } catch (error) {
      console.error(error);

      setSelectedFile({
        path,
        content: "Unable to load this file from GitHub.",
      });
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-semibold">
            GitHub Repository Explainer
          </h1>

          <span className="rounded-full border border-zinc-700 px-4 py-1.5 text-sm text-zinc-400">
            AI Developer Tool
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto flex min-h-[75vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-5 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
          ✨ Understand GitHub repositories with AI
        </div>

        <h2 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Understand any
          <span className="text-blue-500"> codebase </span>
          faster.
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Paste a public GitHub repository and get an AI-powered overview,
          architecture explanation, code insights, and a beginner-friendly
          onboarding guide.
        </p>

        {/* Repository Input */}
        <div className="mt-10 flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-3xl items-center justify-center gap-3">
            <input
              type="url"
              placeholder="https://github.com/user/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="h-14 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-5 text-white outline-none placeholder:text-zinc-500 focus:border-blue-500"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="h-14 rounded-xl bg-blue-600 px-7 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze Repository"}
            </button>
          </div>
          {/* Repository Result */}
          {error && (
            <div className="mt-8 w-full max-w-2xl rounded-xl border border-red-800 bg-red-950/30 p-5 text-red-300">
              {error}
            </div>
          )}

{repoData && (
  <div className="w-full max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-left">
    <h3 className="text-2xl font-bold text-white">
      {repoData.name}
    </h3>

    <p className="mt-2 text-zinc-400">
      {repoData.description || "No description available."}
    </p>

    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div>
        <p className="text-sm text-zinc-500">Language</p>
        <p className="mt-1 font-semibold">
          {repoData.language || "Unknown"}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">Stars</p>
        <p className="mt-1 font-semibold">
          ⭐ {repoData.stars}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">Forks</p>
        <p className="mt-1 font-semibold">
          🍴 {repoData.forks}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">Repository</p>
        <a
          href={repoData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block font-semibold text-blue-400 hover:underline"
        >
          View on GitHub
        </a>
      </div>
    </div>

    <div className="mt-8 border-t border-zinc-700 pt-6">
      <div className="space-y-4">
        <RepositorySearch
          files={repoData.files || []}
          onSelectFile={handleFileSelect}
        />

        <CodeSearch
          files={repoData.sourceFiles || []}
          onSelectFile={(file, lineNumber) => {
            setSelectedFile(file);
            setHighlightLine(lineNumber);
            setFileExplanation("");
            setFileExplanationFallback(false);
          }}
        />

        <FileTree
          files={repoData.files || []}
          onSelectFile={handleFileSelect}
        />
      </div>
    </div>

    <div className="mt-8 border-t border-zinc-700 pt-6">
      <h4 className="text-lg font-semibold text-white">
        Source Files
      </h4>
      <div className="mt-4 space-y-4">
        {repoData.sourceFiles?.map(
          (file: {
            path: string;
            size: number;
            content: string;
          }) => (
            <div
              key={file.path}
              className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
            >
              <div className="border-b border-zinc-800 px-4 py-3">
                <span className="text-sm font-semibold text-blue-400">
                  📄 {file.path}
                </span>
              </div>
              <pre className="max-h-80 overflow-auto p-4 text-left text-xs leading-6 text-zinc-300">
                <code>{file.content}</code>
              </pre>
            </div>
          )
        )}
      </div>
    </div>

    {selectedFile && (
      <div className="mt-8">
        <div className="mb-4">
          <h4 className="text-xl font-semibold text-white">
            🔍 Code Viewer
          </h4>

          <p className="mt-1 text-sm text-zinc-500">
            Inspect the selected repository file.
          </p>
        </div>

        <CodeViewer
          fileName={selectedFile.path}
          content={selectedFile.content}
          htmlUrl={selectedFile.htmlUrl}
          onExplain={explainFile}
          explaining={fileExplaining}
          highlightLine={highlightLine}
        />

        {fileExplanation && (
          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-center justify-between">
              <h5 className="text-lg font-semibold text-white">
                🤖 File Explanation
              </h5>

              {fileExplanationFallback && (
                <span className="rounded-full border border-yellow-700 bg-yellow-950/40 px-3 py-1 text-xs text-yellow-400">
                  Demo answer
                </span>
              )}
            </div>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {fileExplanation}
            </div>
          </div>
        )}
      </div>
    )}

    {/* AI Explanation */}
    <div className="mt-8 border-t border-zinc-700 pt-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">
          AI Explanation
        </h4>
        {aiFallback && (
          <span className="rounded-full border border-yellow-700 bg-yellow-950/40 px-3 py-1 text-xs text-yellow-400">
            Using demo answer
          </span>
        )}
      </div>

      {analysis && (
        <div className="mt-6 space-y-5">
          {/* Overview */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h5 className="text-lg font-semibold text-white">
              📋 Repository Overview
            </h5>
            <p className="mt-3 leading-7 text-zinc-400">
              {analysis.overview}
            </p>
          </div>

          {/* Technologies */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h5 className="text-lg font-semibold text-white">
              🛠️ Technologies
            </h5>
            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.technologies?.map(
                (technology: string) => (
                  <span
                    key={technology}
                    className="rounded-full bg-blue-950 px-3 py-1 text-sm text-blue-300"
                  >
                    {technology}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Important Files */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h5 className="text-lg font-semibold text-white">
              📁 Important Files
            </h5>
            <div className="mt-4 space-y-3">
              {analysis.importantFiles?.map(
                (item: { file: string; purpose: string }) => (
                  <div
                    key={item.file}
                    className="rounded-lg border border-zinc-800 p-4"
                  >
                    <p className="font-medium text-blue-400">
                      {item.file}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.purpose}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Architecture */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h5 className="text-lg font-semibold text-white">
              🏗️ Architecture
            </h5>
            <p className="mt-3 leading-7 text-zinc-400">
              {analysis.architecture.description}
            </p>
            <ArchitectureDiagram architecture={analysis.architecture} />
          </div>

          {/* Onboarding */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h5 className="text-lg font-semibold text-white">
              🚀 Start Here
            </h5>
            <div className="mt-5 space-y-4">
              {analysis.onboardingGuide?.map(
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
                    className="rounded-lg border border-zinc-800 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-950 text-sm font-semibold text-blue-400">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <h6 className="font-semibold text-white">
                          {step.title}
                        </h6>

                        <p className="mt-1 text-sm leading-6 text-zinc-400">
                          {step.description}
                        </p>

                        <div className="mt-3 inline-flex rounded-md bg-zinc-900 px-3 py-1.5">
                          <code className="text-xs text-blue-400">
                            📄 {step.file}
                          </code>
                        </div>

                        <a
                          href={`https://github.com/${repoData.fullName}/blob/${repoData.defaultBranch}/${step.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block text-sm font-medium text-blue-400 hover:underline"
                        >
                          View on GitHub →
                        </a>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {aiLoading ? (
        <div className="mt-4 rounded-lg bg-zinc-950 p-5 text-zinc-400">
          🤖 AI is analyzing this repository...
        </div>
      ) : analysis ? null : aiAnswer ? (
        <div className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950 p-5 text-left text-sm leading-7 text-zinc-300">
          {aiAnswer}
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-zinc-950 p-5 text-zinc-500">
          No AI explanation available yet.
        </div>
      )}
    </div>
  </div>
)}
        </div>

        {/* Features */}
        <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 text-2xl">📋</div>
            <h3 className="font-semibold">Repository Overview</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Understand what the project does and which technologies it uses.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 text-2xl">🏗️</div>
            <h3 className="font-semibold">Architecture</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Discover how the different parts of the application connect.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 text-2xl">🚀</div>
            <h3 className="font-semibold">Start Here Guide</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Get a simple guide for understanding an unfamiliar codebase.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}