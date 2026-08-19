import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const url = body.url;

    if (!url) {
      return NextResponse.json(
        { error: "GitHub repository URL is required" },
        { status: 400 }
      );
    }

    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== "github.com") {
      return NextResponse.json(
        { error: "Please provide a valid GitHub URL" },
        { status: 400 }
      );
    }

    const parts = parsedUrl.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const owner = parts[0];
    const repo = parts[1].replace(".git", "");

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      forks: data.forks_count,
      url: data.html_url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}