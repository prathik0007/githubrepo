type RepositoryFile = {
  path: string;
  content?: string;
};

function getFileName(path: string): string {
  return path.toLowerCase().split("/").pop() || "";
}

export function detectTechnologies(
  files: RepositoryFile[]
): string[] {
  const technologies = new Set<string>();
  const add = (technology: string) => technologies.add(technology);

  for (const file of files) {
    const path = file.path.toLowerCase();
    const fileName = getFileName(path);

    if (path.endsWith(".html") || path.endsWith(".htm")) add("HTML");
    if (path.endsWith(".css")) add("CSS");
    if (
      path.endsWith(".js") ||
      path.endsWith(".jsx") ||
      path.endsWith(".mjs") ||
      path.endsWith(".cjs")
    ) {
      add("JavaScript");
    }
    if (path.endsWith(".ts") || path.endsWith(".tsx")) add("TypeScript");
    if (path.endsWith(".py")) add("Python");
    if (path.endsWith(".java")) add("Java");
    if (path.endsWith(".rb")) add("Ruby");
    if (path.endsWith(".php")) add("PHP");
    if (path.endsWith(".c")) add("C");
    if (
      path.endsWith(".cpp") ||
      path.endsWith(".cc") ||
      path.endsWith(".cxx")
    ) {
      add("C++");
    }
    if (path.endsWith(".cs")) add("C#");
    if (path.endsWith(".go")) add("Go");
    if (path.endsWith(".rs")) add("Rust");
    if (path.endsWith(".sql")) add("SQL");
    if (path.endsWith(".json")) add("JSON");
    if (path.endsWith(".yml") || path.endsWith(".yaml")) add("YAML");
    if (fileName === "dockerfile" || fileName.endsWith(".dockerfile")) {
      add("Docker");
    }

    if (fileName === "gemfile") {
      add("Ruby");
      add("Rails");
    }
    if (
      fileName === "requirements.txt" ||
      fileName === "pyproject.toml" ||
      fileName === "pipfile"
    ) {
      add("Python");
    }
    if (fileName === "pom.xml") {
      add("Java");
      add("Maven");
    }
    if (fileName === "composer.json") {
      add("PHP");
      add("Composer");
    }

    const content = file.content?.toLowerCase() || "";

    if (
      path.endsWith(".py") &&
      (content.includes("from flask import") ||
        content.includes("import flask") ||
        content.includes("flask("))
    ) {
      add("Flask");
    }

    if (
      path.endsWith(".py") &&
      (content.includes("django") || content.includes("from django"))
    ) {
      add("Django");
    }

    if (
      path.endsWith(".py") &&
      (content.includes("from fastapi") || content.includes("import fastapi"))
    ) {
      add("FastAPI");
    }

    if (
      content.includes("{{") ||
      content.includes("{%") ||
      content.includes("jinja2")
    ) {
      add("Jinja2");
    }

    if (
      content.includes("tailwindcss") ||
      content.includes("cdn.tailwindcss.com") ||
      content.includes("tailwind.config")
    ) {
      add("Tailwind CSS");
    }

    if (
      content.includes("bootstrap.min.css") ||
      content.includes("bootstrap.min.js") ||
      content.includes("getbootstrap.com")
    ) {
      add("Bootstrap");
    }

    if (
      content.includes('from "react"') ||
      content.includes("from 'react'") ||
      content.includes("reactdom") ||
      content.includes("createroot(")
    ) {
      add("React");
    }

    if (
      content.includes('require("express")') ||
      content.includes("require('express')") ||
      content.includes('from "express"') ||
      content.includes("from 'express'")
    ) {
      add("Express.js");
      add("Node.js");
    }

    if (content.includes("mongoose") || content.includes("mongodb")) {
      add("MongoDB");
    }

    if (
      content.includes("mysql2") ||
      content.includes("mysql.createconnection") ||
      content.includes("mysql.createpool")
    ) {
      add("MySQL");
    }

    if (
      content.includes("pg") &&
      (content.includes("pool") || content.includes("client"))
    ) {
      add("PostgreSQL");
    }
  }

  const packageFile = files.find(
    (file) => getFileName(file.path) === "package.json" && file.content
  );

  if (packageFile?.content) {
    try {
      const packageJson = JSON.parse(packageFile.content);
      const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      if (dependencies.react || dependencies["react-dom"]) add("React");
      if (dependencies.next) {
        add("Next.js");
        add("React");
      }
      if (dependencies.express) {
        add("Express.js");
        add("Node.js");
      }
      if (
        dependencies["@types/node"] ||
        dependencies.node ||
        packageJson.engines?.node
      ) {
        add("Node.js");
      }
      if (dependencies["react-router-dom"]) add("React Router");
      if (dependencies.vue) add("Vue.js");
      if (dependencies["@angular/core"] || dependencies["@angular/cli"]) {
        add("Angular");
      }
      if (dependencies.svelte) add("Svelte");
      if (
        dependencies.mongoose ||
        dependencies.mongodb ||
        dependencies["mongodb-client"]
      ) {
        add("MongoDB");
      }
      if (dependencies.sequelize || dependencies.mysql2) add("MySQL");
      if (dependencies.pg || dependencies.postgres) add("PostgreSQL");
      if (dependencies.sequelize) add("Sequelize");
      if (dependencies.prisma || dependencies["@prisma/client"]) add("Prisma");
      if (dependencies.tailwindcss) add("Tailwind CSS");
      if (dependencies.bootstrap) add("Bootstrap");
      if (
        dependencies["@mui/material"] ||
        dependencies["@material-ui/core"]
      ) {
        add("Material UI");
      }
      if (dependencies.redux || dependencies["@reduxjs/toolkit"]) add("Redux");
      if (dependencies.fastify) {
        add("Fastify");
        add("Node.js");
      }
      if (dependencies.nestjs || dependencies["@nestjs/core"]) {
        add("NestJS");
        add("Node.js");
      }
      if (dependencies.jest) add("Jest");
      if (dependencies.vitest) add("Vitest");
    } catch {
      console.warn("Could not parse package.json");
    }
  }

  const pythonDependencyFile = files.find((file) => {
    const name = getFileName(file.path);
    return (
      name === "requirements.txt" ||
      name === "pyproject.toml" ||
      name === "pipfile"
    );
  });

  if (pythonDependencyFile?.content) {
    const content = pythonDependencyFile.content.toLowerCase();
    if (content.includes("flask")) add("Flask");
    if (content.includes("django")) add("Django");
    if (content.includes("fastapi") || content.includes("uvicorn")) {
      add("FastAPI");
    }
    if (content.includes("pandas")) add("Pandas");
    if (content.includes("numpy")) add("NumPy");
    if (content.includes("tensorflow") || content.includes("keras")) {
      add("TensorFlow");
    }
    if (content.includes("torch")) add("PyTorch");
    if (content.includes("scikit-learn") || content.includes("sklearn")) {
      add("Scikit-learn");
    }
  }

  const gemfile = files.find((file) => getFileName(file.path) === "gemfile");
  if (gemfile?.content) {
    const content = gemfile.content.toLowerCase();
    add("Ruby");
    if (content.includes("rails") || content.includes("railties")) add("Rails");
    if (content.includes("sinatra")) add("Sinatra");
  }

  const pomFile = files.find((file) => getFileName(file.path) === "pom.xml");
  if (pomFile?.content) {
    const content = pomFile.content.toLowerCase();
    add("Java");
    add("Maven");
    if (content.includes("spring-boot") || content.includes("springframework")) {
      add("Spring Boot");
    }
  }

  const priority = [
    "Next.js", "React", "Angular", "Vue.js", "Svelte", "Node.js",
    "Express.js", "NestJS", "Python", "Flask", "Django", "FastAPI",
    "Java", "Spring Boot", "Maven", "Ruby", "Rails", "PHP", "HTML",
    "CSS", "JavaScript", "TypeScript", "Tailwind CSS", "Bootstrap",
    "MongoDB", "MySQL", "PostgreSQL", "Prisma", "Sequelize", "SQL",
    "Docker", "C", "C++", "C#", "Go", "Rust", "JSON", "YAML",
  ];

  return Array.from(technologies).sort((a, b) => {
    const aPriority = priority.indexOf(a);
    const bPriority = priority.indexOf(b);
    return (aPriority === -1 ? 999 : aPriority) -
      (bPriority === -1 ? 999 : bPriority);
  });
}
