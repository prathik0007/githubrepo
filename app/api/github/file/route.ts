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
        { error: "owner, repo and path are required" },
        { status: 400 }
      );
    }

    const encodedPath = path
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const rawUrl =
      `https://raw.githubusercontent.com/` +
      `${encodeURIComponent(owner)}/` +
      `${encodeURIComponent(repo)}/` +
      `${encodeURIComponent(branch)}/` +
      encodedPath;

    console.log("Fetching GitHub file:", rawUrl);

    const response = await fetch(rawUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "GitHub raw file error:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        {
          error: `GitHub returned ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const content = await response.text();

    console.log("GitHub file status:", response.status);
    console.log("GitHub file content length:", content.length);
    console.log("GitHub file preview:", content.slice(0, 200));

    return NextResponse.json({
      path,
      content,
      size: content.length,
      htmlUrl:
        `https://github.com/${owner}/${repo}/blob/` +
        `${encodeURIComponent(branch)}/` +
        encodedPath,
    });
  } catch (error) {
    console.error("GitHub file error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch repository file.",
      },
      { status: 500 }
    );
  }
}
