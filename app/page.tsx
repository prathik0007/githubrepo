"use client";

import { useState } from "react";
import ArchitectureDiagram from "./components/ArchitectureDiagram";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFallback, setAiFallback] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setRepoData(null);
    setAiAnswer("");
    setAiFallback(false);
    setAnalysis(null);

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
        <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
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
          {/* Repository Result */}
          {error && (
            <div className="mt-8 w-full max-w-2xl rounded-xl border border-red-800 bg-red-950/30 p-5 text-red-300">
              {error}
            </div>
          )}

{repoData && (
  <div className="mt-8 w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-left">
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
      <h4 className="text-lg font-semibold text-white">
        Repository Files
      </h4>
      <div className="mt-4 max-h-64 overflow-y-auto rounded-lg bg-zinc-950 p-4">
        {repoData.files?.map(
          (file: { path: string; size: number }) => (
            <div
              key={file.path}
              className="flex items-center justify-between border-b border-zinc-800 py-2 last:border-b-0"
            >
              <span className="text-sm text-zinc-300">
                📄 {file.path}
              </span>
              <span className="text-xs text-zinc-500">
                {file.size} bytes
              </span>
            </div>
          )
        )}
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
            <ol className="mt-4 space-y-3">
              {analysis.onboardingGuide?.map(
                (step: string, index: number) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm text-zinc-400"
                  >
                    <span className="font-semibold text-blue-400">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                )
              )}
            </ol>
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