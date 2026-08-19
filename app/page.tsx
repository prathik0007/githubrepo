"use client";

import { useState } from "react";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
const [repoData, setRepoData] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleAnalyze = async () => {
  setLoading(true);
  setError("");
  setRepoData(null);

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