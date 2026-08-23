import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/app/lib/openai";

function detectProjectType(files: string[]) {
  const lowerFiles = files.map((file) => file.toLowerCase());

  if (
    lowerFiles.some((file) => file.endsWith("gemfile")) ||
    lowerFiles.some((file) => file.endsWith(".ruby-version")) ||
    lowerFiles.some((file) => file.includes("config/application.rb"))
  ) {
    return "ruby";
  }

  if (
    lowerFiles.some((file) => file.endsWith("manage.py")) ||
    lowerFiles.some((file) => file.includes("django"))
  ) {
    return "django";
  }

  if (
    lowerFiles.some((file) => file.includes("pom.xml")) ||
    lowerFiles.some((file) => file.includes("spring"))
  ) {
    return "spring";
  }

  if (
    lowerFiles.some((file) => file.endsWith("package.json")) &&
    lowerFiles.some(
      (file) =>
        file.endsWith(".jsx") ||
        file.endsWith(".tsx") ||
        file.includes("react")
    )
  ) {
    return "react";
  }

  if (
    lowerFiles.some((file) => file.endsWith("requirements.txt")) ||
    lowerFiles.some((file) => file.endsWith(".py"))
  ) {
    return "python";
  }

  return "generic";
}

function createArchitecture(projectType: string) {
  if (projectType === "ruby") {
    return {
      description:
        "The repository appears to be a Ruby-based application, potentially using the Rails framework.",
      nodes: [
        {
          id: "user",
          position: { x: 250, y: 0 },
          data: { label: "👤 User" },
          type: "default",
        },
        {
          id: "routes",
          position: { x: 250, y: 120 },
          data: { label: "🛣️ Rails Routes" },
          type: "default",
        },
        {
          id: "controller",
          position: { x: 250, y: 240 },
          data: { label: "🎮 Controller" },
          type: "default",
        },
        {
          id: "model",
          position: { x: 100, y: 360 },
          data: { label: "🧠 Model / Business Logic" },
          type: "default",
        },
        {
          id: "database",
          position: { x: 100, y: 480 },
          data: { label: "🗄️ Database" },
          type: "default",
        },
        {
          id: "view",
          position: { x: 400, y: 360 },
          data: { label: "🖥️ View" },
          type: "default",
        },
      ],
      edges: [
        { id: "user-routes", source: "user", target: "routes" },
        { id: "routes-controller", source: "routes", target: "controller" },
        { id: "controller-model", source: "controller", target: "model" },
        { id: "model-database", source: "model", target: "database" },
        { id: "controller-view", source: "controller", target: "view" },
      ],
    };
  }

  if (projectType === "python") {
    return {
      description: "The repository appears to be a Python-based application.",
      nodes: [
        {
          id: "user",
          position: { x: 250, y: 0 },
          data: { label: "👤 User" },
          type: "default",
        },
        {
          id: "application",
          position: { x: 250, y: 120 },
          data: { label: "🐍 Python Application" },
          type: "default",
        },
        {
          id: "logic",
          position: { x: 250, y: 240 },
          data: { label: "🧠 Application / ML Logic" },
          type: "default",
        },
        {
          id: "result",
          position: { x: 250, y: 360 },
          data: { label: "📊 Result" },
          type: "default",
        },
      ],
      edges: [
        { id: "user-application", source: "user", target: "application" },
        { id: "application-logic", source: "application", target: "logic" },
        { id: "logic-result", source: "logic", target: "result" },
      ],
    };
  }

  if (projectType === "react") {
    return {
      description:
        "The repository appears to contain a React-based frontend application.",
      nodes: [
        {
          id: "user",
          position: { x: 250, y: 0 },
          data: { label: "👤 User" },
          type: "default",
        },
        {
          id: "frontend",
          position: { x: 250, y: 120 },
          data: { label: "⚛️ React Frontend" },
          type: "default",
        },
        {
          id: "logic",
          position: { x: 250, y: 240 },
          data: { label: "🧠 Application Logic" },
          type: "default",
        },
        {
          id: "result",
          position: { x: 250, y: 360 },
          data: { label: "📊 Result" },
          type: "default",
        },
      ],
      edges: [
        { id: "user-frontend", source: "user", target: "frontend" },
        { id: "frontend-logic", source: "frontend", target: "logic" },
        { id: "logic-result", source: "logic", target: "result" },
      ],
    };
  }

  return {
    description:
      "A high-level architecture inferred from the repository structure.",
    nodes: [
      {
        id: "user",
        position: { x: 250, y: 0 },
        data: { label: "👤 User" },
        type: "default",
      },
      {
        id: "application",
        position: { x: 250, y: 120 },
        data: { label: "⚙️ Application" },
        type: "default",
      },
      {
        id: "logic",
        position: { x: 250, y: 240 },
        data: { label: "🧠 Application Logic" },
        type: "default",
      },
      {
        id: "result",
        position: { x: 250, y: 360 },
        data: { label: "📊 Result" },
        type: "default",
      },
    ],
    edges: [
      { id: "user-application", source: "user", target: "application" },
      { id: "application-logic", source: "application", target: "logic" },
      { id: "logic-result", source: "logic", target: "result" },
    ],
  };
}

