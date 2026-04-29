import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Layout from "./Layout";

const API_BASE_URL = "https://ai-devops-deployment-assistant.onrender.com/api";

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.toggle("dark", mediaQuery.matches);
      }
    };

    applyTheme();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyses`);
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("History loading error:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const scrollToResult = () => {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const analyzeRepo = async () => {
    const cleanUrl = repoUrl.trim();

    if (!cleanUrl) {
      alert("Please enter a GitHub repository URL.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/analyze`, { repoUrl: cleanUrl });
      setResult(response.data);
      setRepoUrl("");
      await loadHistory();
      scrollToResult();
    } catch (error) {
      console.error("Analysis error:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          (error.request ? "Backend server is not responding." : "Unexpected error occurred."),
      );
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      alert("Copied to clipboard.");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Unable to copy text.");
    }
  };

  const handleHistoryClick = (item) => {
    setResult(item);
    scrollToResult();
  };

  const downloadPackage = async () => {
    if (!result) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/download`, result, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "devops-package.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Unable to download the DevOps package.");
    }
  };

  return (
    <Layout theme={theme} setTheme={setTheme}>
      <section className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--accent-bg)] to-transparent px-6 py-16 text-center animate-fadeInSlow">
        <h1 className="mb-4 text-4xl font-semibold text-[var(--text-h)]">
          AI DevOps Deployment Assistant
        </h1>
        <p className="mx-auto max-w-2xl text-lg opacity-90">
          Analyze any GitHub repository and instantly generate deployment recommendations,
          Dockerfiles, CI/CD pipelines, and cloud-ready configs.
        </p>
      </section>

      <section className="mt-10 space-y-12">
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm dark:bg-[var(--bg)] animate-fadeIn">
          <label htmlFor="repo-url" className="mb-2 block text-sm font-medium text-[var(--text-h)]">
            Enter GitHub Repo URL
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="repo-url"
              type="url"
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") analyzeRepo();
              }}
              className="flex-1 rounded-lg border border-[var(--border)] bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] dark:bg-[var(--bg)]"
            />

            <button
              type="button"
              onClick={analyzeRepo}
              disabled={loading}
              className="rounded-lg bg-[var(--accent)] px-6 py-2 font-medium text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {result && (
          <div
            ref={resultRef}
            className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm dark:bg-[var(--bg)] space-y-6 animate-pop"
          >
            <h2 className="text-2xl font-semibold text-[var(--text-h)]">Analysis Result</h2>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--text-h)]">Detected Stack</h3>
              <div className="flex flex-wrap gap-2">
                {result.detectedStack?.length ? (
                  result.detectedStack.map((stack, index) => (
                    <span
                      key={`${stack}-${index}`}
                      className="rounded-full bg-[var(--accent-bg)] px-3 py-1 text-sm font-medium text-[var(--accent)]"
                    >
                      {stack}
                    </span>
                  ))
                ) : (
                  <p>No stack detected.</p>
                )}
              </div>
            </div>

            <CodeSection title="Dockerfile" content={result.dockerfile} copyText={copyText} />
            <CodeSection title="Kubernetes YAML" content={result.kubernetesYaml} copyText={copyText} />
            <CodeSection title="Terraform Infrastructure" content={result.terraform} copyText={copyText} />
            <CodeSection title="Deployment Instructions" content={result.deploymentInstructions} copyText={copyText} />
            <CodeSection title="CI Workflow" content={result.workflow} copyText={copyText} />

            <div>
              <h3 className="mb-1 text-lg font-semibold text-[var(--text-h)]">Deployment Suggestion</h3>
              <p>{result.deploymentSuggestion || "No deployment suggestion available."}</p>
            </div>

            <CodeSection title="AI DevOps Recommendation" content={result.aiRecommendation} copyText={copyText} />

            <button
              type="button"
              onClick={downloadPackage}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow transition hover:bg-blue-700"
            >
              Download DevOps Package
            </button>
          </div>
        )}

        <div id="history" className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm dark:bg-[var(--bg)]">
          <h2 className="mb-4 text-2xl font-semibold text-[var(--text-h)]">Previous Analyses</h2>

          {history.length === 0 ? (
            <p>No previous analyses yet.</p>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <button
                  type="button"
                  key={item._id || `${item.repoUrl}-${index}`}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full rounded border-t border-[var(--border)] p-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800 animate-fadeIn"
                >
                  <strong className="text-[var(--text-h)]">{item.repoUrl || "Untitled repository"}</strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.detectedStack?.map((stack, stackIndex) => (
                      <span
                        key={`${stack}-${stackIndex}`}
                        className="rounded-full bg-[var(--accent-bg)] px-3 py-1 text-sm font-medium text-[var(--accent)]"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function CodeSection({ title, content, copyText }) {
  const safeContent = content || "No content available.";

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-[var(--text-h)]">{title}</h3>
        <button
          type="button"
          onClick={() => copyText(safeContent)}
          className="rounded border border-[var(--border)] px-3 py-1 text-sm transition hover:bg-[var(--accent-bg)]"
        >
          Copy
        </button>
      </div>
      <pre className="max-h-96 overflow-auto rounded-lg bg-[var(--code-bg)] p-4 text-left text-sm leading-relaxed text-[var(--text-h)]">
        <code>{safeContent}</code>
      </pre>
    </section>
  );
}
