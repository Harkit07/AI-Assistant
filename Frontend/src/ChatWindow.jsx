import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { useState, useEffect, useRef, memo } from "react";
import { ScaleLoader } from "react-spinners";
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
    setPrevChats((prev) => [...prev, { role: "user", content: prompt }]);
    const userPrompt = prompt;
    setPrompt("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/chat`,
        { message: userPrompt, threadId: currThreadId },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      if (response.data?.reply) {
        setPrevChats((prev) => [
          ...prev,
          { role: "assistant", content: response.data.reply },
        ]);
      } else {
        toast.error("Failed to get reply");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        toast.info("Session expired. Please login again.");
        setShowLogin(true);
      } else {
        toast.error(
          err.response?.data?.error || "Network error. Please try again.",
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
    <div className="chatwindow-root flex flex-col justify-between items-center h-screen flex-1 w-full bg-[#212121] text-white relative">
      <div className="w-full flex justify-between items-center px-4 py-3 border-b border-white/5 bg-[#212121] relative z-40">
        <div className="text-sm font-medium text-white/40 font-sans tracking-wide ml-12 sm:ml-0">
          Model v1.0
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

      <ScaleLoader color="#fff" loading={loading} />

      <div className="w-full flex flex-col justify-center items-center pb-2 px-3 md:px-6">
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
