import { ArrowRight, Code2, Terminal, Boxes } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-[var(--bg)] text-[var(--text-h)]">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-32">
				{/* Animated Gradient Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/30 via-purple-600/20 to-transparent blur-3xl opacity-60 animate-pulse"></div>

				<div className="relative max-w-5xl mx-auto px-6 text-center">
					<h1 className="text-6xl font-extrabold leading-tight bg-gradient-to-r from-[var(--accent)] to-purple-500 text-transparent bg-clip-text animate-fadeInSlow">
						AI‑Powered DevOps Automation
					</h1>

					<p className="mt-6 text-xl opacity-90 max-w-2xl mx-auto animate-fadeIn">
						Analyze any Github repository and instantly generate Dockerfiles,
						CI/CD pipelines, cloud configs, and deployment recommendations.
					</p>

					<Link
						to="/app"
						className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-xl bg-[var(--accent)] text-white font-semibold shadow hover:opacity-90 transition animate-pop"
					>
						Open App <ArrowRight size={20} />
					</Link>
				</div>
			</section>

			{/* Feature Section */}
			<section className="py-24 border-t border-[var(--border)]">
				<div className="max-w-6xl mx-auto px-6">
					<h2 className="text-3xl font-bold text-center mb-16">
						Why Developers Love This Tool
					</h2>

					<div className="grid md:grid-cols-3 gap-10">
						<FeatureCard
							icon={<Code2 size={32} />}
							title="Repo Analysis"
							desc="Deeply analyze any GitHub repository and extract key DevOps insights."
						/>

						<FeatureCard
							icon={<Terminal size={32} />}
							title="Instant Pipelines"
							desc="Generate Dockerfiles, CI/CD pipelines, and cloud configs in seconds."
						/>

						<FeatureCard
							icon={<Boxes size={32} />}
							title="Deployment Ready"
							desc="Download a complete DevOps package ready for production deployment."
						/>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-24 border-t border-[var(--border)]">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold mb-12">How It Works</h2>

					<div className="space-y-12">
						<Step number="1" text="Enter any GitHub repository URL." />
						<Step
							number="2"
							text="AI analyzes the codebase and architecture."
						/>
						<Step number="3" text="Get a full DevOps package instantly." />
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-10 border-t border-[var(--border)] text-center opacity-70">
				<p>
					© {new Date().getFullYear()} DevOps Assistant. All rights reserved.
				</p>
			</footer>
		</div>
	);
}

function FeatureCard({ icon, title, desc }) {
	return (
		<div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-sm hover:shadow-lg transition hover:-translate-y-1">
			<div className="text-[var(--accent)] mb-4">{icon}</div>
			<h3 className="text-xl font-semibold mb-2">{title}</h3>
			<p className="opacity-80">{desc}</p>
		</div>
	);
}

function Step({ number, text }) {
	return (
		<div className="flex items-center justify-center gap-6 animate-fadeIn">
			<div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xl font-bold shadow">
				{number}
			</div>
			<p className="text-lg">{text}</p>
		</div>
	);
}
