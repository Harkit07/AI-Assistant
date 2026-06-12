import "./Sidebar.css";
import { useState, useEffect, useCallback, memo } from "react";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { v1 as uuidv1 } from "uuid";
import axios from "axios";

function Sidebar() {
  const { token, setToken } = useAuth();
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setCurrThreadId,
    setPrevChats,
  } = useChat();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getAllThreads = useCallback(async () => {
    if (!token) {
      setAllThreads([]);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/thread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.status === 200) {
        const filteredData = response.data.map((thread) => ({
          threadId: thread.threadId,
          title: thread.title,
        }));
        setAllThreads(filteredData);
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setAllThreads([]);
      }
    }
  }, [token, setAllThreads, setToken]);

  useEffect(() => {
    getAllThreads();
  }, [getAllThreads]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setIsMobileOpen(false);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setIsMobileOpen(false);
    if (!token) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/thread/${newThreadId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPrevChats(response.data);
      setNewChat(false);
    } catch (err) {
      console.error("Failed to change thread:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  };

  const deleteThread = async (threadId) => {
    if (!token) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/thread/${threadId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );
      if (threadId === currThreadId) createNewChat();
    } catch (err) {
      console.error("Failed to delete thread:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  };

  return (
    <>
      <style>{`
        .sidebar-toggle { display: none; position: fixed; top: 12px; left: 12px; z-index: 200; background: #171717; border: 1px solid rgba(255,255,255,0.15); color: #b4b4b4; border-radius: 8px; width: 38px; height: 38px; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 149; }
        .sidebar-root { background: #171717; color: #b4b4b4; height: 100vh; width: 260px; display: flex; flex-direction: column; z-index: 150; border-right: 1px solid rgba(255,255,255,0.05); transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
        @media (max-width: 640px) { .sidebar-toggle { display: flex; } .sidebar-overlay.open { display: block; } .sidebar-root { position: fixed; top: 0; left: 0; transform: translateX(-100%); } .sidebar-root.open { transform: translateX(0); } }
      `}</style>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-label="Toggle sidebar navigation panel"
      >
        <i className="fa-solid fa-bars" />
      </button>

      <div
        className={`sidebar-overlay ${isMobileOpen ? "open" : ""}`}
        onClick={() => setIsMobileOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Close sidebar menu overlay"
      />

      <div className={`sidebar-root ${isMobileOpen ? "open" : ""}`}>
        <button
          type="button"
          onClick={createNewChat}
          className="m-3.5 p-3 flex items-center justify-between border border-white/10 rounded-lg bg-transparent text-white text-sm hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=user"
              alt="Model Logo"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="font-medium text-white/80">New Chat</span>
          </div>
          <span className="text-xl">
            <i className="fa-solid fa-pen-to-square" />
          </span>
        </button>

        <div className="sidebar-history history m-2.5 p-2.5 h-full overflow-y-auto">
          {allThreads?.map((thread) => (
            <div
              key={thread.threadId}
              onClick={() => changeThread(thread.threadId)}
              role="button"
              tabIndex={0}
              aria-label={`Switch context window thread to ${thread.title}`}
              className={`cursor-pointer py-2 px-3 mb-1.5 text-sm border border-transparent relative whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-between rounded-[10px] group transition-colors hover:bg-white/5
                ${thread.threadId === currThreadId ? "bg-white/5 text-white" : "text-white/60"}`}
            >
              <span className="truncate pr-4">{thread.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
                aria-label={`Delete chat thread ${thread.title}`}
                className="opacity-0 group-hover:opacity-100 bg-transparent border-none text-white/40 hover:text-white transition-opacity cursor-pointer p-1"
              >
                <i className="fa-solid fa-trash text-xs" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-2.5 m-2.5 text-sm text-center border-t border-white/5 text-white/30 select-none">
          © 2026 Assistant Layer
        </div>
      </div>
    </>
  );
}

export default memo(Sidebar);
