# ChatGPT Clone

A full-stack ChatGPT clone built with React and Node.js, featuring real-time AI responses, user authentication, and persistent chat history.

---

## Features

- **AI Chat** — Powered by a backend LLM integration with real-time typing animation
- **Authentication** — Login and signup with JWT-based auth stored in localStorage
- **Persistent Threads** — Chat history saved per user, organized by threads in the sidebar
- **Thread Management** — Create new chats, switch between threads, and delete old ones
- **Markdown Rendering** — AI responses rendered with syntax-highlighted code blocks
- **Protected Routes** — Unauthenticated users are prompted to log in before chatting
- **Toast Notifications** — User feedback for login, logout, errors, and more

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Markdown + rehype-highlight
- React Toastify
- UUID

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- express-validator

---

## Project Structure

```
ChatGPT/
├── Frontend/
│   └── src/
│       ├── App.jsx           # Root component, context provider
│       ├── MyContext.jsx     # Global state context
│       ├── Sidebar.jsx       # Thread list, create/delete chats
│       ├── ChatWindow.jsx    # Main chat UI, input, navbar
│       ├── Chat.jsx          # Message rendering with typing effect
│       └── Login.jsx         # Login/Signup modal
│
└── Backend/
    ├── index.js              # Entry point
    ├── middleware.js          # JWT auth middleware
    ├── models/
    │   ├── user.js           # User schema
    │   └── blacklistToken.js # Token blacklist schema
    ├── routes/
    │   └── user.js           # Auth routes
    ├── controllers/
    │   └── user.js           # Auth logic
    └── services/
        ├── wrapAsync.js
        └── validationResult.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- A `.env` file for both frontend and backend

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

Start the server:
```bash
npm start
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file:
```env
VITE_BASE_URL=http://localhost:8080
```

Start the dev server:
```bash
npm run dev
```

---

## Deployment

### Frontend (Render / Vercel / Netlify)
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- Set `VITE_BASE_URL` to your deployed backend URL

### Backend (Render)
- **Start Command:** `node index.js`
- Set all environment variables in the Render dashboard

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/user/signup` | Register a new user | No |
| POST | `/user/login` | Login and get token | No |
| GET | `/user/logout` | Logout and blacklist token | Yes |
| GET | `/user/profile` | Get current user | Yes |
| POST | `/api/chat` | Send a message and get AI reply | Yes |
| GET | `/api/thread` | Get all threads for user | Yes |
| GET | `/api/thread/:id` | Get messages in a thread | Yes |
| DELETE | `/api/thread/:id` | Delete a thread | Yes |

---

## Screenshots

> Add screenshots here

---

## Author

Made with ♥ by **Harkit Singh**

---

## License

This project is open source and available under the [MIT License](LICENSE).
