markdown

# 🤖 AI Assistant — Full Stack ChatGPT Clone

A production-ready full-stack AI chat application built with the MERN stack and OpenAI API. Supports multi-turn conversations, persistent chat history, per-user thread management, and a responsive UI with Markdown rendering — frontend deployed on Render, backend deployed on Netlify.

🔗 **Live Demo:** [ai-assistant-nsg8.onrender.com](https://ai-assistant-nsg8.onrender.com/) · **GitHub:** [github.com/Harkit07/AI-Assistant](https://github.com/Harkit07/AI-Assistant.git)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Docker Support](#docker-support)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Workflow](#cicd-workflow)

---

## ✨ Features

- 🧠 **Multi-Turn Conversations** — Full conversation context sent with every request for coherent AI responses
- 💾 **Persistent Chat History** — All chats stored in MongoDB and restored on login across sessions
- 🗂️ **Thread Management** — Users can create, switch between, and delete individual chat threads
- 🔐 **JWT Authentication** — Secure signup, login, and session handling with JSON Web Tokens
- 🛡️ **Protected API Routes** — All chat and user endpoints secured with JWT middleware
- 📝 **Markdown Rendering** — AI responses rendered with full Markdown support including syntax-highlighted code blocks
- ⚡ **Global State with Context API** — Chat, sidebar, and auth state managed via React Context — no prop drilling
- 📱 **Fully Responsive UI** — Sidebar + chat layout optimized for mobile, tablet, and desktop
- 🚀 **Independent Deployment** — Frontend deployed on Render, backend deployed on Netlify (serverless functions)

---

## 🛠️ Tech Stack

### Frontend

| Technology        | Purpose                              |
| ----------------- | ------------------------------------ |
| React.js          | UI framework                         |
| Tailwind CSS      | Utility-first styling                |
| React Context API | Global state (auth, chats, sidebar)  |
| React Markdown    | Rendering AI responses with Markdown |
| Axios             | HTTP client for API requests         |

### Backend

| Technology             | Purpose                           |
| ---------------------- | --------------------------------- |
| Node.js + Express.js   | Web server & REST API             |
| MongoDB + Mongoose ODM | Database & schema modeling        |
| JWT (jsonwebtoken)     | Authentication & route protection |
| Bcrypt                 | Password hashing                  |
| OpenAI API             | AI chat completions               |

---

## 📁 Project Structure

AI-Assistant/
├── backend/
│   ├── models/
│   │   ├── user.js
│   │   ├── thread.js
│   │   └── blacklistToken.js
│   │
│   ├── routes/
│   │   ├── user.js
│   │   └── chat.js
│   │
│   ├── services/
│   │   ├── validationResult.js
│   │   └── user.js
│   │
│   ├── middleware.js
│   ├── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── Sidebar.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Login.jsx
│   │   ├── MyContext.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── netlify/
│   └── functions/
│       └── server.js
│
├── k8s/
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   └── secrets.yaml
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── README.md
└── .gitignore

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **MongoDB** database ([MongoDB Atlas](https://www.mongodb.com/atlas) recommended)
- An **OpenAI API key** from [platform.openai.com](https://platform.openai.com)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd Backend

# 2. Install dependencies
npm install

# 3. Create your environment file
touch .env
# Fill in the required variables (see Environment Variables below)

# 4. Start the backend server
node server.js
Backend will be available at http://localhost:8080.

Frontend Setup
bash
# 1. Navigate to the frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Create your environment file
touch .env
# Set VITE_API_URL to your backend URL

# 4. Start the development server
npm run dev
Frontend will be available at http://localhost:5173.

🔐 Environment Variables
Backend .env
env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-assistant

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Server
PORT=8080
Frontend .env
env
VITE_API_URL=https://your-netlify-site.netlify.app/api
📡 API Routes
Auth — /user
Method	Route	Auth	Description
POST	/user/signup	❌	Register a new user
POST	/user/login	❌	Login and receive JWT
GET	/user/profile	✅	Get user profile
GET	/user/logout	✅	Logout a user
Chat — /api
Method	Route	Auth	Description
GET	/api/thread	✅	Get all threads
GET	/api/thread/:threadId	✅	Get a message in a thread
DELETE	/api/thread/:threadId	✅	Delete a thread
POST	/api/chat	✅	Send a message and receive AI response
🚢 Deployment
Frontend and backend are deployed independently — frontend on Render, backend on Netlify.

Backend (Netlify — Serverless Functions)

The Express app is wrapped with serverless-http to run as a Netlify Function

Build command: npm install

Functions directory: netlify/functions

Add all backend environment variables in the Netlify dashboard under Site Settings → Environment Variables

API base path: /.netlify/functions/server/api/...

netlify.toml (place in Backend/ root):

toml
[build]
  command = "npm install"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
netlify/functions/server.js — export handler alongside your existing code:

js
const serverless = require("serverless-http");
// ... existing Express app setup ...
module.exports.handler = serverless(app);
Frontend (Render — Static Site)

Build command: npm run build

Publish directory: dist

Set VITE_API_URL to your Netlify backend URL:

env
VITE_API_URL=https://your-netlify-site.netlify.app/api
🐳 Docker Support
The application is fully containerized using Docker, allowing consistent development and deployment across environments.

Backend Dockerfile
dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
Frontend Dockerfile
dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
Build Images
bash
# Backend
docker build -t ai-assistant-backend ./Backend

# Frontend
docker build -t ai-assistant-frontend ./Frontend
Run Containers
bash
docker run -p 8080:8080 ai-assistant-backend
docker run -p 5173:80 ai-assistant-frontend
☸️ Kubernetes Deployment
The application is deployed on Kubernetes using Deployments, Services, Secrets, and NGINX Ingress Controller.

Kubernetes Architecture
text
Internet
    │
    ▼
NGINX Ingress
    │
 ┌──┴─────────────┐
 ▼                ▼
Frontend      Backend
Service       Service
    │            │
    ▼            ▼
Frontend Pods  Backend Pods
                   │
                   ▼
             MongoDB Atlas
Components
Deployments
Frontend Deployment

Multiple replicas for high availability

Serves React production build through Nginx

Backend Deployment

Multiple replicas for load balancing

Connects to MongoDB Atlas and OpenAI API

Services
yaml
frontend-service
backend-service
Expose frontend and backend pods internally within the cluster.

Secrets
Sensitive credentials are stored securely using Kubernetes Secrets:

yaml
OPENAI_API_KEY
MONGODB_URI
JWT_SECRET
NODE_ENV
CLIENT_URL
Apply:

bash
kubectl apply -f secrets.yaml
Deploy Application
bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
Verify:

bash
kubectl get deployments
kubectl get pods
kubectl get services
🌐 Ingress Configuration
NGINX Ingress Controller is used to expose frontend and backend through a single domain.

Ingress Rules
yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: ai-assistant.local
      http:
        paths:
          - path: /user
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 8080

          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 8080

          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
Apply:

bash
kubectl apply -f ingress.yaml
Enable NGINX Ingress
bash
minikube addons enable ingress
Start Tunnel
bash
minikube tunnel
Configure Local Host
Add the following entry to your hosts file:

text
127.0.0.1 ai-assistant.local
Access Application
text
http://ai-assistant.local
Requests are automatically routed:

text
/          → Frontend Service
/user/*    → Backend Service
/api/*     → Backend Service
⚙️ CI/CD Workflow
The project uses GitHub Actions to automatically build and push Docker images on every push to the main branch.

Workflow File: .github/workflows/deploy.yml
yaml
name: AI Assistant CI/CD

on:
  push:
    branches:
      - main

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v4
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./Backend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/ai-assistant-backend:latest

      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./Frontend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/ai-assistant-frontend:latest
How It Works
On every git push to the main branch, the workflow is triggered.

The code is checked out.

Docker Hub login is performed using secrets (DOCKER_USERNAME, DOCKER_PASSWORD) stored in GitHub repository settings.

Docker Buildx is set up for multi-platform builds.

Backend Docker image is built from ./Backend and pushed to Docker Hub as <your-dockerhub>/ai-assistant-backend:latest.

Frontend Docker image is built from ./Frontend and pushed to Docker Hub as <your-dockerhub>/ai-assistant-frontend:latest.

Note: The workflow currently only builds and pushes images. For automatic deployment to Kubernetes, you can extend it by adding a step that uses kubectl to apply updated manifests (e.g., with image pull policy Always or by updating the tag).

📈 Scalability & Production Features
Dockerized Microservice Architecture

Kubernetes Orchestration

Horizontal Scaling with Replicas

Secure Secret Management

NGINX Ingress Load Balancing

MongoDB Atlas Cloud Database

OpenAI API Integration

Environment-Based Configuration

Production-Ready Deployment Pipeline

Rolling Updates with Zero Downtime

👨‍💻 Author
Harkit Singh

📧 harkitsinghsran9584@gmail.com

📞 +91-8890436710

🌐 Portfolio

🐙 github.com/Harkit07

📝 License
This project is open source and free to use.
```
