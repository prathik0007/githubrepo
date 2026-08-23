type RepositoryFile = {
  path: string;
  content?: string;
};

export function detectTechnologies(
  files: RepositoryFile[]
): string[] {
  const technologies = new Set<string>();

  for (const file of files) {
    const path = file.path.toLowerCase();

    if (path.endsWith(".html") || path.endsWith(".htm")) {
      technologies.add("HTML");
    }
    if (path.endsWith(".css")) {
      technologies.add("CSS");
    }
    if (
      path.endsWith(".js") ||
      path.endsWith(".jsx") ||
      path.endsWith(".mjs") ||
      path.endsWith(".cjs")
    ) {
      technologies.add("JavaScript");
    }
    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      technologies.add("TypeScript");
    }
    if (path.endsWith(".py")) {
      technologies.add("Python");
    }
    if (path.endsWith(".java")) {
      technologies.add("Java");
    }
    if (path.endsWith(".rb")) {
      technologies.add("Ruby");
    }
    if (path.endsWith(".php")) {
      technologies.add("PHP");
    }
    if (path.endsWith(".sql")) {
      technologies.add("SQL");
    }
    if (path.endsWith(".json")) {
      technologies.add("JSON");
    }
    if (path.endsWith(".yml") || path.endsWith(".yaml")) {
      technologies.add("YAML");
    }
    if (path.endsWith("dockerfile") || path.endsWith(".dockerfile")) {
      technologies.add("Docker");
    }
  }

  const packageFile = files.find(
    (file) =>
      (file.path.toLowerCase() === "package.json" ||
        file.path.toLowerCase().endsWith("/package.json")) &&
      file.content
  );

  if (packageFile?.content) {
    try {
      const packageJson = JSON.parse(packageFile.content);
      const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      if (dependencies.react || dependencies["react-dom"]) {
        technologies.add("React");
      }
      if (dependencies.next) {
        technologies.add("Next.js");
      }
      if (dependencies.express) {
        technologies.add("Express.js");
      }
      if (dependencies["@types/node"] || packageJson.engines?.node) {
        technologies.add("Node.js");
      }
      if (dependencies["react-router-dom"]) {
        technologies.add("React Router");
      }
      if (dependencies.mongoose) {
        technologies.add("MongoDB");
      }
      if (dependencies.sequelize) {
        technologies.add("Sequelize");
      }
      if (dependencies["mysql2"]) {
        technologies.add("MySQL");
      }
      if (dependencies.pg) {
        technologies.add("PostgreSQL");
      }
      if (dependencies.tailwindcss) {
        technologies.add("Tailwind CSS");
      }
      if (dependencies.bootstrap) {
        technologies.add("Bootstrap");
      }
    } catch {
      console.warn("Could not parse package.json");
    }
  }

  return Array.from(technologies);
}
