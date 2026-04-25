import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
	// Stores the GitHub repository URL entered by the user
	const [repoUrl, setRepoUrl] = useState("");

	// Stores the latest analysis result returned from the backend
	const [result, setResult] = useState(null);

	// Stores previous analyses from MongoDB
	const [history, setHistory] = useState([]);

	// Tracks loading state while the backend analyzes a repository
	const [loading, setLoading] = useState(false);

	// Used to scroll smoothly to the result section
	const resultRef = useRef(null);

	// Fetch previous analyses from the backend
	const loadHistory = async () => {
		try {
			const response = await axios.get("https://ai-devops-deployment-assistant.onrender.com/api/analyses");
			setHistory(response.data);
		} catch (error) {
			console.error("History loading error:", error);
		}
	};

	// Analyze a GitHub repository
	const analyzeRepo = async () => {
		if (!repoUrl.trim()) {
			alert("Please enter a GitHub repository URL");
			return;
		}

		try {
			setLoading(true);

			const response = await axios.post("https://ai-devops-deployment-assistant.onrender.com/api/analyze", {
				repoUrl,
			});

			setResult(response.data);
			setRepoUrl("");
			loadHistory();

			setTimeout(() => {
				resultRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		} catch (error) {
			console.error("Analysis error:", error);

			if (error.response) {
				alert(error.response.data.message);
			} else if (error.request) {
				alert("Backend server is not responding.");
			} else {
				alert("Unexpected error occurred.");
			}
		} finally {
			setLoading(false);
		}
	};

	// Copy generated output to clipboard
	const copyText = (text) => {
		navigator.clipboard.writeText(text || "");
		alert("Copied to clipboard");
	};

	// Load previous analyses when the page first opens
	useEffect(() => {
		loadHistory();
	}, []);

	// When a history item is clicked, display it as the active result
	const handleHistoryClick = (item) => {
		setResult(item);

		setTimeout(() => {
			resultRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	};

	const downloadPackage = async () => {
		try {
			const response = await axios.post(
				"https://ai-devops-deployment-assistant.onrender.com/api/download",
				result,
				{ responseType: "blob" },
			);

			const url = window.URL.createObjectURL(new Blob([response.data]));

			const link = document.createElement("a");

			link.href = url;

			link.setAttribute("download", "devops-package.zip");

			document.body.appendChild(link);

			link.click();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div style={styles.page}>
			<div style={styles.container}>
				<h1 style={styles.title}>AI DevOps Deployment Assistant</h1>

				<p style={styles.subtitle}>
					Analyze GitHub repositories and generate DevOps deployment
					recommendations.
				</p>

				{/* Search/Input Section */}
				<div style={styles.searchBox}>
					<input
						type="text"
						placeholder="Enter GitHub repo URL"
						value={repoUrl}
						onChange={(e) => setRepoUrl(e.target.value)}
						style={styles.input}
					/>

					<button
						onClick={analyzeRepo}
						style={styles.button}
						disabled={loading}
					>
						{loading ? "Analyzing..." : "Analyze"}
					</button>
				</div>

				{/* Analysis Result Section */}
				{result && (
					<div ref={resultRef} style={styles.card}>
						<h2>Analysis Result</h2>

						<h3>Detected Stack</h3>

						<div style={styles.badgeContainer}>
							{result.detectedStack?.map((stack, index) => (
								<span key={index} style={styles.badge}>
									{stack}
								</span>
							))}
						</div>

						<CodeSection
							title="Dockerfile"
							content={result.dockerfile || "No Dockerfile generated."}
							copyText={copyText}
						/>

						<CodeSection
							title="Kubernetes YAML"
							content={result.kubernetesYaml || "No Kubernetes YAML generated."}
							copyText={copyText}
						/>

						<CodeSection
							title="Terraform Infrastructure"
							content={
								result.terraform || "No Terraform infrastructure generated."
							}
							copyText={copyText}
						/>

						<CodeSection
							title="Deployment Instructions"
							content={
								result.deploymentInstructions ||
								"No deployment instructions generated."
							}
							copyText={copyText}
						/>

						<CodeSection
							title="CI Workflow"
							content={result.workflow || "No CI workflow generated."}
							copyText={copyText}
						/>

						<h3>Deployment Suggestion</h3>
						<p>
							{result.deploymentSuggestion ||
								"No deployment suggestion available."}
						</p>

						<CodeSection
							title="AI DevOps Recommendation"
							content={
								result.aiRecommendation || "AI recommendation unavailable."
							}
							copyText={copyText}
						/>

						<button
							onClick={downloadPackage}
							style={{
								marginTop: "20px",
								padding: "12px 20px",
								background: "#2563eb",
								color: "white",
								border: "none",
								borderRadius: "6px",
								cursor: "pointer",
							}}
						>
							Download DevOps Package
						</button>
					</div>
				)}

				{/* History Section */}
				<div style={styles.card}>
					<h2>Previous Analyses</h2>

					{history.length === 0 && <p>No previous analyses yet.</p>}

					{history.map((item) => (
						<div
							key={item._id}
							style={styles.historyItem}
							onClick={() => handleHistoryClick(item)}
						>
							<strong style={styles.historyLink}>{item.repoUrl}</strong>

							<div style={styles.badgeContainer}>
								{item.detectedStack?.map((stack, index) => (
									<span key={index} style={styles.badge}>
										{stack}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// Reusable component for displaying generated code sections
function CodeSection({ title, content, copyText }) {
	return (
		<>
			<div style={styles.sectionHeader}>
				<h3>{title}</h3>

				<button onClick={() => copyText(content)} style={styles.copyButton}>
					Copy
				</button>
			</div>

			<pre style={styles.codeBlock}>{content}</pre>
		</>
	);
}

const styles = {
  page: {
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1100px",
    margin: "auto",
  },

  title: {
    textAlign: "center",
    fontSize: "44px",
    marginBottom: "8px",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    color: "#4b5563",
    marginBottom: "35px",
    fontSize: "17px",
  },

  searchBox: {
    display: "flex",
    gap: "12px",
    marginBottom: "30px",
    background: "#ffffff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },

  input: {
    flex: 1,
    padding: "14px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
  },

  button: {
    padding: "14px 22px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    hover: "#1d4ed8",
  },

  card: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "14px",
    marginBottom: "28px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },

  badgeContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  badge: {
    background: "#dbeafe",
    color: "#1e40af",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "600",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
  },

  copyButton: {
    padding: "7px 14px",
    cursor: "pointer",
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
  },

  codeBlock: {
    background: "#0f172a",
    color: "#f8fafc",
    padding: "18px",
    borderRadius: "10px",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  historyItem: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "16px",
    marginTop: "16px",
    cursor: "pointer",
    transition: "0.2s ease",
  },

  historyLink: {
    cursor: "pointer",
    color: "#1f2937",
    fontWeight: "bold",
  },
};

export default App;
