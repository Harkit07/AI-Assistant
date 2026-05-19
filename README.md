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

```
AI-Assistant/
├── Backend/
│   ├── controllers/
│   │   ├── auth.js          # Signup & login logic
│   │   ├── chat.js          # Send message, get AI response
│   │   └── thread.js        # Create, fetch, delete threads
│   │
│   ├── models/
│   │   ├── user.js          # User schema (name, email, hashed password)
│   │   ├── thread.js        # Thread schema (title, owner, timestamps)
│   │   └── message.js       # Message schema (role, content, threadId)
│   │
│   ├── routes/
│   │   ├── auth.js          # /api/auth routes
│   │   ├── chat.js          # /api/chat routes
│   │   └── thread.js        # /api/threads routes
│   │
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   │
│   └── app.js               # Express app entry point
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx       # Thread list, new chat button
    │   │   ├── ChatWindow.jsx    # Message display area
    │   │   ├── MessageInput.jsx  # User input & send button
    │   │   └── MessageBubble.jsx # Individual message with Markdown
    │   │
    │   ├── pages/
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Signup.jsx        # Signup page
    │   │   └── Chat.jsx          # Main chat layout
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Auth state & token management
    │   │   └── ChatContext.jsx   # Threads & messages state
    │   │
    │   ├── api/
    │   │   └── axios.js          # Axios instance with base URL & auth headers
    │   │
    │   └── main.jsx              # React DOM entry point
    │
    └── index.html
```

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
node app.js
```

Backend will be available at `http://localhost:5000`.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Create your environment file
touch .env
# Set VITE_API_URL to your backend URL

# 4. Start the development server
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend `.env`

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-assistant

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Server
PORT=5000
```

### Frontend `.env`

```env
VITE_API_URL=https://your-netlify-site.netlify.app/api
```

---

## 📡 API Routes

### Auth — `/api/auth`

| Method | Route              | Auth | Description           |
| ------ | ------------------ | ---- | --------------------- |
| `POST` | `/api/auth/signup` | ❌   | Register a new user   |
| `POST` | `/api/auth/login`  | ❌   | Login and receive JWT |

### Threads — `/api/threads`

| Method   | Route              | Auth     | Description                      |
| -------- | ------------------ | -------- | -------------------------------- |
| `GET`    | `/api/threads`     | ✅       | Get all threads for current user |
| `POST`   | `/api/threads`     | ✅       | Create a new chat thread         |
| `DELETE` | `/api/threads/:id` | ✅ Owner | Delete a thread and its messages |

### Chat — `/api/chat`

| Method | Route                 | Auth | Description                      |
| ------ | --------------------- | ---- | -------------------------------- |
| `GET`  | `/api/chat/:threadId` | ✅   | Get all messages in a thread     |
| `POST` | `/api/chat/:threadId` | ✅   | Send a message & get AI response |

---

## 🚢 Deployment

Frontend and backend are deployed independently — frontend on **Render**, backend on **Netlify**.

**Backend (Netlify — Serverless Functions)**

- The Express app is wrapped with `serverless-http` to run as a Netlify Function
- Build command: `npm install`
- Functions directory: `.` (or wherever `app.js` is exported as `handler`)
- Add all backend environment variables in the Netlify dashboard under **Site Settings → Environment Variables**
- API base path: `/.netlify/functions/app/api/...`

**`netlify.toml`** (place in `Backend/` root):

```toml
[build]
  command = "npm install"
  functions = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/app/:splat"
  status = 200
```

**`app.js`** — export handler alongside your existing code:

```js
const serverless = require("serverless-http");
// ... existing Express app setup ...
module.exports.handler = serverless(app);
```

**Frontend (Render — Static Site)**

- Build command: `npm run build`
- Publish directory: `dist`
- Set `VITE_API_URL` to your Netlify backend URL:

```env
VITE_API_URL=https://your-netlify-site.netlify.app/api
```

---

## 👨‍💻 Author

**Harkit Singh**

- 📧 harkitsinghsran9584@gmail.com
- 📞 +91-8890436710
- 🌐 [Portfolio](https://portfolio-8zov.onrender.com)
- 🐙 [github.com/Harkit07](https://github.com/Harkit07)

---

## 📝 License

This project is open source and free to use.
