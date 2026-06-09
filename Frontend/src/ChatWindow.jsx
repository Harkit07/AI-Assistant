import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import Login from "./LoginTemp.jsx";
import axios from "axios";
import { toast } from "react-toastify";

function ChatWindow() {
  const {
    token,
    setToken,
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currPrompt, setCurrPrompt] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const fetchThreadHistory = async () => {
      if (!currThreadId || !token) return;
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
          setPrevChats([]);
          setNewChat(true);
        }
      }
    };
    fetchThreadHistory();
  }, [currThreadId, token, setPrevChats, setNewChat]);

  const getReply = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      toast.info("Please login to start chatting!");
      setShowLogin(true);
      return;
    }
    if (loading || !prompt.trim()) return;

    setLoading(true);
    setNewChat(false);
    setCurrPrompt(prompt);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/chat`,
        { message: prompt, threadId: currThreadId },
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );
      if (response.data?.reply) {
        setReply(response.data.reply);
      } else {
        toast.error("Failed to get reply");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || "Network error. Please try again.",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currPrompt && reply) {
      setPrevChats((prev) => [
        ...prev,
        { role: "user", content: currPrompt },
        { role: "assistant", content: reply },
      ]);
      setPrompt("");
      setLoading(false);
    }
  }, [reply]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

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
        setPrevChats([]);
        setNewChat(true);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-[#212121] h-screen w-full flex flex-col justify-between items-center text-center overflow-hidden">
      <Login visible={showLogin} setVisible={setShowLogin} />

      {/* Navbar */}
      <div className="w-full flex justify-between items-center pl-14 md:pl-0">
        <span className="m-4 mx-4 md:mx-8 text-sm md:text-base">
          ChatGPT <i className="fa-solid fa-chevron-down" />
        </span>

        <div
          className="relative m-4 mx-4 md:mx-8"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((v) => !v);
          }}
        >
          <span className="bg-[#339cff] h-6 w-6 rounded-full flex items-center justify-center cursor-pointer">
            <i className="fa-solid fa-user text-xs" />
          </span>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-9 right-0 w-36 bg-[#323232] px-2 py-1.5 rounded-md text-left z-1000 shadow-md">
              {!token ? (
                <div
                  className="text-sm my-1.5 py-2 px-0.5 cursor-pointer hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLogin(true);
                    setIsOpen(false);
                  }}
                >
                  <i className="fa-regular fa-user mr-1" /> Login/Signup
                </div>
              ) : (
                <div
                  className="text-sm my-1.5 py-2 px-0.5 cursor-pointer hover:text-white transition-colors"
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket mr-1" />{" "}
                  Log out
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <Chat showLogin={showLogin} setShowLogin={setShowLogin} />

      <ScaleLoader color="#fff" loading={loading} />

      {/* Input area */}
      <div className="w-full flex flex-col justify-center items-center pb-2 px-3 md:px-6">
        <div className="w-full max-w-[95%] md:max-w-2xl lg:max-w-175 relative flex justify-between items-center">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && getReply()}
            disabled={loading}
            className="w-full"
          />
          <div
            id="submit"
            onClick={getReply}
            className="cursor-pointer h-9 w-9 text-xl absolute right-3 flex items-center justify-center"
          >
            <i className="fa-solid fa-paper-plane" />
          </div>
        </div>

        <p className="text-[10px] md:text-xs py-2 px-2 text-[#b4b4b4] text-center">
          ChatGPT can make mistakes. Check important info. See Cookie
          Preferences.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