function createOnboardingGuide(files: string[]) {
  const guide: {
    file: string;
    title: string;
    description: string;
  }[] = [];

  const readme = files.find((file) =>
    file.toLowerCase().endsWith("readme.md")
  );

  const entryPoint = files.find((file) => {
    const lowerFile = file.toLowerCase();
    const name = lowerFile.split("/").pop() || "";

    return [
      // Python
      "app.py",
      "main.py",
      "server.py",

      // JavaScript / Node
      "index.js",
      "server.js",
      "app.js",
      "main.js",

      // TypeScript / React
      "index.ts",
      "main.ts",
      "app.tsx",
      "page.tsx",

      // Ruby / Rails
      "application.rb",
      "environment.rb",
      "routes.rb",

      // Java / Spring
      "application.java",
      "application.kt",

      // Generic
      "main.go",
      "main.rs",
    ].includes(name) ||
      lowerFile === "config/application.rb" ||
      lowerFile === "config/environment.rb" ||
      lowerFile === "config/routes.rb";
  });

  const modelFile = files.find((file) => {
    const name = file.toLowerCase();

    return (
      name.includes("model") ||
      name.includes("predict") ||
      name.includes("train")
    );
  });

  const dependencyFile = files.find((file) => {
    const name = file.toLowerCase();

    return (
      name.endsWith("requirements.txt") ||
      name.endsWith("package.json") ||
      name.endsWith("pom.xml") ||
      name.endsWith("gemfile")
    );
  });

  if (readme) {
    guide.push({
      file: readme,
      title: "Understand the project",
      description:
        "Start with the README to understand the project's purpose, setup, and usage.",
    });
  }

  if (entryPoint) {
    guide.push({
      file: entryPoint,
      title: "Find the application entry point",
      description:
        "This is one of the main files responsible for starting or handling the application.",
    });
  }

  if (modelFile) {
    guide.push({
      file: modelFile,
      title: "Understand the core logic",
      description:
        "This file appears to contain model, prediction, training, or core application logic.",
    });
  }

  if (dependencyFile) {
    guide.push({
      file: dependencyFile,
      title: "Understand dependencies",
      description:
        "Check this file to see which libraries and frameworks the project uses.",
    });
  }

  return guide;
}

function getFilePurpose(file: string) {
  const name = file.toLowerCase();

  if (name.includes("readme")) {
    return "Project documentation and instructions.";
  }
  if (name === "app.py" || name === "main.py") {
    return "Likely application entry point.";
  }
  if (name.includes("predict")) {
    return "Likely contains prediction-related logic.";
  }
  if (name.includes("requirement")) {
    return "Lists Python project dependencies.";
  }
  if (name.endsWith("gemfile")) {
    return "Lists Ruby project dependencies and required gems.";
  }
  if (name.includes("config/application.rb")) {
    return "Main Rails application configuration.";
  }
  if (name.includes("config/routes.rb")) {
    return "Defines the application's Rails routes.";
  }
  if (name.includes("config/environment.rb")) {
    return "Configures the Rails runtime environment.";
  }
  if (name.includes("controllers/") || name.includes("controller")) {
    return "Handles incoming requests and coordinates application responses.";
  }
  if (name.includes("models/") || name.includes("model")) {
    return "Contains application models and business logic.";
  }
  if (name.includes("views/") || name.includes("view")) {
    return "Renders the application's user-facing views.";
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
      const file = body.file;

      if (file) {
        const fileName = file.path.toLowerCase();

        let purpose =
          "This file appears to contain application source code.";

        if (fileName.includes("controller")) {
          purpose =
            "This file appears to handle incoming requests and coordinate application actions.";
        } else if (fileName.includes("model")) {
          purpose =
            "This file appears to define application data models and business rules.";
        } else if (fileName.includes("route")) {
          purpose =
            "This file appears to define application routes and map requests to controllers or handlers.";
        } else if (fileName.includes("gemfile")) {
          purpose = "This file defines the Ruby dependencies used by the project.";
        } else if (fileName.includes("application.rb")) {
          purpose =
            "This file contains the main Rails application configuration.";
        } else if (fileName.includes("readme")) {
          purpose =
            "This file documents the project and usually explains its purpose, setup, and usage.";
        }

        return NextResponse.json({
          answer: `File: ${file.path}

Purpose:
${purpose}

What to look for:
• Identify the main class, functions, or methods.
• Check what other files or libraries this file uses.
• Look at the inputs it receives and the outputs it produces.
• Determine how this file fits into the overall application.

Beginner tip:
Start by identifying the main class or function in this file, then follow the methods it calls to understand the execution flow.`,
          fallback: true,
          reason: "OpenAI credits or rate limit reached",
        });
      }

      const repository = body.repository;
      const name = repository?.name || "Unknown repository";
      const description =
        repository?.description || "No description available.";
      const language = repository?.language || "Unknown";
      const files =
        repository?.files
          ?.slice(0, 15)
          ?.map((file: { path: string }) => file.path) || [];
      const projectType = detectProjectType(files);

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
            name.includes("package.json") ||
            name.includes("gemfile") ||
            name.includes("config/application.rb") ||
            name.includes("config/routes.rb") ||
            name.includes("config/environment.rb") ||
            name.includes("controller") ||
            name.includes("models/") ||
            name.includes("views/")
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
      const architecture = createArchitecture(projectType);

      const analysis = {
        overview: `${name} is a software project${
          description !== "No description available."
            ? ` described as "${description}"`
            : ""
        }. The repository contains ${files.length} detected files.`,
        technologies,
        importantFiles: importantFileObjects,
        architecture,
        onboardingGuide: createOnboardingGuide(files),
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
