import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/app/lib/openai";

function getFilePurpose(file: string) {
  const name = file.toLowerCase();

  if (name.includes("readme")) {
    return "Project documentation and instructions.";
  }
  if (name === "app.py" || name === "main.py") {
    return "Likely application entry point.";
  }
  if (name.includes("model")) {
    return "Likely contains model or business logic.";
  }
  if (name.includes("predict")) {
    return "Likely contains prediction-related logic.";
  }
  if (name.includes("requirement")) {
    return "Lists Python project dependencies.";
  }
  if (name.includes("package.json")) {
    return "Contains JavaScript project dependencies and scripts.";
  }
  if (name.endsWith(".html")) {
    return "Frontend/user-interface markup.";
  }
  if (name.endsWith(".css")) {
    return "Styles the application's user interface.";
  }
  if (
    name.endsWith(".js") ||
    name.endsWith(".jsx") ||
    name.endsWith(".ts") ||
    name.endsWith(".tsx")
  ) {
    return "JavaScript/TypeScript application logic or UI code.";
  }

  return "Source file that may contain application logic.";
}

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

      const technologies = [
        language !== "Unknown" ? language : null,
      ].filter(Boolean);

      const importantFileObjects = importantFiles.map((file: string) => ({
        file,
        purpose: getFilePurpose(file),
      }));

      const analysis = {
        overview: `${name} is a software project${
          description !== "No description available."
            ? ` described as "${description}"`
            : ""
        }. The repository contains ${files.length} detected files.`,
        technologies,
        importantFiles: importantFileObjects,
        architecture:
          "The application can be understood by following its main entry point, business logic, and user interface components.",
        onboardingGuide: [
          "Read README.md to understand the project purpose.",
          "Find and open the main application or entry-point file.",
          "Examine the main business logic and processing files.",
          "Explore the frontend or templates if the project has a user interface.",
          "Review dependency and configuration files to understand the technologies used.",
        ],
      };

      return NextResponse.json({
        analysis,
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
