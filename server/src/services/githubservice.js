import axios from "axios";
import { Buffer } from "buffer";

/**
 * Extract GitHub repository owner and repository name from a GitHub URL.
 */
export function extractRepoInfo(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);

  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }

  return {
    owner: match[1],
    repo: match[2].replace(".git", ""),
  };
}

/**
 * GitHub API headers.
 * Uses GitHub token if available to avoid rate-limit errors.
 */
function getGitHubHeaders() {
  if (!process.env.GITHUB_TOKEN) {
    return {};
  }

  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };
}

/**
 * Recursively scan repository files.
 * Limits depth to avoid scanning very large repos endlessly.
 */
export async function getAllRepoFiles(repoUrl, path = "", depth = 0) {
  const { owner, repo } = extractRepoInfo(repoUrl);

  if (depth > 2) {
    return [];
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await axios.get(url, {
    headers: getGitHubHeaders(),
  });

  const items = response.data;
  let files = [];

  const ignoredFolders = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    "vendor",
  ];

  for (const item of items) {
    if (item.type === "file") {
      files.push(item.name);
    }

    if (item.type === "dir" && !ignoredFolders.includes(item.name)) {
      try {
        const subFiles = await getAllRepoFiles(repoUrl, item.path, depth + 1);
        files = files.concat(subFiles);
      } catch (error) {
        // Skip folders that cannot be accessed
      }
    }
  }

  return files;
}

/**
 * Fetch and decode package.json from repository root.
 */
export async function getPackageJson(repoUrl) {
  const { owner, repo } = extractRepoInfo(repoUrl);

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;

    const response = await axios.get(url, {
      headers: getGitHubHeaders(),
    });

    const content = Buffer.from(response.data.content, "base64").toString(
      "utf-8"
    );

    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Detect stack from files, package.json, and repository URL.
 */
export async function detectStackFromFiles(files, repoUrl) {
  const fileNames = files.map((file) => file.toLowerCase());
  const detectedStack = [];

  const addStack = (stack) => {
    if (!detectedStack.includes(stack)) {
      detectedStack.push(stack);
    }
  };

  // File-based detection
  if (fileNames.includes("package.json")) {
    addStack("Node.js");
  }

  if (
    fileNames.includes("requirements.txt") ||
    fileNames.includes("pyproject.toml") ||
    fileNames.includes("pipfile") ||
    fileNames.includes("setup.py") ||
    fileNames.includes("poetry.lock")
  ) {
    addStack("Python");
  }

  if (fileNames.includes("dockerfile")) {
    addStack("Docker");
  }

  if (
    fileNames.includes("docker-compose.yml") ||
    fileNames.includes("docker-compose.yaml")
  ) {
    addStack("Docker Compose");
  }

  if (fileNames.includes(".github")) {
    addStack("CI/CD");
  }

  if (fileNames.includes("manage.py")) {
    addStack("Django");
  }

  if (fileNames.includes("pom.xml")) {
    addStack("Java/Spring");
  }

  if (fileNames.includes("go.mod")) {
    addStack("Go");
  }

  if (fileNames.includes("cargo.toml")) {
    addStack("Rust");
  }

  if (fileNames.includes("composer.json")) {
    addStack("PHP");
  }

  // package.json-based detection
  const packageJson = await getPackageJson(repoUrl);

  if (packageJson) {
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    const packageName = (packageJson.name || "").toLowerCase();

    if (packageName.includes("express")) {
      addStack("Express");
    }

    if (packageName.includes("react")) {
      addStack("React");
    }

    if (dependencies.express) {
      addStack("Express");
    }

    if (dependencies.react) {
      addStack("React");
    }

    if (dependencies.next) {
      addStack("Next.js");
    }

    if (dependencies.vite) {
      addStack("Vite");
    }

    if (dependencies.typescript) {
      addStack("TypeScript");
    }

    if (dependencies["@nestjs/core"]) {
      addStack("NestJS");
    }

    if (dependencies.vue) {
      addStack("Vue");
    }

    if (dependencies["@angular/core"]) {
      addStack("Angular");
    }

    if (dependencies.tailwindcss) {
      addStack("Tailwind CSS");
    }
  }

  // URL fallback detection
  const lowerRepoUrl = repoUrl.toLowerCase();

  if (lowerRepoUrl.includes("express")) {
    addStack("Express");
  }

  if (lowerRepoUrl.includes("react")) {
    addStack("React");
  }

  if (lowerRepoUrl.includes("flask")) {
    addStack("Python");
    addStack("Flask");
  }

  if (lowerRepoUrl.includes("django")) {
    addStack("Python");
    addStack("Django");
  }

  if (lowerRepoUrl.includes("next")) {
    addStack("Next.js");
  }

  if (detectedStack.length === 0) {
    addStack("Unknown");
  }

  return detectedStack;
}