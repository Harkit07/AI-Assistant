import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import axios from "axios";

function Sidebar() {
  const {
    token,
    setToken,
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getAllThreads = async () => {
    if (!token) {
      setAllThreads([]);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/thread`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status == 200) {
        const filteredData = response.data.map((thread) => ({
          threadId: thread.threadId,
          title: thread.title,
        }));

        setAllThreads(filteredData);
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId, token]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setIsMobileOpen(false);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setIsMobileOpen(false);
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/thread/${newThreadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPrevChats(response.data);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error("Failed to change thread:", err);
    }
  };

  const deleteThread = async (threadId) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/thread/${threadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );
      if (threadId === currThreadId) createNewChat();
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  return (
    <>
      <style>{`
        /* ── Mobile hamburger toggle button ── */
        .sidebar-toggle {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 200;
          background: #171717;
          border: 1px solid rgba(255,255,255,0.15);
          color: #b4b4b4;
          border-radius: 8px;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
        }

        /* ── Overlay for mobile ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 149;
        }

        /* ── Sidebar base ── */
        .sidebar-root {
          background: #171717;
          color: #b4b4b4;
          height: 100vh;
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }

        /* ── Tablet  (641px – 1023px) ── */
        @media (max-width: 1023px) {
          .sidebar-root {
            width: 260px;
          }
        }

        /* ── Mobile  (≤ 640px) ── */
        @media (max-width: 640px) {
          .sidebar-toggle {
            display: flex;
          }

          .sidebar-root {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            z-index: 150;
            transform: translateX(-100%);
          }

          .sidebar-root.open {
            transform: translateX(0);
          }

          .sidebar-overlay.open {
            display: block;
          }

          /* history list gets a bit more breathing room on small screens */
          .sidebar-history li {
            font-size: 0.8rem;
            padding-top: 4px;
            padding-bottom: 4px;
          }
        }
      `}</style>

      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsMobileOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <i className={`fa-solid ${isMobileOpen ? "fa-xmark" : "fa-bars"}`}></i>
      </button>

      {/* Click-outside overlay */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? "open" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <section className={`sidebar-root ${isMobileOpen ? "open" : ""}`}>
        <button
          onClick={createNewChat}
          className="flex justify-between items-center m-2.5 p-2.5 rounded-md bg-transparent border border-white/50 cursor-pointer"
        >
          <img
            src="/Img.png"
            alt="gpt logo"
            className="h-6.25 w-6.25 bg-white rounded-full object-cover"
          />
          <span className="text-xl">
            <i className="fa-solid fa-pen-to-square"></i>
          </span>
        </button>

        <ul className="sidebar-history history m-2.5 p-2.5 h-full">
          {allThreads?.map((thread, idx) => (
            <li
              key={idx}
              onClick={() => changeThread(thread.threadId)}
              className={`list-none cursor-pointer py-0.5 px-1.5 mb-1.5 text-sm border-10px border-transparent relative whitespace-nowrap overflow-hidden text-ellipsis
                ${thread.threadId === currThreadId ? "bg-white/5 rounded-[10px]" : ""}`}
            >
              {thread.title}
              <i
                className="fa-solid fa-trash opacity-0 absolute right-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(thread.threadId);
                }}
              ></i>
            </li>
          ))}
        </ul>

        <div className="p-2.5 m-2.5 text-sm text-center border-t border-white/50">
          <p>By Harkit Singh &hearts;</p>
        </div>
      </section>
    </>
  );
}

export default Sidebar;
