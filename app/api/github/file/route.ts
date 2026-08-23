import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const path = searchParams.get("path");
    const branch = searchParams.get("branch") || "main";

    if (!owner || !repo || !path) {
      return NextResponse.json(
        {
          error: "owner, repo and path are required",
        },
        { status: 400 }
      );
    }

    const encodedPath = path
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const url =
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}` +
      `?ref=${encodeURIComponent(branch)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      return NextResponse.json(
        {
          error:
            errorData?.message ||
            `GitHub API returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.type !== "file") {
      return NextResponse.json(
        {
          error: "The selected path is not a file.",
        },
        { status: 400 }
      );
    }

    if (data.encoding !== "base64" || !data.content) {
      return NextResponse.json(
        {
          error:
            "GitHub did not return readable file content.",
        },
        { status: 400 }
      );
    }

    const content = Buffer.from(
      data.content.replace(/\n/g, ""),
      "base64"
    ).toString("utf-8");

    return NextResponse.json({
      path: data.path,
      content,
      size: data.size,
      sha: data.sha,
      htmlUrl: data.html_url,
    });
  } catch (error) {
    console.error("GitHub file error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch repository file.",
      },
      { status: 500 }
    );
  }
}
