import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

/**
 * Generates AI-powered DevOps recommendations.
 */
export async function generateAiRecommendation({
  repoUrl,
  detectedStack,
  dockerfile,
  workflow,
  kubernetesYaml,
}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "AI recommendation unavailable because the OpenAI API key is missing.";
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
You are a DevOps advisor.

Analyze this repository deployment setup and give a concise professional recommendation.

Repository: ${repoUrl}
Detected Stack: ${detectedStack.join(", ")}

Dockerfile:
${dockerfile}

CI Workflow:
${workflow}

Kubernetes YAML:
${kubernetesYaml}

Return:
1. Best deployment option
2. Security considerations
3. Scaling recommendation
4. One improvement suggestion
`,
});

console.log("AI RESPONSE:", response.output_text);


    return response.output_text;
  } catch (error) {
    console.error("AI recommendation error:", error.message);
    return "AI recommendation is currently unavailable.";
  }
}