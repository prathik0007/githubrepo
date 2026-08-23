import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EXTENSIONS = [
  ".py",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".html",
  ".css",
  ".java",
  ".c",
  ".cpp",
  ".cs",
  ".php",
  ".rb",
  ".go",
  ".rs",
  ".md",
  ".json",
  ".txt",
];

const IGNORED_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  "users.json",
];

function getFileScore(path: string) {
  const lowerPath = path.toLowerCase();
  const fileName = lowerPath.split("/").pop() || "";
  let score = 10;

  // Important project documentation/configuration
  if (fileName === "readme.md") {
    score += 100;
  }
  if (fileName === "package.json") {
    score += 90;
  }
  if (fileName === "requirements.txt") {
    score += 90;
  }
  if (fileName === "pyproject.toml") {
    score += 90;
  }
  if (fileName === "pom.xml") {
    score += 90;
  }

  // Common application entry points
  if (
    fileName === "app.py" ||
    fileName === "main.py" ||
    fileName === "server.py" ||
    fileName === "index.js" ||
    fileName === "server.js" ||
    fileName === "app.js" ||
    fileName === "main.js" ||
    fileName === "index.ts" ||
    fileName === "main.ts"
  ) {
    score += 80;
  }

  // Important frontend entry points
  if (
    fileName === "app.jsx" ||
    fileName === "app.tsx" ||
    fileName === "page.tsx" ||
    fileName === "layout.tsx"
  ) {
    score += 70;
  }

  // Files inside common source directories
  if (
    lowerPath.startsWith("src/") ||
    lowerPath.startsWith("app/") ||
    lowerPath.startsWith("components/") ||
    lowerPath.startsWith("routes/")
  ) {
    score += 40;
  }

  // ML-related files
  if (
    fileName.includes("model") ||
    fileName.includes("predict") ||
    fileName.includes("train")
  ) {
    score += 30;
  }

  // Avoid unnecessarily large source files
  if (path.length > 100) {
    score -= 10;
  }

  return score;
}

function isUsefulFile(path: string) {
  const lowerPath = path.toLowerCase();

  // Ignore environment files
  if (IGNORED_FILES.includes(lowerPath)) {
    return false;
  }

  // Ignore compiled/cache files
  if (
    lowerPath.endsWith(".pyc") ||
    lowerPath.includes("node_modules/") ||
    lowerPath.includes(".git/")
  ) {
    return false;
  }

  // Only allow supported source/documentation files
  return ALLOWED_EXTENSIONS.some((extension) =>
    lowerPath.endsWith(extension)
  );
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get the URL from the frontend
    const body = await request.json();
    const rawUrl = body.url?.trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    let githubUrl: URL;

    try {
      githubUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    if (githubUrl.hostname !== "github.com") {
      return NextResponse.json(
        { error: "Please provide a valid GitHub repository URL" },
        { status: 400 }
      );
    }

    const parts = githubUrl.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");

    console.log("Parsed GitHub repository:", {
      owner,
      repo,
    });

    // 4. Get repository information
    console.log(
      "Fetching GitHub repository:",
      `https://api.github.com/repos/${owner}/${repo}`
    );

    const repoResponse = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "GitHub-Repository-Explainer",
        },
        cache: "no-store",
      }
    );

    if (!repoResponse.ok) {
      const data = await repoResponse.json().catch(() => null);

      console.error("GitHub API error:", {
        status: repoResponse.status,
        statusText: repoResponse.statusText,
        data,
        owner,
        repo,
      });

      if (repoResponse.status === 404) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      if (repoResponse.status === 403) {
        return NextResponse.json(
          {
            error:
              "GitHub API access was denied or rate limited. Please try again later.",
            details: data,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: `GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`,
          details: data,
        },
        { status: repoResponse.status }
      );
    }

    const repoData = await repoResponse.json();

    // 5. Get repository tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "GitHub-Repository-Explainer",
        },
      }
    );

    if (!treeResponse.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve repository files" },
        { status: treeResponse.status }
      );
    }

    const treeData = await treeResponse.json();

    // 6. Get all files
    const allFiles = treeData.tree
      .filter((item: any) => item.type === "blob")
      .map((item: any) => ({
        path: item.path,
        size: item.size || 0,
      }));

    // 7. Select useful files for analysis
    const usefulFiles = allFiles
      .filter((file: { path: string; size: number }) =>
        isUsefulFile(file.path)
      )
      .map((file: { path: string; size: number }) => ({
        ...file,
        score: getFileScore(file.path),
      }))
      .sort(
        (
          a: { score: number },
          b: { score: number }
        ) => b.score - a.score
      )
      .slice(0, 15);

    // 8. Fetch contents of selected files
    const filesWithContent = await Promise.all(
      usefulFiles.map(async (file: { path: string; size: number }) => {
        try {
          // Don't download extremely large files
          if (file.size > 100000) {
            return {
              path: file.path,
              size: file.size,
              content: "[File too large to analyze]",
            };
          }

          const contentResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${repoData.default_branch}`,
            {
              headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "GitHub-Repository-Explainer",
              },
            }
          );

          if (!contentResponse.ok) {
            return {
              path: file.path,
              size: file.size,
              content: "[Unable to retrieve file]",
            };
          }

          const contentData = await contentResponse.json();

          if (!contentData.content) {
            return {
              path: file.path,
              size: file.size,
              content: "[No text content available]",
            };
          }

          const content = Buffer.from(
            contentData.content,
            "base64"
          ).toString("utf-8");

          return {
            path: file.path,
            size: file.size,
            content,
          };
        } catch {
          return {
            path: file.path,
            size: file.size,
            content: "[Error reading file]",
          };
        }
      })
    );

    // 9. Return repository information + files + source code
    return NextResponse.json({
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      url: repoData.html_url,
      defaultBranch: repoData.default_branch,

      files: allFiles,

      sourceFiles: filesWithContent,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}