import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { useState, useEffect, useRef, memo } from "react";
import Login from "./Login.jsx";
import axios from "axios";
import { toast } from "react-toastify";

function ChatWindow() {
  const { token, setToken } = useAuth();
  const { prompt, setPrompt, currThreadId, setPrevChats, setNewChat, newChat } =
    useChat();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const isSendingRef = useRef(false);

  // Load thread history – skip if this is a brand new chat or if we are currently sending a message
  useEffect(() => {
    const fetchThreadHistory = async () => {
      if (!currThreadId || !token) return;
      // Don't fetch if it's a new chat or we're in the middle of sending a message
      if (newChat || isSendingRef.current) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/thread/${currThreadId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.status === 200) {
          setPrevChats(response.data);
          setNewChat(false);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // Thread doesn't exist yet – that's fine, treat as new chat
          setPrevChats([]);
          setNewChat(true);
          // Don't log as error to avoid console noise
          console.info(
            `Thread ${currThreadId} not found, treating as new chat.`,
          );
        } else if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          toast.info("Session expired. Please login again.");
          setShowLogin(true);
        } else {
          console.error("Failed to fetch thread history:", err);
        }
      }
    };
    fetchThreadHistory();
  }, [currThreadId, token, setPrevChats, setNewChat, setToken, newChat]);

  const streamChatReply = async (url, payload, config) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.error || "Network error. Please try again.");
      error.response = { status: response.status, data };
      throw error;
    }
    if (!response.body) {
      throw new Error("The server returned an empty response stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantReply = "";
    let completed = false;

    const finishMessage = () => {
      setPrevChats((prev) => {
        const updated = [...prev];
        const lastChat = updated[updated.length - 1];
        if (lastChat?.role === "assistant" && lastChat.streaming) {
          updated[updated.length - 1] = { ...lastChat, streaming: false };
        }
        return updated;
      });
    };

    const handleEvent = (frame) => {
      const data = frame
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("\n");
      if (!data) return;

      const event = JSON.parse(data);
      if (typeof event.token === "string") {
        assistantReply += event.token;
        setPrevChats((prev) => {
          const updated = [...prev];
          const lastChat = updated[updated.length - 1];
          if (lastChat?.role === "assistant" && lastChat.streaming) {
            updated[updated.length - 1] = {
              ...lastChat,
              content: assistantReply,
            };
          }
          return updated;
        });
      }
      if (event.error) {
        const error = new Error(event.error);
        error.code = event.code;
        error.response = {
          data: { error: event.error, code: event.code },
        };
        throw error;
      }
      if (event.done) completed = true;
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() || "";
        frames.forEach(handleEvent);
        if (done) break;
      }
      if (buffer.trim()) handleEvent(buffer);
      if (!completed) {
        throw new Error("The response stream ended unexpectedly.");
      }
    } catch (error) {
      finishMessage();
      throw error;
    }

    finishMessage();
    return { data: { reply: assistantReply, streamed: true } };
  };

  const getReply = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      toast.info("Please login to start chatting!");
      setShowLogin(true);
      return;
    }
    if (loading || !prompt.trim()) return;

    setLoading(true);
    isSendingRef.current = true;
    setNewChat(false); // first message -> this thread now has history

    // Add user message immediately
    setPrevChats((prev) => [
      ...prev,
      { role: "user", content: prompt },
      { role: "assistant", content: "", streaming: true },
    ]);
    const userPrompt = prompt;
    setPrompt("");

    try {
      const response = await streamChatReply(
        `${import.meta.env.VITE_BASE_URL}/api/chat`,
        { message: userPrompt, threadId: currThreadId },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      if (response.data?.reply && !response.data.streamed) {
        setPrevChats((prev) => [
          ...prev,
          { role: "assistant", content: response.data.reply },
        ]);
      } else if (!response.data?.streamed) {
        toast.error("Failed to get reply");
      }
    } catch (err) {
      setPrevChats((prev) => {
        const lastChat = prev[prev.length - 1];
        if (lastChat?.role !== "assistant" || !lastChat.streaming || lastChat.content) {
          return prev;
        }
        return prev.slice(0, -1);
      });
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        toast.info("Session expired. Please login again.");
        setShowLogin(true);
      } else if (
        ["RATE_LIMIT", "EMPTY_RESPONSE"].includes(
          err.code || err.response?.data?.code,
        )
      ) {
        toast.warning("Too many requests. Please wait a moment and try again.");
      } else {
        toast.error(
          err.response?.data?.error ||
            err.message ||
            "Network error. Please try again.",
        );
      }
    } finally {
      setLoading(false);
      // Delay resetting the sending flag to avoid immediate fetch
      setTimeout(() => {
        isSendingRef.current = false;
      }, 500);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/logout`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 200) {
        localStorage.removeItem("token");
        setToken(null);
        toast.success("Logout successful!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="chatwindow-root flex flex-col items-center h-screen min-h-0 flex-1 w-full bg-[#212121] text-white relative">
      <div className="w-full flex justify-between items-center px-4 py-3 border-b border-white/5 bg-[#212121] relative z-40">
        <div className="text-sm font-medium text-white/40 font-sans tracking-wide ml-12 sm:ml-0">
          Model v2.0
        </div>
        <div className="relative">
          <div
            className="flex items-center justify-center h-8 w-8 rounded-full cursor-pointer overflow-hidden border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            role="button"
            tabIndex={0}
            aria-label="Toggle user menu"
          >
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=user"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-2xl p-1.5 border border-white/5 bg-[#171717]">
              {token ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-normal text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Log out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className="w-full text-left px-3 py-2 text-xs font-normal text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Log in
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Chat />

      <div className="w-full flex flex-col justify-center items-center pt-3 pb-2 px-3 md:px-6 shrink-0">
        <div className="w-full max-w-[95%] md:max-w-2xl lg:max-w-175 relative flex justify-between items-center">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && getReply()}
            disabled={loading}
            className="w-full"
            aria-label="Chat prompt input"
          />
          <button
            type="button"
            id="submit"
            onClick={getReply}
            aria-label="Send prompt"
            disabled={loading}
            className="cursor-pointer h-9 w-9 text-xl absolute right-3 flex items-center justify-center bg-transparent border-none text-[#b4b4b4] hover:text-white transition-colors"
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
        <p className="text-[10px] md:text-xs py-2 px-4 text-center text-white/20 font-light select-none tracking-wide">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>

      <Login visible={showLogin} setVisible={setShowLogin} />
    </div>
  );
}

export default memo(ChatWindow);
