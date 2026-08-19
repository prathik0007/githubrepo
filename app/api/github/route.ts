import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Get the URL sent by the frontend
    const body = await request.json();
    const url = body.url;

    if (!url) {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    // 2. Validate the GitHub URL
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== "github.com") {
      return NextResponse.json(
        { error: "Please provide a valid GitHub URL" },
        { status: 400 }
      );
    }

    // 3. Extract owner and repository name
    const parts = parsedUrl.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const owner = parts[0];
    const repo = parts[1].replace(".git", "");

    // 4. Get repository information
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!repoResponse.ok) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: repoResponse.status }
      );
    }

    const repoData = await repoResponse.json();

    // 5. Get the repository file tree
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
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

    // 6. Keep only files, not folders
    const files = treeData.tree
      .filter((item: any) => item.type === "blob")
      .map((item: any) => ({
        path: item.path,
        size: item.size || 0,
      }));

    // 7. Return repository + file information
    return NextResponse.json({
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      url: repoData.html_url,
      defaultBranch: repoData.default_branch,
      files: files,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}