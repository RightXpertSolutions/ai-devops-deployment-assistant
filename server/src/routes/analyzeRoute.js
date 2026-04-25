import express from "express";
import Analysis from "../models/Analysis.js";
import { generateAiRecommendation } from "../services/aiService.js";
import {
  getAllRepoFiles,
  detectStackFromFiles,
} from "../services/githubService.js";

const router = express.Router();

function generateDockerfile(detectedStack) {
  if (detectedStack.includes("React")) {
    return `# Build stage
FROM node:20 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]`;
  }

  if (detectedStack.includes("Express") || detectedStack.includes("Node.js")) {
    return `FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm","start"]`;
  }

  if (detectedStack.includes("Flask")) {
    return `FROM python:3.11

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 5000

CMD ["python","app.py"]`;
  }

  if (detectedStack.includes("Python")) {
    return `FROM python:3.11

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000

CMD ["python","app.py"]`;
  }

  return "No Dockerfile template available for detected stack.";
}

function generateWorkflow() {
  return `name: CI Pipeline
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install`;
}

function generateKubernetesYaml(detectedStack) {
  if (detectedStack.includes("React")) {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: react-app
  template:
    metadata:
      labels:
        app: react-app
    spec:
      containers:
      - name: react-app
        image: react-app:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: react-service
spec:
  type: ClusterIP
  selector:
    app: react-app
  ports:
  - port: 80
    targetPort: 80`;
  }

  if (detectedStack.includes("Express") || detectedStack.includes("Node.js")) {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: node-app
  template:
    metadata:
      labels:
        app: node-app
    spec:
      containers:
      - name: node-app
        image: node-app:latest
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: node-service
spec:
  type: ClusterIP
  selector:
    app: node-app
  ports:
  - port: 80
    targetPort: 3000`;
  }

  if (detectedStack.includes("Flask")) {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: flask-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: flask-app
  template:
    metadata:
      labels:
        app: flask-app
    spec:
      containers:
      - name: flask-app
        image: flask-app:latest
        ports:
        - containerPort: 5000
---
apiVersion: v1
kind: Service
metadata:
  name: flask-service
spec:
  type: ClusterIP
  selector:
    app: flask-app
  ports:
  - port: 80
    targetPort: 5000`;
  }

  return "No Kubernetes template available for detected stack.";
}

function generateTerraform(detectedStack) {
  if (detectedStack.includes("React")) {
    return `provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "react_app" {
  bucket = "react-app-deployment"
}

resource "aws_s3_bucket_website_configuration" "react_site" {
  bucket = aws_s3_bucket.react_app.id

  index_document {
    suffix = "index.html"
  }
}`;
  }

  if (detectedStack.includes("Express") || detectedStack.includes("Node.js")) {
    return `provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "app_cluster" {
  name = "node-app-cluster"
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "node-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name  = "node-app"
      image = "node-app:latest"
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "app_service" {
  name            = "node-app-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.app_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"
}`;
  }

  if (detectedStack.includes("Python")) {
    return `provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "python_cluster" {
  name = "python-app-cluster"
}`;
  }

  return "No Terraform template available for detected stack.";
}

function generateDeploymentInstructions(detectedStack) {
  const stack = detectedStack.join(" ").toLowerCase();

  if (stack.includes("react")) {
    return `docker build -t react-app .
docker run -p 80:80 react-app

kubectl apply -f deployment.yaml`;
  }

  if (stack.includes("node") || stack.includes("express")) {
    return `docker build -t node-app .
docker run -p 3000:3000 node-app

kubectl apply -f deployment.yaml`;
  }

  if (stack.includes("python")) {
    return `docker build -t python-app .
docker run -p 8000:8000 python-app

kubectl apply -f deployment.yaml`;
  }

  return "Deployment instructions not available.";
}

function generateDeploymentSuggestion(detectedStack) {
  if (detectedStack.includes("React")) {
    return "Build the React app, serve it with Nginx, and deploy it on Vercel, Netlify, Docker, or Kubernetes.";
  }

  if (detectedStack.includes("Express") || detectedStack.includes("Node.js")) {
    return "Containerize the Node/Express app with Docker and deploy it on Render, Railway, AWS ECS, or Kubernetes.";
  }

  if (detectedStack.includes("Flask")) {
    return "Containerize the Flask app with Docker, expose port 5000, and deploy it on Render, Railway, AWS ECS, or Kubernetes.";
  }

  if (detectedStack.includes("Python")) {
    return "Containerize the Python app with Docker and deploy it on Render, Railway, AWS, or Kubernetes.";
  }

  return "Review the repository structure and create a custom deployment plan based on the application framework.";
}

router.post("/analyze", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        message: "Repository URL is required",
      });
    }

    const files = await getAllRepoFiles(repoUrl);
    const detectedStack = await detectStackFromFiles(files, repoUrl);

    const dockerfile = generateDockerfile(detectedStack);
    const workflow = generateWorkflow(detectedStack);
    const kubernetesYaml = generateKubernetesYaml(detectedStack);
    const terraform = generateTerraform(detectedStack);
    const deploymentInstructions = generateDeploymentInstructions(detectedStack);
    const deploymentSuggestion = generateDeploymentSuggestion(detectedStack);

    const aiRecommendation = await generateAiRecommendation({
      repoUrl,
      detectedStack,
      dockerfile,
      workflow,
      kubernetesYaml,
    });

    const analysis = await Analysis.create({
      repoUrl,
      detectedStack,
      dockerfile,
      workflow,
      kubernetesYaml,
      terraform,
      deploymentInstructions,
      deploymentSuggestion,
      aiRecommendation,
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error("Analyze route error:", error.message);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/analyses", async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(analyses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

import archiver from "archiver";

/**
 * Download DevOps deployment package
 */
router.post("/download", async (req, res) => {

  try {

    const {
      dockerfile,
      workflow,
      kubernetesYaml,
      terraform,
      deploymentInstructions
    } = req.body;

    res.attachment("devops-package.zip");

    const archive = archiver("zip");

    archive.pipe(res);

    archive.append(dockerfile, { name: "Dockerfile" });

    archive.append(workflow, { name: ".github/workflows/ci.yml" });

    archive.append(kubernetesYaml, { name: "deployment.yaml" });

    archive.append(terraform, { name: "main.tf" });

    archive.append(deploymentInstructions, { name: "deploy.sh" });

    await archive.finalize();

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

export default router;