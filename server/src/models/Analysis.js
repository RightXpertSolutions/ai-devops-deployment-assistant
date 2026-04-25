import mongoose from "mongoose";

/**
 * Analysis Schema
 * Stores the result of each GitHub repository analysis.
 *
 * Each document contains:
 * - repoUrl: GitHub repository URL submitted by the user
 * - detectedStack: technologies detected from the repository
 * - dockerfile: generated Dockerfile recommendation
 * - workflow: generated GitHub Actions CI workflow
 * - kubernetesYaml: generated Kubernetes deployment/service YAML
 * - deploymentInstructions: step-by-step commands to deploy the application
 * - deploymentSuggestion: high-level recommendation on where to deploy
 */

const analysisSchema = new mongoose.Schema(
  {
    repoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    detectedStack: {
      type: [String],
      default: [],
    },

    dockerfile: {
      type: String,
      default: "",
    },

    workflow: {
      type: String,
      default: "",
    },

    kubernetesYaml: {
      type: String,
      default: "",
    },

    terraform: {
        type: String,
        default: ""
    },

    aiRecommendation: {
       type: String,
    default: "",
},

    // Commands developers can run to deploy the application
    deploymentInstructions: {
      type: String,
      default: "",
    },

    deploymentSuggestion: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;