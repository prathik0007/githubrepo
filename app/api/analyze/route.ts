import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/app/lib/openai";

export async function POST(request: NextRequest) {
  let body: any = {};

  try {
    body = await request.json();

    const question = body.question;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    const response = await openai.responses.create({
      model: "gpt-5.6",
      input: question,
    });

    return NextResponse.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "AI request failed";

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? ((error as { status: number }).status)
        : undefined;

    // Dev fallback for exhausted API credits/rate limits.
    if (
      status === 429 ||
      message.includes("429") ||
      message.toLowerCase().includes("no credits remaining")
    ) {
      const repository = body.repository;
      const name = repository?.name || "Unknown repository";
      const description =
        repository?.description || "No description available.";
      const language = repository?.language || "Unknown";
      const files =
        repository?.files
          ?.slice(0, 15)
          ?.map((file: { path: string }) => file.path) || [];

      const importantFiles = files
        .filter((file: string) => {
          const name = file.toLowerCase();
          return (
            name.includes("readme") ||
            name.includes("app.") ||
            name.includes("main.") ||
            name.includes("index.") ||
            name.includes("model") ||
            name.includes("requirements") ||
            name.includes("package.json")
          );
        })
        .slice(0, 8);

      const answer = `Repository Overview
${name} is a software project${
        description !== "No description available."
          ? ` described as "${description}"`
          : ""
      }.

Primary Language:
${language}

Technologies and Project Structure
The repository contains ${files.length} detected files. The project appears to use ${language} as its primary language.

Important Files
${
  importantFiles.length > 0
    ? importantFiles.map((file: string) => `• ${file}`).join("\n")
    : "• No obvious entry-point files were detected."
}

Architecture
The repository can be understood by starting with its documentation and main application files. The main application or entry-point files should be examined first to understand how user input flows through the system.

Start Here Guide
1. Read README.md if available.
2. Identify the main application or entry-point file.
3. Examine the important backend or business-logic files.
4. Examine the frontend/templates if the project has a user interface.
5. Check the dependency/configuration files to understand the technologies used.

Note:
This is a demo analysis generated locally because the OpenAI API is currently unavailable.`;

      return NextResponse.json({
        answer,
        fallback: true,
        reason: "OpenAI credits or rate limit reached",
      });
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
