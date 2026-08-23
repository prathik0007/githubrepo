export function detectTechnologies(
  files: { path: string }[]
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

  return Array.from(technologies);
}
